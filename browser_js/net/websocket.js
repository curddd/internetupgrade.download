const socket = new WebSocket(`wss://chatter.today:8667`);


var ws_network_uuid = "";


socket.onopen = function() {
  console.log('Connected to server');
  websocketOpened();
};

//send inc message to all tabs
socket.onmessage = function(msg) {
  console.log('ws msg:', msg);
  let data = JSON.parse(msg.data);
  
  switch(data.type){
    case 'UUID_ASSIGN':
      ws_network_uuid = data.uuid;
    break;
    
    /*
    case 'DEMAND_TO_OFFER':
      DEMAND_TO_OFFER(data, sendWSMessage);
      break;
    */
    case 'OFFER':
      RECEIVE_OFFER(data, sendWSMessage);
      break;
    case 'ANSWER':
      RECEIVE_ANSWER(data);
      break;
   
    case 'IDENTITY_PONG':
      IDENTITY_PONG(data);
    break;

    case 'SEARCH_RES':
      LOOKUP_RES(data);
    break;

    case 'SWARM_USERS':
      swarm.SWARM_USERS(data.swarm);
    break;
   
  }


};

socket.onclose = function() {
  console.log('Disconnected from server');
};

//take message from tab and send to socket
function sendWSMessage(request){
  socket.send(JSON.stringify(request));
}
  

//address/name resolution
let address_book = {};

function LOOKUP_RES(data){
  address_book[data.name] = data.file_hosters;
  data.op = "BUS";
  screen.processBusMessage(data);
  /*
  for(let req of request_queue){
    if(req.status == 'lookup' && req.url == data.url){

      req.status = 'lookup_finish';
    }
  }
  */


}

let identIntervall = null;

function websocketOpened(){
  //publisher.init();

  /*
  identIntervall = setInterval(async ()=>{
    if(identity.loaded && ws_network_uuid!=""){

      let id_card = {
        ws_network_uuid:ws_network_uuid, 
        public_key:identity.ident.public_key
      };

      let signed_id = await identity.sign(JSON.stringify(id_card));
      sendWSMessage({type: 'IDENTIFY', id_card: id_card, signature: signed_id});
      clearInterval(identIntervall);
    }
  },1000)
  */
}