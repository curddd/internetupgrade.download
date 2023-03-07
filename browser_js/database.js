class Database {

    fileList = [];

    constructor(db_name){
        
        let open_req = window.indexedDB.open(db_name, 1);

        // create the object store if it doesn't exist
        open_req.onupgradeneeded = (event) => {
            let db = event.target.result;
            db.createObjectStore("files", { keyPath: "uuid" });
        };

        open_req.onsuccess = (event) => {
            this.db = event.target.result;
        }

    }

    save(args){

        if(!args.uuid){
            args.uuid = (Math.random() + 1).toString(36).substring(2);
        }

        let f_tr = this.db.transaction("files", "readwrite");
        let fileDB = f_tr.objectStore("files");
        let put_req = fileDB.put(args);
        put_req.onsuccess = ()=>{
            this.file_list(args);
        };

    }

    delete(args){

        let f_tr = this.db.transaction("files", "readwrite");
        let fileDB = f_tr.objectStore("files");
        let del_req = fileDB.delete(args.f_uuid);
        del_req.onsuccess = () => {
            //publisher.unpublish(uuid);
            this.file_list(args);
        }
    }

    fetch(args){
console.log(args);
        let f_tr = this.db.transaction("files", "readwrite");
        let fileDB = f_tr.objectStore("files");
        let get_req = fileDB.get(args.f_uuid)
        //TODO response to get file
        get_req.onsuccess = (res)=>{
            console.log('get req response',res)
            this.file_list(args);
            if(args.onfetch){
                args.onfetch(res.target.result)
            }
        }

    }

    rename(args){

        let f_tr = this.db.transaction("files", "readwrite");
        let fileDB = f_tr.objectStore("files");
        let get_req = fileDB.get(args.f_uuid);
        get_req.onsuccess = (res)=>{
            let file = res.target.result;
            file.meta.name = args.newName;
            let put_req = fileDB.put(file);
            put_req.onsuccess = ()=>{
                //publisher.unpublish(uuid);
                //publisher.publish(uuid,newName);

                this.file_list(args);
            };
        };
    }


    file_list(){
        let fileList = [];
        let f_tr = this.db.transaction("files", "readwrite");
        let fileDB = f_tr.objectStore("files");
        fileDB.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                //fileList.push({uuid: cursor.key, name:cursor.value.meta.name, type:cursor.value.meta.type, published: (cursor.key in publisher.published_status.uuid_to_url)});
                fileList.push({uuid: cursor.key, name:cursor.value.meta.name, type:cursor.value.meta.type, published: false, signature: cursor.value.signature?cursor.value.signature.signature:""});
                cursor.continue();
            } else {
                console.log("No more entries!");
                this.fileList = fileList;
                console.log(fileList);

                this.on_file_list_ready();
                
            }
        };
    }

    on_file_list_ready(ticket_id){
        screen.processBusMessage({op:'BUS', ticket_id:`trusted db_file_list`,db_file_list:this.fileList});
    }

}