//ANYTHING RELATING TO RTC CONNECTIONS AND THEIR MESSAGING
//TODO rtc starting timeouts etc


// message queue
// uuid -> [{label: '', msg: '{}'}]

var rtc_connections = new Map();
var identity_map = new Map();
var rtc_message_queue = new Map();

//SERVER SIDE
/*
function DEMAND_TO_OFFER(request, callback){

    let rtc = new webRTC(request.peer_uuid);
    rtc.peer_uuid = request.peer_uuid;
    rtc.newDataChannel('garbage',swarm.ongarbage)


    rtc.connection.onicecandidate = (e)=>{
        if (e.candidate == null) {
            callback({type: 'SEND_OFFER', content: {offer_payload: rtc.connection.localDescription, peer_uuid: request.peer_uuid}});
        }
    }
    
    rtc.createOffer(callback, request.peer_uuid);

    rtc_connections.set(request.peer_uuid, rtc);

    console.log('Ran thru');
}
*/

//ASKING SIDE (intiating)
function INIT_CONNECTION(peer_uuid,callback){
    let rtc = new webRTC(peer_uuid);
    rtc.peer_uuid = peer_uuid;
    rtc.newDataChannel('garbage',swarm.ongarbage)


    rtc.connection.onicecandidate = (e)=>{
        if (e.candidate == null) {
            callback({type: 'SEND_OFFER', content: {offer_payload: rtc.connection.localDescription, peer_uuid: peer_uuid}});
        }
    }
    
    rtc.createOffer(callback, peer_uuid);

    rtc_connections.set(peer_uuid, rtc);

    console.log('Ran thru');
}

function RECEIVE_ANSWER(request){
    let rtc = rtc_connections.get(request.peer_uuid);
    if(rtc === undefined){
        return;
    }
    rtc.connection.setRemoteDescription(request.payload);
}

//ASKED SIDE
function RECEIVE_OFFER(request, callback){

    let rtc = new webRTC(request.peer_uuid);
    rtc.peer_uuid = request.peer_uuid;


    rtc.connection.onicecandidate = (e) => {
        if (e.candidate == null) {
            callback({type: 'ANSWER_OFFER', content: {answer_payload: rtc.connection.localDescription, peer_uuid: request.peer_uuid}})
        }
    }
    
    rtc.receiveOffer(request.payload);
    
    rtc_connections.set(request.peer_uuid, rtc);

}

function IDENTITY_PONG(data){
    if(data.uuid == null){
        if(identity_map.has(data.identity)){
            identity_map.delete(data.identity);
        }
    }
    else{
        identity_map.set(data.identity, data.uuid);
    }

}

class webRTC  {

    sdpConstraints = {
        optional: [],
    }

    constructor(peer_uuid){
        this.peer_uuid = peer_uuid;

        var cfg = {'iceServers': [{'url': "stun:stun.gmx.net",'urls': "stun:stun.gmx.net"}]},
        con = { 'optional': [{'DtlsSrtpKeyAgreement': true}] };

        this.connection = new RTCPeerConnection(cfg, con);
        this.connection.oniceconnectionstatechange = () => {
            if(this.connection.iceConnectionState == 'disconnected') {
                rtc_connections.delete(this.peer_uuid);
            }
        }
        //this.connection.createDataChannel('garbage',{});
        this.connection.ondatachannel = (e) => this.ondatachannel(e);
        this.data_channels = {};
    }

    //we are serving
    createOffer(){
        this.connection.createOffer((desc)=>{
            console.log("COCK=??",desc)
            this.connection.setLocalDescription(desc);
        }, function(){}, this.sdpConstraints);
    }

    //we are clienting
    receiveOffer(offerDesc){
        this.connection.setRemoteDescription(offerDesc)
        this.connection.createAnswer((answerDesc) => {
            this.connection.setLocalDescription(answerDesc)
        }, function (){}, this.sdpConstraints)          
    }

    ondatachannel(e) {
        let channel = e.channel || e;
        if(channel.label in sockets.listening){
            this.data_channels[channel.label] = channel;
            this.data_channels[channel.label].onopen = (e) => { this.data_channels[channel.label].send("we found a new chanel!")};
            this.data_channels[channel.label].onclose = (event) => {  };
            this.data_channels[channel.label].onmessage = (e)=>{
            
                //let data = JSON.parse(e.data);
                if(Object.keys(sockets.listening).includes(channel.label)){
                    sockets.listening[channel.label](e);
                }
                
                
            } 
        }
        else{
            channel.close();
        }
    }
    
    newDataChannel(label, onmessage){
        this.data_channels[label] = this.connection.createDataChannel(label, {reliable: true});
        this.data_channels[label].onopen = (e) => { 
            console.log(label, 'open, works on my end ;)'); 
            this.data_channels[label].send("uiii");
            if(rtc_message_queue.has(this.peer_uuid) && rtc_message_queue.has(this.peer_uuid)[label] !== undefined){
                let msg = rtc_message_queue.has(this.peer_uuid)[label].pop();
                while(msg !== undefined){
                    this.sendOnChannel(label,msg);
                }
            }
        };
        this.data_channels[label].onclose = (e) => { };
        this.data_channels[label].onmessage = onmessage;
    }

    sendOnChannel(label,data){
        if(this.data_channels[label]){
            this.data_channels[label].send(JSON.stringify(data));
        }
    }
}