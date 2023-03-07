class FriendChat extends Capsule{

    init(width,height){
        super.init(width,height);

        this.show = false;

        this.data = JSON.parse(decodeURIComponent(document.getElementById('data').innerHTML));

        this.title = `${this.data.meta.name} [${this.data.meta.type}]`;


        this.friend_id = "!!!FRIEND_ID!!!";
      
        this.input = [];

        this.draw();


        this.registerInputEvent("keyup",(e)=>this.onkeyup(e));


        //INTERVAL TO CHECK CONNECTION ??? 

        //CONNECTION W CORRECT PROTOCOL

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

        let line = "> " + this.input.join('');
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
           
            //TOPO SEND MSG ?? HOW ???


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


const capsule = new FriendChat();
capsule.init(320,200);
capsule.run();