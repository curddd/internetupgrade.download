class Capsule{


    init(width,height){

        this.canvas = document.createElement('canvas');

        this.scaleCanvas = document.createElement('canvas');
        this.scale_ctx = this.scaleCanvas.getContext('2d');
        this.scale_ctx.imageSmoothingEnabled = false;


        this.canvas.width = width;
        this.canvas.height = height;

        this.width = width;
        this.height = height;

        this.ctx = this.canvas.getContext('2d');

        this.window_x = 10;
        this.window_y = 10;

        this.title = "dummy.exe";

        this.allowResize = true;


        this.burger = [];

        window.addEventListener("message", (e)=>{
            
            switch(e.data.op){
                case 'POSTCANVAS':
                    window.parent.postMessage(
                        {uuid: uuid, op: 'CAPSULE_CANVAS', 
                            pos: {
                                x: this.window_x, y: this.window_y,
                                width: this.width, height: this.height,
                                c_h: this.canvas.height, c_w: this.canvas.width,
                                title: this.title
                            }, 
                            imageData: this.getImageData(),
                            burger: this.burger
                        },
                     '*');
                break;

                case 'TAKEINPUT':
                    this.receiveEvent(e.data.type, e.data.e);
                break;

                case 'UPDATEPOS':
                    if(!this.allowResize){
                        break;
                    }
                    this.width = Math.max(30,e.data.width);
                    this.height = Math.max(30,e.data.height);
                    this.window_x = e.data.x;
                    this.window_y = e.data.y;
                    this.onUpdate();
                break;

                case 'BUS':
                    this.processBusMsg(e.data);
                break;

            }
        })

        if(this.canvas.width > 0 && this.canvas.height > 0){
            window.parent.postMessage(
                {uuid: uuid, op: 'READY_TO_DRAW', 
                    pos: {
                        x: this.window_x, y: this.window_y,
                        width: this.width, height: this.height,
                        c_h: this.canvas.height, c_w: this.canvas.width,
                        title: this.title
                    }, 
                    imageData: this.getImageData(),
                },
            '*');
        }
       
    }


    processBusMsg(data){}

    onUpdate(){}

    getImageData(){
        this.scaleCanvas.width = this.width;
        this.scaleCanvas.height = this.height;
        this.scale_ctx.drawImage(this.canvas,0,0,this.width,this.height);
        return this.scale_ctx.getImageData(0,0,this.scaleCanvas.width,this.scaleCanvas.height)
    }

    refreshRate = 1000;

    run(){
        this.loopInterval = setTimeout(()=>{
            this.oneStep();
            this.run();
        },this.refreshRate);
    }

    stop(){
        clearInterval(this.loopInterval);
    }


    oneStep(){}


    receiveEvent(type, e){
        if(this.registeredEvents[type]){
            this.registeredEvents[type](e);
        }
    }

    registeredEvents = {};
    registerInputEvent(type, func){
        this.registeredEvents[type] = func;
    }

    //UI
    createSelection(width,x,y,title,selctions,ticket_id){
        window.parent.postMessage({uuid: uuid, op:"REQUEST_SELECTOR", params: {width: width, x: this.window_x+x, 
            y: this.window_y+y, title:title, selections: selctions, ticket_id: ticket_id}}, '*')
    }
    createTextInput(width,x,y,title,ticket_id){
        window.parent.postMessage({uuid: uuid, op: "REQUEST_TEXTINPUT", params: {width: width, x: this.window_x+x, 
            y: this.window_y+y, title:title, ticket_id: ticket_id}},'*')
    }

}