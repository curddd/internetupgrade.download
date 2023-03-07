class Identity extends Capsule{

    init(width,height){
        super.init(width,height);

        this.title = "identity.exe"

        this.draw();

    }


    draw(){
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);



        this.ctx.font = "15px monospace";
        this.ctx.fillStyle = "#FFFFFF"


        let x = 2;
        let y = 50;

        this.ctx.fillText("Your friendcode: " +window.localStorage.getItem('FRIENDCODE'), x, y, this.canvas.width);

    }


    onUpdate(){
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.draw();
    }

}


const capsule = new Identity();
capsule.init(320,200);
capsule.run();