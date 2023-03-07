const screen = {


    setSize(width,height){
        this.canvas.width = width;
        this.canvas.height = height;
    },


    init(width, height){
        console.log("intializing screen...");

        document.body.style = "margin: 0px;"
        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute('tabindex',1);
        this.canvas.setAttribute('style', 'outline:none');
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.id = "canvas";
        document.getElementById("screen-holder").innerHTML = "";
        document.getElementById("screen-holder").appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext("2d");

        this.canvas.addEventListener('mousedown', (e)=>{
            this.onmousedown(e);
        })
        this.canvas.addEventListener('mouseup', (e)=>{
            this.onmouseup(e);
        })
        this.canvas.addEventListener('mousemove', (e)=>{
            this.onmousemove(e);
        })

        this.canvas.addEventListener('keyup', (e)=>{
            this.onkeyup(e);
        })

        window.addEventListener('message', (e)=>{

            switch(e.data.op){

                case 'CAPSULE_CANVAS':
                    if(e.source != null){
                        this.processes.set(e.source, {...this.processes.get(e.source), canvas: e.data});
                    }
                break;

                case 'READY_TO_DRAW':
                    this.processes.set(e.source, {...this.processes.get(e.source), zIndex: this.zMax++, canvas: e.data, drawable: true});
                    this.win_focussed = e.source;
                break;

                //UI
                case 'REQUEST_SELECTOR':
                    this.loadUIScript('select', e.data.uuid, e.data.params);
                break;
                
                case 'REQUEST_TEXTINPUT':
                    this.loadUIScript('textinput', e.data.uuid, e.data.params);
                break;

                case 'CLOSE':
                    this.destroyWindow(e.source);
                break;

                case 'SIGN_FILE':
                    if(!this.processes.get(e.source).trusted){
                        break;
                    }
                    this.signFile(e.data.f_uuid);
                break;

                
                case 'BUS':
                    this.processBusMessage(e.data);
                break;


                case 'RUN_LOCAL_FILE_TRUSTED':
                    if(!this.processes.get(e.source).trusted){
                        break;
                    }
                    this.db.fetch({f_uuid:e.data.f_uuid,onfetch:(res)=>{this.loadTrustedScript(res)}});
                break;
            
                case 'RUN_LOCAL_FILE':
                    this.db.fetch({f_uuid:e.data.f_uuid,onfetch:(res)=>{this.loadScript(res)}});
                break;


                case 'RUN_CAPSULE_TRUSTED':
                    if(!this.processes.get(e.source).trusted){
                        break;
                    }
                    this.loadTrustedScript(e.data.capsule);
                break;
            
                case 'RUN_CAPSULE':
                    this.loadScript(e.data.capsule);
                break;

                case 'SAVE_CAPSULE':
                    this.db.save(e.data.capsule,()=>{
                        
                    })
                break;


                //NETWORK

                case 'SEARCH_FILE':
                    //sendWSMessage({type: e.data.op, content:{uuid: e.data.uuid, file_name: e.data.file_name}});
                    swarm.broadcast({channel_label:"SEARCH",search:e.data.file_name});
                break;

                case 'FETCH_REMOTE':
                    this.fetchRemote(e.data.url);
                break;

                case 'RTC_SEND_TO_SERVER':
                    RTC_SEND_TO_SERVER(e.data.payload);
                break;

                case 'RTC_SEND_TO_LEECHERS':
                    RTC_SEND_TO_LEECHERS(e.data.payload);
                break;

                case 'FROM_RTC':
                    this.sendToAllProcessesWithName(e.data.payload);
                break;

                
                //TO DB
                case 'ASK_DB':
                    console.log('asking storage?',e)
                    if(!this.processes.get(e.source).trusted){
                        break;
                    }
                    console.log('asking s',e.data)

                    this.db[e.data.action].call(this.db, e.data);

                break;

            }
           
        })


        this.db = new Database('screen');

        console.log("done");

    },



    signFile(f_uuid){
        this.db.fetch({f_uuid:f_uuid, onfetch: async (data)=>{
            delete data.signature;
            let signature = await identity.sign(JSON.stringify(data));
            data.signature = {public_key:identity.ident.public_key, signature: signature}
            this.db.save(data);
        }})
    },

    verifyFile(capsule){
        if(!capsule.signature){

        }
    },
/*
    sendToAllProcessesWithName(payload){

        let alive = [];
        for(let uuid of this.urls_to_uuids.get(payload.file_url) || []){
            if(this.processes.has){
                this.processes[uuid].postMessage(payload, '*');
                alive.push(uuid);
            }
        }
        this.urls_to_uuids.set(payload.file_url,alive);

    },
*/
    //TODO rework
    fetchRemote(url){
        //request_queue.push({url: url, status: 'init'});
        dns.requestLookup(url);
        console.log("wat");
    },

    processBusMessage(data){
        console.log('bussin',data)
        if(!data.ticket_id){
            return;
        }

        let target_uuid = data.ticket_id.split(' ')[0];

        if(target_uuid == screen_uuid){
            this.processPersonalBus(data);
            return;
        }
        else if(target_uuid == 'all'){
console.log('HUH')
            for(let proc_win in this.processes.keys()){
                proc_win.postMessage(data, '*');
            }
            return;
        }
        else if(target_uuid == 'trusted'){
            
            for(let proc of this.processes.values()){        
                if(proc.trusted){
                    proc.window.postMessage(data, '*');
                }
            }
            return;
        }
        //this.processes[target_uuid].postMessage(data, '*');
        for(let proc of this.processes.values()){
            if(proc.id == target_uuid){
    console.log('found target', data)
                proc.window.postMessage(data, '*');
            }
        }
    },

    processPersonalBus(data){
        console.log('personal love letter', data);

        let ticket_id = data.ticket_id.split(' ')[1];
        switch(ticket_id){
            case 'context':
                switch(data.selection_id){
                    case 0:
                        fetch("browser_js/capsules/explorer.js").then((res)=> res.text()).then(res => {
                            screen.loadTrustedScript({script: res, meta:{ name:'explorer.exe', type:'capsule'}});
                        })
                    break;

                    case 1:
                        fetch("browser_js/capsules/search2.js").then((res)=> res.text()).then(res => {
                            screen.loadTrustedScript({script: res, meta:{ name:'search.exe', type:'capsule'}});
                        })
                    break;

                    case 2:
                        fetch("browser_js/capsules/dummy.js").then((res)=> res.text()).then(res => {
                            screen.loadScript({script: res, meta:{ name:'dummy.exe', type:'capsule'}});
                        })
                    break;

                    case 3:
                        fetch("browser_js/capsules/chat.js").then((res)=> res.text()).then(res => {
                            screen.loadScript({script: res, meta:{ name:'chat.exe', type:'capsule'}});
                        })
                    break;

                    case 4:
                        fetch("browser_js/capsules/identity.js").then((res)=> res.text()).then(res => {
                            screen.loadTrustedScript({script: res, meta:{ name:'identity.exe', type:'capsule'}});
                        })
                    break;
                    case 5:
                        fetch("browser_js/capsules/friends.js").then((res)=> res.text()).then(res => {
                            screen.loadTrustedScript({script: res, meta:{ name:'identity.exe', type:'capsule'}});
                        })
                    break;
                }
            break;


            case 'burger':
                console.log("asdf", data);
                let iframe = document.getElementById(data.ticket_id.split(' ')[2]);
                iframe.contentWindow.postMessage({op:'BUS', burger:data}, '*');
                
            break;
        }
    },


    loadScript(capsule){

        let uuid = (Math.random() + 1).toString(36).substring(2);
        fetch("capsule.html").then((res)=>res.text()).then((html)=>{
            html = html.replace("!!!uuid!!!",`'${uuid}'`);
            html = html.replace("!!!DATA!!!",encodeURIComponent(JSON.stringify(capsule)));

            //create the fucking iframe
            const iframe = document.createElement('iframe');
            iframe.srcdoc = html;
            iframe.id = uuid;
            iframe.sandbox = 'allow-scripts';
            iframe.style = "position:absolute; top:0; left:0;z-index:-1;"

            document.body.appendChild(iframe);
            iframe.addEventListener('load',()=>{
                this.processes.set(iframe.contentWindow, {capsule: capsule, id: uuid, window: iframe.contentWindow, iframe: iframe, trusted: false, drawable: false});
                iframe.contentWindow.postMessage({op:'INJECT', payload: capsule.script},'*');
    
            })
        });


    },
    
    loadTrustedScript(capsule){
        let uuid = (Math.random() + 1).toString(36).substring(2);
        fetch("capsule.html").then((res)=>res.text()).then((html)=>{
            html = html.replace("!!!uuid!!!",`'${uuid}'`);
            html = html.replace("!!!DATA!!!",encodeURIComponent(JSON.stringify(capsule)));

            //create the fucking iframe
            const iframe = document.createElement('iframe');
            iframe.srcdoc = html;
            iframe.id = uuid;
            iframe.style = "position:absolute; top:0; left:0;z-index:-1;"

            document.body.appendChild(iframe);
            iframe.addEventListener('load',()=>{
                this.processes.set(iframe.contentWindow, {capsule: capsule, id: uuid, window: iframe.contentWindow, iframe: iframe, trusted: true, drawable: false});
                iframe.contentWindow.postMessage({op:'INJECT', payload: capsule.script},'*');
    
            })
        });

    },

    loadUIScript(type, uuid, params){

        let url = "";
        switch(type){
            case 'select':
                url = "browser_js/capsules/ui/select.js";

                fetch(url).then((res)=>res.text()).then((js_src)=>{
                    js_src += `const select = new Selector(); 
                    select.init(${params.width},${params.x},${params.y},${params.title},'${JSON.stringify(params.selections)}',${params.ticket_id});`
                    this.loadTrustedScript({script: js_src});
                })
            break;

            case 'textinput':
                url = "browser_js/capsules/ui/textinput.js";
                fetch(url).then((res)=>res.text()).then((js_src)=>{
                    js_src += `const text = new TextInput(); 
                    text.init(${params.width},${params.x},${params.y},${params.title},${params.ticket_id});`
                    this.loadTrustedScript({script: js_src});
                })
            break;
        }

    },


    processes: new Map(),
    zMax: 0,

    destroyWindow(win){
        document.getElementById(this.processes.get(win).id).remove();

        this.processes.delete(win)

        if(this.win_dragging == win){
            this.win_dragging = null;
        }
        if(this.win_resizing == win){
            this.win_resizing = null;
        }
        this.win_focussed = null;
    
    },
    
    draw(){

        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);


        //let zSorted = Object.keys(this.runningWindows).sort((a,b)=>{return this.zIndex[a]-this.zIndex[b]

        let zSorted = new Map([...this.processes].sort((a,b)=>{return a[1].zIndex-b[1].zIndex}));

        let i = 0;
        for(let window of zSorted.values()){
            if(!window.drawable){
                continue;
            }

            let win = window.canvas;

            if(win.imageData == null){
                continue;
            }
            this.ctx.putImageData(win.imageData, win.pos.x, win.pos.y);
            this.drawWindowManager(win.pos);

            i++;
        }

        
    },

    drawWindowManager(pos){
        
        //border
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'grey';
        this.ctx.strokeRect(pos.x, pos.y, pos.width, pos.height);

        //top border
        this.ctx.fillStyle = 'grey';
        this.ctx.fillRect(pos.x, pos.y-2, pos.width, 15);

        //right bottom corner
        this.ctx.fillRect(pos.x+pos.width-15, pos.y+pos.height-15, 15, 15);


        //top left
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(pos.x+2, pos.y, 12, 12);

        //top right
        this.ctx.fillStyle = 'darkgrey';
        this.ctx.fillRect(pos.x+pos.width-(15), pos.y, 12, 12);
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(pos.x+pos.width-(15), pos.y+1, 12, 1);
        this.ctx.fillRect(pos.x+pos.width-(15), pos.y+5, 12, 1);
        this.ctx.fillRect(pos.x+pos.width-(15), pos.y+9, 12, 1);

        //title
        this.ctx.fillStyle = 'black';
        this.ctx.font = "12px Monospace";
        this.ctx.fillStyle = "#000000"
        this.ctx.fillText(pos.title, pos.x+20, pos.y+9, pos.width-30);
        
    
    },


    win_dragging: null,
    win_resizing: null,
    win_focussed: null,

    onmousedown(e){
        const x = e.clientX - this.canvas.offsetLeft;
        const y = e.clientY - this.canvas.offsetTop;
        console.log(x,y);

        

        let zSorted = new Map([...this.processes].sort((a,b)=>{return b[1].zIndex-a[1].zIndex}));


        let offclicks = 0;
        let hit = false;
        

        for(let [win_key, content] of zSorted){
            //let win = this.runningWindows[win_uuid].pos;
            
            let win = content.canvas.pos;

            if(x > win.x && x < win.width+win.x && y > win.y && y < win.height+win.y && !hit){
                console.log('clicked window');
                hit = true;
                if(this.win_focussed != win_key){
                    this.win_focussed = win_key;
                    let tmp = this.processes.get(win_key);
                    tmp.zIndex = this.zMax++;
                    this.processes.set(win_key,tmp);
                    
                }
                else{
                    win_key.postMessage({op: 'TAKEINPUT', type: 'mousedown', e:{clickX: x-win.x, clickY: y-win.y}}, '*');
                }

                //drag bar?
                if(win.y+15 > y){
                    console.log('hit top bar');
                    this.win_dragging = win_key;
                }

                if(win.x+15 > x && win.y+15 > y){
                    console.log('hit red');
                    this.destroyWindow(win_key);
                    return;
                }

                if(win.x+win.width-15 < x && win.y+win.height-15 < y){
                    console.log('hit drag');
                    this.win_resizing = win_key;
                }


                if(win.x+win.width-12< x && win.y+12 > y){
                    console.log("burgir");
                    //let selections = ["Save", ...content.canvas.burgir];
                    let selections = [...content.canvas.burger];
                    window.postMessage({uuid: content.id, op: 'REQUEST_SELECTOR', params: {width: 50, x: x, 
                        y: y, title: "'burgir'", selections: selections, ticket_id: `'${screen_uuid} ${'burger'} ${content.id}'`}});
                }



                this.win_focussed = win_key;
                
            }
            else{
                //this.sendInput(win_key, 'offclick', {});
                win_key.postMessage({op: 'TAKEINPUT', type: 'offclick', e:{}}, '*');
                offclicks++;
            }
        }


        if(offclicks==zSorted.size){
            this.win_focussed = null;
        }
        //context menu
        if(this.win_focussed==null){
            this.loadUIScript('select',screen_uuid,{width:80, x:x, y:y, title:"':)'", selections:["explorer.exe","search.exe","dummy.exe","chat.exe","identity.exe","friends.exe"], ticket_id:`'${screen_uuid} context'`});
        }
    },

    onmousemove(e){

        const x = e.clientX - this.canvas.offsetLeft;
        const y = e.clientY - this.canvas.offsetTop;

        if(this.win_dragging){
            this.processes.get(this.win_dragging).canvas.pos.x += e.movementX;
            this.processes.get(this.win_dragging).canvas.pos.y += e.movementY;
            
            let toSend = Object.assign(this.processes.get(this.win_dragging).canvas.pos, {op: 'UPDATEPOS'});
            this.win_dragging.postMessage(toSend, '*');
        }

        if(this.win_resizing){
            this.processes.get(this.win_resizing).canvas.pos.width += e.movementX;
            this.processes.get(this.win_resizing).canvas.pos.height += e.movementY;
            let toSend = Object.assign(this.processes.get(this.win_resizing).canvas.pos, {op: 'UPDATEPOS'});
            this.win_resizing.postMessage(toSend, '*');
        }

        if(this.win_focussed){
            let win = this.processes.get(this.win_focussed).canvas.pos;
            this.win_focussed.postMessage({op: 'TAKEINPUT', type: 'mousemove', e:{movementX: e.movementX, movementY: e.movementY, posX: x-win.x, posY: y-win.y}}, '*');
        }
    },

    onmouseup(e){
        this.win_dragging = null;
        this.win_resizing = null;

        if(this.win_focussed){
            //this.sendInput(this.win_focussed,'mouseup',{});
            this.win_focussed.postMessage({op: 'TAKEINPUT', type: 'mouseup', e:{}}, '*');
        }
    },

    onkeyup(e){
        console.log(e);
        if(this.win_focussed){
            //this.sendInput(this.win_focussed,'keyup',{key:e.key});
            this.win_focussed.postMessage({op: 'TAKEINPUT', type: 'keyup', e:{key: e.key}}, '*');
        }
    },



    run(){

        for(let win of this.processes.keys()){
            win.postMessage({op: 'POSTCANVAS'}, '*');;
        }

        this.draw();
        setTimeout(()=>{
            this.run();
        },1000/30)
    },


    addFile(file, data){
        let capsule = autoCapsule.makeCapsule(data,file.type,file.name);
        this.db.save(capsule);
    },

    bindPaste(){

        document.addEventListener(('paste'), (event)=>{
            let items = event.clipboardData;
        
            for(let type of items.types){
                switch(type){
                    case 'text/plain':
                        console.log(items.getData(type));
                    break;

                    case 'Files':
                        for(let file of items.files){
                            console.log(file);

                            let reader = new FileReader();
                            reader.onload = (e) => {
                                console.log(e.target.result);
                                this.addFile(file, e.target.result);
                            }
                            reader.readAsDataURL(file);
                        }
                    break;
                }
            }
            return;
        });
    }

    
}

function startScreen(e){
    let msg = e.data;
    if(msg.op != "START_SCREEN"){
        return;
    }


    screen.init(msg.w,msg.h);
    screen.bindPaste();
    screen.run();

    if(msg.autoLoad){
        request_queue.push({url: msg.autoLoad, status: 'init'});
        console.log("eh")
    }

    let explorer = fetch("browser_js/capsules/explorer.js").then((res)=> res.text()).then(res => {
        screen.loadTrustedScript({script:res,meta:{ name:'explorer.exe', type:'capsule'}});
    })

    window.removeEventListener('message',startScreen);
}

window.addEventListener('message', startScreen);



window.addEventListener('DOMContentLoaded', ()=>{
    window.parent.postMessage({type:"SCREEN_READY"},"*");

})