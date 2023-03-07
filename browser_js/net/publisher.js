//TODO SAME FILE NAMES? jetzt: Neuester url überschreibt alte uuid
const publisher = {
    published_status: {url_to_uuid:{}, uuid_to_url:{}},
    
    init(){
        console.log("eee")
        this.published_status = JSON.parse(window.localStorage.getItem('published')) || {url_to_uuid:{}, uuid_to_url:{}};
        this.published_status = this.published_status || {url_to_uuid:{}, uuid_to_url:{}}
        for(let url in this.published_status.url_to_uuid){
            this.publish(this.published_status.url_to_uuid[url], url);
        }
        
    },

    publish(uuid, url, callback=null){

        this.published_status.uuid_to_url[uuid] = url;
        this.published_status.url_to_uuid[url] = uuid;
        window.localStorage.setItem('published', JSON.stringify(this.published_status));

        //sendWSMessage({type: 'PUBLISH', content: {name: url}});

        //storage.makeFileList(callback);
        screen.db.file_list();

    },

    unpublish(uuid, callback=null){
        if(!(uuid in this.published_status.uuid_to_url)){
            return;
        }

        let url = this.published_status.uuid_to_url[uuid];

        delete this.published_status.uuid_to_url[uuid];
        delete this.published_status.url_to_uuid[url];
        window.localStorage.setItem('published', JSON.stringify(this.published_status));
        //sendWSMessage({type: 'UNPUBLISH', content: {file_name: url}});


        //storage.makeFileList(callback);
        screen.db.file_list();

    },

    weAreHosting(url){
        if(this.published_status.url_to_uuid[url] !== undefined){
            return true;
        }
        return false;
    },

    isPublished(uuid){
        return this.published_status.uuid_to_url[uuid] !== undefined;
    },

    urlToUUID(url){
        return this.published_status.url_to_uuid[url];
    },

    //USED?
    UUIDToUrl(filename){
        return this.published_status.uuid_to_url[filename];
    }
}