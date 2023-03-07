class Selector extends Capsule{


    init(width,x,y,title,selections,ticket_id){
        selections = JSON.parse(selections);
        let height = 15 * (selections.length+1);

        super.init(2*width,height);

        this.ticket_id = ticket_id;

        this.allowResize = false;

        this.window_x = x;
        this.window_y = y;

        this.title = title;


        this.selections = selections;



        this.registerInputEvent("mousemove",(e)=>this.onmousemove(e));
        this.registerInputEvent("offclick",(e)=>this.onoffclick(e));
        this.registerInputEvent("mousedown",(e)=>this.onmousedown(e));

        this.draw();
    }


    draw(){
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(0,0,this.width,this.height);


        this.ctx.font = "16px monospace";
        this.ctx.fillStyle = "#FFFFFF"

        let x = 5;
        let y = 25;

        let line = 0;
        for(let select of this.selections){
            if(line == this.mouseOnLine){
                this.ctx.fillStyle = "#FF0033"
                this.ctx.fillRect(0,y-10,this.canvas.width,15);
                this.ctx.fillStyle = "#FFFFFF"
            }
            this.ctx.fillText(select, x, y, this.width);
            y += 15;
            line++;
        }
    }


    mouseOnLine = -1;

    onmousemove(e){
        if(e.posY < 1){
            this.mouseOnLine = -1;
            return;
        }
        this.mouseOnLine = Math.floor((e.posY-15)/15);
        this.draw();
    }

    onmousedown(e){
        window.parent.postMessage({uuid:uuid, op: 'BUS', ticket_id: this.ticket_id, selection_id: this.mouseOnLine, e:e}, '*');
        window.parent.postMessage({uuid:uuid, op: 'CLOSE'}, '*');
    }

    onoffclick(e){
        window.parent.postMessage({uuid:uuid, op: 'CLOSE'}, '*');
    }

    getImageData(){
        return this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);
    }


}