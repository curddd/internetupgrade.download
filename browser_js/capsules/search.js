class Search extends Capsule{

    init(){
        super.init(0,0);
        this.title = "search.exe"

        this.createTextInput(150,50,50,"'search.exe'",`'${uuid} xD'`);
    }


    processBusMsg(data){
        console.log("search got bus!",data)
        window.parent.postMessage({uuid: uuid, op: "FETCH_REMOTE", url: data.input}); 
        
    }
}


const capsule = new Search();
capsule.init(320,200);
capsule.run();