const swarm = {


    //by default, all open rtc connections (with dc?)


    //get new peers to connect to
    SWARM_USERS(swarm){
        if(rtc_connections.size > 20){
            return;
        }
console.log(ws_network_uuid,'wsnet');
        swarm.splice(swarm.indexOf(ws_network_uuid),1);
console.log(swarm);
        for(let node of swarm){
            if(rtc_connections.has(node)){
                continue;
            }
            //sendWSMessage({type: 'INIT_CONNECT', content: {target_uuid: node}});
            INIT_CONNECTION(node,sendWSMessage);
        }
    },

    ongarbage(e){
        console.log("webrtc swarm garbage!",e);
        let msg = {};
        try{
            msg = JSON.parse(e.data);
        }
        catch{

        }

        if(!(['BC','TO'].includes(msg.type))){
            return;
        }

        switch(msg.type){
            case 'BC':
                swarm.onbroadcast(msg);
            break;

            case 'TO':
                if(msg.to_uuid == ws_network_uuid){
                    console.log("direct garbage hit!", msg);
                }

        }
    },


    broadcast(payload){
        let msg_uuid = (Math.random() + 1).toString(36).substring(2);
        let to_send = {type: 'BC',msg_uuid:msg_uuid,origin: ws_network_uuid,route:[ws_network_uuid],payload:payload};
        
        for(let rtc_conn of rtc_connections.values()){
            rtc_conn.sendOnChannel('garbage',to_send);
        }
    },

    knownMessages: [],
    //TODO UNTRUST
    onbroadcast(message){
console.log("have bc msg",message)
        if(swarm.knownMessages.includes(message.msg_uuid)){
            return;
        }


        //SPECIAL GARBAGE_ sockets!
        if(Object.keys(sockets.listening).includes("GARBAGE_"+message.payload.channel_label)){
            sockets.listening["GARBAGE_"+message.payload.channel_label](message);
        }

        //WE KNOW THIS KINDA GARBAGE! ITS FOR THIS!
        if("SEARCH" == message.payload.channel_label){
            swarm.ongarbagesearch(message);
        }

        swarm.knownMessages.push(message.msg_uuid);
        message.route.push(ws_network_uuid);

        for(let rtc_conn of rtc_connections.values()){
console.log(message.route, rtc_conn.peer_uuid);
            if(message.route.includes(rtc_conn.peer_uuid)){
                console.log(message.route, rtc_conn.peer_uuid);
                continue;
            }
console.log("sending ;)");
            rtc_conn.sendOnChannel('garbage',message);
        }
        

    },

    to_target(uuid, payload){
        //we are directly connected
        if(rtc_connections.has(uuid)){
            rtc_connections.get(uuid).sendOnChannel('garbage',{type: 'TO', to_uuid: uuid, payload: payload});
        }
        else{
            if(!rtc_message_queue.has(uuid)){
                rtc_message_queue.set(uuid, {garbage:[]});
            }
            let tmp = rtc_message_queue.get(uuid);
            tmp.garbage.push(payload);
            rtc_message_queue.set(uuid, tmp);
            INIT_CONNECTION(uuid,sendWSMessage);
        }
        //we know the uuid from somewhere


        //we are fucked? ask ws?
    },


    ongarbagesearch(message){

        if(publisher.weAreHosting(message.payload.search)){
            console.log("we have a hit!");
            

            swarm.to_target(message.origin, {test:"123!!"})

        }
    },



}

sockets.add('garbage',swarm.ongarbage);
