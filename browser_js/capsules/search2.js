class Search extends Capsule{

    init(width,height){
        super.init(width,height);

        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(0,0,width,height);

        this.title = "search.exe"

        this.registerInputEvent("mousemove",(e)=>this.onmousemove(e));
        this.registerInputEvent("mousedown",(e)=>this.onmousedown(e));
        this.registerInputEvent("keyup",(e)=>this.onkeyup(e));

        this.input = [];
        this.search_results = [];

        this.draw();
    }

    onUpdate(){
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.draw();
    }

    oneStep(){
        this.draw();
    }

    draw(){
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(0,0,this.width,this.height);

        //input
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(10,15,this.width-(10*2),15);

        this.ctx.font = "15px monospace";
        this.ctx.fillStyle = "#000000"
        let x = 5;
        let y = 15;
        this.ctx.fillText(`>${this.input}`, x, y);

        y = 40;
        let line = 0;
        for(let file of this.search_results){

            if(line == this.mouseOnLine){
                this.ctx.fillStyle = "#777777"
                this.ctx.fillRect(0,y-10,this.canvas.width,15);
            }

            this.ctx.fillStyle = "#FFFFFF"
            if(file.published){
                this.ctx.fillStyle = "#009900";
                if(line == this.mouseOnLine){
                    this.ctx.fillStyle = "#003300"
                }
            }

            this.ctx.fillText(`${file.name} [${file.hoster}]`, x, y);
            y += 15;
            line++;
        }
    }


    busStops = {};
    processBusMsg(data){
    console.log('search bus', data)
        data.ticket_id = data.ticket_id.split(' ')[1];
        //ws.send(JSON.stringify({type: 'SEARCH_RES', file_name: file_name, file_hosters: file_hosters, ticket_id: `${win_uuid} res`}));
        if(data.ticket_id != 'res'){
            return;
        }

        this.search_results = [];
        for(let h of data.file_hosters){
            this.search_results.push({name: data.file_name, hoster: h});
        }
    }

    mouseOnLine = -1;

    onmousemove(e){
        this.mouseOnLine = -1;
        if(e.posY > 1 && e.posX>0&&e.posX<this.width){
            this.mouseOnLine = Math.floor((e.posY-43)/15);
        }
        this.draw();
    }

    onmousedown(e){
        if(this.mouseOnLine>-1){

            let ticket_id = (Math.random() + 1).toString(36).substring(2);

            let files = this.search_results;
            let fileNum = 0;
            let file = null;
            for(let idx in files){
                if(fileNum == this.mouseOnLine){
                    file = files[idx];
                    break;
                }
                fileNum++;
            }
            if(!file){
                return;
            }

            this.busStops[ticket_id] = (data)=>{

                switch(data.selection_id){
                    case 0:
                        console.log("open");
                        window.parent.storage.getFile(file.uuid,(capsule)=>{
                            this.openCapsule(capsule);
                        });
                    break;
                }
                this.draw();
            }

            let selection = ["Open"];

            this.createSelection(50,e.clickX,e.clickY,"'???'",selection,`'${uuid} ${ticket_id}'`);
        }
        
    }


    onkeyup(e){
        if(['Shift','Alt','Meta','Control','Dead'].indexOf(e.key)!=-1){
            return;
        }

        if(e.key == 'Backspace'){
            if(this.input.length<=2){
                return;
            }
            this.input.pop();
            this.draw();
            return;
        }
        if(e.key == 'Enter'){
            window.parent.postMessage({uuid: uuid, op: "SEARCH_FILE", file_name: this.input.join('')},'*'); 
            this.input = [];
            return;
        }
        this.input.push(e.key);
        this.draw();
    }



    getImageData(){
        return this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);
    }

}

const capsule = new Search();
capsule.init(320,200);
capsule.run();