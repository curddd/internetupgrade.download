const autoCapsule = {

    init(){
        this.capsuleJS = {};

        fetch("browser_js/capsules/image.js").then((res)=>res.text())
        .then((script)=>{
            this.capsuleJS['image'] = script;
        })


        fetch("browser_js/capsules/text.js").then((res)=>res.text())
        .then((script)=>{
            this.capsuleJS['text'] = script;
        })


    },


    makeCapsule(data,type="",name="unnamed"){
        let capsuled = {data: data, script:"", meta:{name: name, type: "?"}};
        let general_type = type.split("/")[0];
        
        capsuled.meta.type = type;
    
        if(general_type in this.capsuleJS){
            capsuled.script = this.capsuleJS[general_type];
            capsuled.meta.type = type.split("/")[1];
        }
        return capsuled;
    }
}

autoCapsule.init();