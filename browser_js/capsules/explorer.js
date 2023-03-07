class Explorer extends Capsule{

    init(width,height){
        super.init(width,height);

        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(0,0,width,height);

        this.title = "explorer.exe"

        this.registerInputEvent("mousemove",(e)=>this.onmousemove(e));
        this.registerInputEvent("mousedown",(e)=>this.onmousedown(e));
        
        this.files = [];
        this.draw();

        window.parent.postMessage({op: 'ASK_DB', action: 'file_list', ticket_id: uuid}, '*');
    }

    onUpdate(){
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.draw();
    }

    oneStep(){
        this.draw();
    }

    draw(){
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(0,0,this.width,this.height);


        this.ctx.font = "16px monospace";

        let x = 5;
        let y = 25;

        let line = 0;
        for(let file of this.files){


            if(line == this.mouseOnLine){
                this.ctx.fillStyle = "#777777"
                this.ctx.fillRect(0,y-10,this.canvas.width,15);
            }


            this.ctx.fillStyle = "#FFFFFF"
            if(file.published){
                this.ctx.fillStyle = "#009900";
                if(line == this.mouseOnLine){
                    this.ctx.fillStyle = "#003300"
                }
            }

            this.ctx.fillText(`${file.name} [${file.type}] [${file.signature.substring(0,8)}]`, x, y);
            y += 15;
            line++;
        }
    }


    busStops = {};
    processBusMsg(data){
        console.log("exp got bus!",data)

        data.ticket_id = data.ticket_id.split(' ')[1];

        if(data.ticket_id == 'draw'){
            this.files = data.files;
            this.draw();
            return;
        }
        else if(data.ticket_id == 'db_file_list'){
            this.files = data.db_file_list;
        }

        if(Object.keys(this.busStops).indexOf(data.ticket_id) == -1){
            return;
        }
        this.busStops[data.ticket_id](data);
        console.log("?")
    }

    mouseOnLine = -1;

    onmousemove(e){
        this.mouseOnLine = -1;
        if(e.posY > 1 && e.posX>0&&e.posX<this.width){
            this.mouseOnLine = Math.floor((e.posY-18)/15);
        }
        this.draw();
    }

    onmousedown(e){
        if(this.mouseOnLine>-1){

            let ticket_id = (Math.random() + 1).toString(36).substring(2);



            let fileNum = 0;
            let file = null;
            for(let idx in this.files){
                if(fileNum == this.mouseOnLine){
                    file = this.files[idx];
                    break;
                }
                fileNum++;
            }
            if(!file){
                return;
            }


            this.busStops[ticket_id] = (data)=>{

                switch(data.selection_id){
                    case 0:
                        console.log("open");
                        window.parent.postMessage({op:'RUN_LOCAL_FILE',f_uuid:file.uuid},'*');
                    break;

                    case 1:
                        console.log("rename");
                        let rename_id = (Math.random() + 1).toString(36).substring(2);
                        this.busStops[rename_id] = (data)=>{this.onRename(file.uuid,data)};
                        this.createTextInput(100,e.clickX,e.clickY,"'Rename'",`'${uuid} ${rename_id}'`);
                    break;

                    case 2:
                        console.log("sign");
                        window.parent.postMessage({op:"SIGN_FILE",f_uuid:file.uuid});
                    break;

                    case 3:
                        console.log("publish");
                        if(file.published){
                            window.parent.publisher.unpublish(file.uuid,()=>{this.draw()});
                        }
                        else{
                            window.parent.publisher.publish(file.uuid,file.name,()=>{this.draw()});
                        }
                    break;

                    case 4:
                        console.log("delete");
                        //window.parent.storage.remove(file.uuid);
                        window.parent.postMessage({op:'ASK_DB',action:'delete',f_uuid:file.uuid,ticket_it:uuid},'*');
                    break;
                }
                this.draw();
            }

            let selection = ["Open","Rename","Sign","Publish","Delete"]
            if(file.published){
                selection = ["Open","Rename","Sign","Depublish","Delete"]
            }
            this.createSelection(50,e.clickX,e.clickY,"'???'",selection,`'${uuid} ${ticket_id}'`);
        }
        
    }

    onRename(f_uuid, data){
        //window.parent.storage.rename(uuid, data.input);
        window.parent.postMessage({op:'ASK_DB',action:'rename',f_uuid:f_uuid,ticket_id:uuid,newName:data.input},'*');
    }

    getImageData(){
        return this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);
    }

}

const capsule = new Explorer();
capsule.init(320,200);
capsule.run();
console.log('hi')