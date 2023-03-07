class FileTransferProtocol{


    processMessage(e){

        console.log('client channel msg',e);
        let msg = JSON.parse(e.data);

        switch(msg.type){
            case 'PP_SEND':
                let done = JSON.parse(mergePP(msg.pp));
                if(done){
                    //run the thing
                    screen.loadScript(done);
                    mapUpdater(file_gotten_from, done.meta.name, this.peer_uuid);
                }
            break;
    
            case 'PP_GET':
                let file_uuid = publisher.urlToFileName(msg.url);
                storage.getFile(file_uuid, (data)=>{
                    data = JSON.stringify(data);
                        
                    console.log('data for name',msg.url,data);
                    let ppd = createPP(data);
                    for(let p of ppd){
                        this.dc.send(JSON.stringify({type: 'PP_SEND', pp: p}));
                    }
                    mapUpdater(file_served_to, msg.url, this.peer_uuid);
                });
                
            break;

        }
    }


    file_request_queue = [];
    requestFile(url){
        this.file_request_queue.push(url);
    }
    processFileQueue(){
        let file = this.file_request_queue.pop();
        console.log("getting file:", file);
        this.dc.send(JSON.stringify({type: 'PP_GET', url: file}));
    }


}