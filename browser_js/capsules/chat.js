class Chat extends Capsule{

    init(width,height){
        super.init(width,height);

        this.show = false;

        this.data = JSON.parse(decodeURIComponent(document.getElementById('data').innerHTML));

        this.title = `${this.data.meta.name} [${this.data.meta.type}]`;


        this.channel = this.data.meta.name;

        this.text =  "welcome to the chat!\nhow to use:\either find a running chat app with search\nor save the chat with burger menu\nand rename/publish\nyou are now hosting a server :)\n\n\nwhen hosting a server, start client via search to chat\n\n";


        this.input = ['> '];

        this.draw();


        this.registerInputEvent("keyup",(e)=>this.onkeyup(e));


        window.addEventListener("message", (e)=>{
            if(e.data.op == "CHAT"){
                console.log("got chat msg???", e.data)
                if(e.data.from == 'client'){
                    window.parent.postMessage({op: 'RTC_SEND_TO_LEECHERS', payload: {op: 'CHAT', chat: e.data.chat, file_url: this.channel, from: 'server'}}, '*');
                }

                this.text += e.data.chat;
                this.draw();
            }

            if(e.data.op == "CHAT_SYSTEM" && e.data.from == 'client'){
                window.parent.postMessage({op: 'RTC_SEND_TO_LEECHERS', payload: {op: 'CHAT', chat: "USER JOINED", file_url: this.channel, from: 'server'}}, '*');
            }
        })

        //JOIN
        window.parent.postMessage({op: 'RTC_SEND_TO_SERVER', payload: {op: 'CHAT_SYSTEM', chat: "USER JOINED", file_url: this.channel, from: 'client'}}, '*');
    }


    draw(){
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);



        this.ctx.font = "15px monospace";
        this.ctx.fillStyle = "#FFFFFF"


        let x = 2;
        let y = this.height-15;
        for(let line of this.text.split('\n').reverse()){
            line = line.replace('\t','        ');
            this.ctx.fillText(line, x, y, this.canvas.width-20);
            y += -15;
            if(y<0){
                break;
            }
        }

        let line = this.input.join('');
        this.ctx.fillText(line, x, this.height-15, this.canvas.width);
        



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
            //send
            console.log("send");
            let to_post = this.input.join('')+"\n";
            this.input = [];
            window.parent.postMessage({op: 'RTC_SEND_TO_SERVER', payload: {op: 'CHAT', chat: to_post, file_url: this.channel, from: 'client'}}, '*');
            window.parent.postMessage({op: 'RTC_SEND_TO_LEECHERS', payload: {op: 'CHAT', chat: to_post, file_url: this.channel, from: 'server'}}, '*');

            return;
        }
        this.input.push(e.key);
        this.draw();
    }


    onUpdate(){
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.draw();
    }


}


const capsule = new Chat();
capsule.init(320,200);
capsule.run();