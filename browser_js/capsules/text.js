class Text extends Capsule{

    init(width,height){
        super.init(width,height);

        this.show = false;

        this.data = JSON.parse(decodeURIComponent(document.getElementById('data').innerHTML));

        this.title = `${this.data.meta.name} [${this.data.meta.type}]`;

        this.text = atob(this.data.data.split(';base64,')[1]);

        this.draw();

    }


    draw(){
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);



        this.ctx.font = "15px monospace";
        this.ctx.fillStyle = "#FFFFFF"


        let x = 2;
        let y = 25;
        for(let line of this.text.split('\n')){
            line = line.replace('\t','        ');
            this.ctx.fillText(line, x, y, this.canvas.width);
            y += 15;
        }
        



    }


    onUpdate(){
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.draw();
    }

}


const capsule = new Text();
capsule.init(320,200);
capsule.run();