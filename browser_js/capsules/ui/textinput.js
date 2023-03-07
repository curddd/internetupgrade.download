class TextInput extends Capsule{


    init(width,x,y,title,ticket_id){

        super.init(2*width,15*3);

        this.ticket_id = ticket_id;

        this.allowResize = false;

        this.window_x = x;
        this.window_y = y;

        this.title = title;
        this.input = [];

        this.registerInputEvent("offclick",(e)=>this.onoffclick(e));
        this.registerInputEvent("keyup",(e)=>this.onkeyup(e));

        this.draw();
    }


    draw(){
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(0,0,this.width,this.height);


        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(10,20,this.width-(10*2),15);


        this.ctx.font = "15px monospace";
        this.ctx.fillStyle = "#000000"

        let x = 16;
        let y = 32;
+
        this.ctx.fillText(">"+this.input.join(''), x, y, this.width-(2*x));
    }

    onkeyup(e){
        if(['Shift','Alt','Meta','Control','Dead'].indexOf(e.key)!=-1){
            return;
        }

        if(e.key == 'Backspace'){
            this.input.pop();
            this.draw();
            return;
        }
        if(e.key == 'Enter'){
            //return
            console.log("send here");

            window.parent.postMessage({uuid:uuid, op: 'BUS', ticket_id: this.ticket_id, input: this.input.join('')}, '*');
            window.parent.postMessage({uuid:uuid, op: 'CLOSE'}, '*');

            return;
        }
        this.input.push(e.key);
        this.draw();
    }

    onoffclick(e){
        console.log('select OFF');
        window.parent.postMessage({uuid:uuid, op: 'CLOSE'}, '*');
    }

    getImageData(){
        return this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);
    }


}