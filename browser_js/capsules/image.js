class ImageDisplay extends Capsule{

    init(width,height){
        super.init(width,height);

        this.show = false;

        this.data = JSON.parse(decodeURIComponent(document.getElementById('data').innerHTML));

        this.title = `${this.data.meta.name}  [${this.data.meta.type}]`;

        this.img = new Image();
        this.img.onload = ()=>{
            this.canvas.width = this.img.width;
            this.canvas.height = this.img.height;
            this.ctx.drawImage(this.img,0,0,this.canvas.width,this.canvas.height);
        };
        this.img.onerror = (e)=>{
            console.log(e)
        }
        let imageDataURL = this.data.data;
        this.img.src = imageDataURL;

        this.burger = ["Save"];

    }

    processBusMsg(msg){
        if(msg.burger){
            switch(msg.burger.selection_id){
                case 0:
                    let capsule = JSON.parse(decodeURIComponent(document.getElementById('data').innerHTML));
                    window.parent.postMessage({uuid: uuid, op: 'SAVE_CAPSULE', capsule: capsule}, '*');
                break
            }
        }
    }


}


const capsule = new ImageDisplay();
capsule.init(320,200);
capsule.run();