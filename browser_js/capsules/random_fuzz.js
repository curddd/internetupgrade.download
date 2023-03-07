class Write extends Capsule{


    oneStep(){
        this.ctx.fillStyle = "rgba("+Math.random()*255+","+Math.random()*255+","+Math.random()*255+","+Math.random()*255+")";
        this.ctx.fillRect( Math.random()*this.width, Math.random()*this.height, 1, 1 ); 
    }


}

const capsule = new Write();
capsule.init(640,480);
capsule.run();