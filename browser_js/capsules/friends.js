class Friends extends Capsule{

    init(width,height){
        super.init(width,height);

        this.title = "friends.exe"

        

        this.friends = JSON.parse(window.localStorage.getItem('friendlist')) || [];


        this.mouseOnLine = -1;

        this.registerInputEvent("mousemove",(e)=>this.onmousemove(e));

        this.burger = ["Add"];
        this.busStops = {};
        this.draw();
    }



    processBusMsg(data){
        if(data.burger){
            switch(data.burger.selection_id){
                //ADD
                case 0:
                        
                    let add_id = (Math.random() + 1).toString(36).substring(2);
                    this.busStops[add_id] = (friend_id)=>{this.addFriend(friend_id)};
                    this.createTextInput(100,data.burger.e.clickX,data.burger.e.clickY,"'Rename'",`'${uuid} ${add_id}'`);
                    console.log("adding??")
                break
            }
        }
        
        if(data.ticket_id){
            let ticket_id = data.ticket_id.split(' ')[1];
            this.busStops[ticket_id](data);
            delete this.busStops[ticket_id];
        }
            
    }

    addFriend(friend_id){
        console.log("wanting to add friend",friend_id.input);
        this.friends.push(friend_id.input);
        window.localStorage.setItem('friendlist',JSON.stringify(this.friends));
        this.draw();
    }

    onmousemove(e){
        this.mouseOnLine = -1;
        if(e.posY > 1 && e.posX>0&&e.posX<this.width){
            this.mouseOnLine = Math.floor((e.posY-18)/15);
        }
        if(this.mouseOnLine > this.friends.length){
            this.mouseOnLine = - 1;
        }
        this.draw();
    }

    draw(){
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);


        let x = 2;
        let y = 25;
        let lineCount = 0;

        let toShow = JSON.parse(JSON.stringify(this.friends));
        toShow.unshift(window.localStorage.getItem('FRIENDCODE')+" (YOU)");

        for(let line of toShow){

            if(lineCount == this.mouseOnLine){
                this.ctx.fillStyle = "#777777"
                this.ctx.fillRect(0,y-10,this.canvas.width,15);
            }
            lineCount++;


            this.ctx.font = "15px monospace";
            this.ctx.fillStyle = "#FFFFFF"
        
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


const capsule = new Friends();
capsule.init(140,250);
capsule.run();