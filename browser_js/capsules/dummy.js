class Write extends Capsule{

    init(width,height){
        super.init(width,height);

        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(0,0,width,height);


        this.rows = this.height  / 16;
        this.cols = this.width / 16;
        this.pos = [1,1];

        this.refreshRate = 25;

        this.registerInputEvent('keyup', (e)=>this.onkeyup(e));

    }


    oneStep(){
        this.ctx.fillStyle = "rgba("+Math.random()*255+","+Math.random()*255+","+Math.random()*255+","+1+")";
        this.ctx.fillRect( Math.random()*this.canvas.width, Math.random()*this.canvas.height, 10, 10 ); 
    }


    onkeyup(e){
        console.log('keyup!');
        this.ctx.font = "16px arial";
        this.ctx.fillStyle = "#000000"
        this.ctx.fillText(e.key, this.pos[0]*8, this.pos[1]*16);

        this.pos[0]++;
        if(this.pos[0]>this.cols){
            this.pos[0] = 0;
            this.pos[1]++;
        }
    }


}

const capsule = new Write();
capsule.init(320,200);
capsule.run();

let div = document.createElement('div');
div.appendChild(document.createTextNode("xD"));
document.querySelector('body').appendChild(div);


console.log('poz load')
