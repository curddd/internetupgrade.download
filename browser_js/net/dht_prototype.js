//todo apstract the swam elements out into swarm

const dns = {
    
    MAX_CONNS: 20,


    node_on: false,
    dns_nodes_online: 0,
    dns_nodes: [],
    connected_nodes: [],
    init(){
        sendWSMessage({type: 'REQUEST_DNS'});
        sockets.add('dns',(e)=>this.on_dns_message(e));


        setInterval(()=>{
            this.reqQueueWorker();
            this.node_manager();
        },100);


        setInterval(()=>{
            sendWSMessage({type: 'REQUEST_DNS'});
        },60000)
    },

    turn_on_node(){
        this.node_on = true;
        sendWSMessage({type: 'ANNOUCE_DNS'});
    },


    new_node_list(data){
        this.dns_nodes = data.dns;
        this.dns_nodes_online = data.online;
    },

    node_manager(){
        //we are client, or server, either way, we want to connect

        //stay connected to enough nodes
        //TODO remove stale dns nodes
        if(this.dns_nodes.length || this.node_on){
            for(let i=0; i<Math.min(this.MAX_CONNS,this.dns_nodes.length); i++){

                if(rtc_connections.has(this.dns_nodes[i])){

                    if(rtc_connections.get(this.dns_nodes[i]) && !('dns' in rtc_connections.get(this.dns_nodes[i]).data_channels)){
                        console.log('openeing dns channel');
                        rtc_connections.get(this.dns_nodes[i]).newDataChannel('dns',(msg)=>{
                            this.on_dns_message(msg);
                        })
                    }
                    continue;
                }

                
                //TODO wonky, own INIT_CONNECT function 
                rtc_connections.set(this.dns_nodes[i], null);
                sendWSMessage({type: 'INIT_CONNECT', content: {target_uuid: this.dns_nodes[i]}});
            }
        }
    },

    requestLookup(url,callback){
        this.dns_request_queue.push({url:url, status:'init', callback: callback});
    },

    timeout_counter: {},
    makeLookup(url){
        for(let node of this.dns_nodes){
            if(!rtc_connections.has(node)){
                continue;
            }
            rtc_connections.get(node).sendOnChannel('dns', {op: 'LOOKUP_REQ', url: url, respond_to: ws_network_uuid, has_passed: []});
        }
    },

    lookup_table: {},

    on_dns_message(message){
console.log('dns msg',message);
        switch(message.data.op){
            case 'LOOKUP_REQ':
                //hahha wtf we arent even serving
                if(!this.node_on){
                    console.log("we aren't dns")
                    break;
                }

                //check our cache or our hosted files and respond when we have a hit, and fwd to other nodes
                
                let res = [];

                //TODO insert our cached table

                if(publisher.weAreHosting(message.data.url)){
                    console.log("we have a hit!");
                    res.push(ws_network_uuid);
                }

                if(res.length){
                    console.log("sending")
                    rtc_connections.get(message.sender_uuid).sendOnChannel('dns', {op: 'LOOKUP_RES', url: message.data.url, res: res, route: message.data.has_passed});
                }

                //forward to other nodes
                message.data.has_passed.push(ws_network_uuid);
                console.log(this.dns_nodes)
                for(let node of this.dns_nodes){
                    console.log("forwarding", node)
                    //no connection, or already seen
                    if(!rtc_connections.has(node) || message.data.has_passed.indexOf(node)!=-1 || message.sender_uuid == message.sender_uuid || node == ws_network_uuid){
                        console.log("not")
                        continue;
                    }
                    rtc_connections.get(node).sendOnChannel('dns', message.data);
                }

            break;


            case 'LOOKUP_RES':
                
                if(!this.lookup_table[message.data.url]){
                    this.lookup_table[message.data.url] = [];
                }
                for(let host of message.data.res){
                    this.lookup_table[message.data.url].push(host);
                }

                //bucket stops here
                if(message.data.respond_to == ws_network_uuid){
                    break;
                }

                let send_to = message.data.route.pop();
                rtc_connections.get(send_to).sendOnChannel('dns', message.data);
                

            break;
        }


    },

    //outstanding request queue
    dns_request_queue: [],
    dns_cache: {},

    reqQueueWorker(){

        if(this.dns_nodes.length == 0){
            return;
        }

        for(let req of this.dns_request_queue){
            switch(req.status){

            case 'init':
                req.status = 'lookup';
            break;


            case 'lookup':
                this.makeLookup(req.url);
                req.status = 'awaiting_response';
            break;

/*
            case 'lookup_finish':
                //nothing found
                if(address_book[req.url].length == 0){
                req.status = '404';
                break;
                }

                //we already have a connection to host
                if(rtc_calling.get(address_book[req.url][0])){
                rtc_calling.get(address_book[req.url][0]).requestFile(req.url);
                req.status = 'awaiting_response';
                req.timeout = 0;
                break;
                }

                //we have to connect
                req.status = 'connecting';
                req.timeout = 0;
                sendWSMessage({type: 'INIT_CONNECT', content: {target_uuid: address_book[req.url][0]}});
            break;
            

            case 'connecting':
                req.timeout++;
                if(req.timeout>10){
                req.status = '404';
                break;
                }

                //we have a connection to host
                if(rtc_calling.get(address_book[req.url][0])){
                rtc_calling.get(address_book[req.url][0]).requestFile(req.url);
                req.status = 'awaiting_response';

                }
            break;

            case 'awaiting_response':
                req.timeout++;
                if(req.timeout>10){
                req.status = '404';
                break;
                }
*/

            
            }
        
       }

        for(let idx in this.dns_request_queue){
            if(this.dns_request_queue[idx].status == '404'){
                this.dns_request_queue.splice(idx,1);
            }
        }

    },


}


function DNS_NODES(data){
    dns.new_node_list(data);
}