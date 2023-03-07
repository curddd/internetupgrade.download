const fs = require('fs');
const WebSocket = require('ws');
const https = require('https');
const crypto = require('node:crypto').webcrypto;

const DNS_NODE_COUNT = 20;

server = https.createServer({
    cert: fs.readFileSync("/etc/ssl/chatter.today.crt"),
    key: fs.readFileSync("/etc/ssl/private/chatter.today.key")
})

wss = new WebSocket.Server( {server} );

let connected_users = new Map()
//let identified_users = new Map();
//let identity_to_uuid = new Map();
//let file_book = new Map();

wss.on('connection', function (ws) {
	console.log('Client connected');

    let uuid = (Math.random() + 1).toString(36).substring(2);
    ws.send(JSON.stringify({type: 'UUID_ASSIGN', uuid: uuid}));
    connected_users.set(uuid,ws);
    //let user_files = [];

    SEND_SWARM(uuid);

	ws.on('message', (message) => {
		let data = JSON.parse(message);
		console.log(data);
        switch (data.type) {


            /*
            case 'IDENTIFY':
                IDENTIFY(uuid, data.id_card, data.signature);
            break;


            case 'IDENTITY_PING':
                IDENTITY_PING(uuid, data.identity);
            break;
            */

            //FOR HOSTERS
            
            /*
            case 'PUBLISH':
                if(!identified_users.has(uuid)){
                    break;
                }
                PUBLISH(identified_users.get(uuid), data.content.name);
                user_files.push(data.content.name);
                break;

            case 'UNPUBLISH':
                if(user_files.indexOf(data.content.file_name) == -1){
                    break;
                }
                UNPUBLISH(identified_users.get(uuid), data.content);
                user_files.splice(user_files.indexOf(data.content.file_name),1);
                break;

            */
            //FOR CLIENTS
            
            /*
            case 'SEARCH_FILE':
                SEARCH_FILE(ws, data.content.uuid, data.content.file_name);
                break;
            
            */

            /*
            case 'ANNOUCE_DNS':
                dns_nodes.push(uuid);
            break;

            case 'REMOVE_DNS':
                dns_nodes = dns_nodes.splice(dns_nodes.indexOf(uuid),1);
            break;

            case 'REQUEST_DNS':
                const shuffled = dns_nodes.sort(() => 0.5 - Math.random());
                connected_users.get(uuid).send(JSON.stringify({type: 'DNS_NODES', dns: shuffled.slice(0,DNS_NODE_COUNT), online: dns_nodes.length}));
            break;
            */

            //SIGNALING
            /*
            case 'INIT_CONNECT':
                INIT_CONNECT(uuid, data.content.target_uuid);
            break;
            */

            case 'SEND_OFFER':
                SEND_OFFER(uuid, data.content);
            break;
            
            case 'ANSWER_OFFER':
                ANSWER_OFFER(uuid, data.content);
            break;

            case 'SWARM_REQUEST':
                SEND_SWARM(uuid);
            break;
		}
	});

	ws.on('close', () => {
        //CLEARUUID(uuid,user_files);
        //dns_nodes = dns_nodes.splice(dns_nodes.indexOf(uuid),1);
        connected_users.delete(uuid);
		console.log('Client disconnected');
	});
});
server.listen(8667)

let dns_nodes = [];



/*
function INIT_CONNECT(uuid, target_id){
console.log('init connect');
    if(!connected_users.has(target_id)){
        return;
    }

    connected_users.get(target_id).send(JSON.stringify({type: "DEMAND_TO_OFFER", peer_uuid: uuid}))
}
*/

//Response to DEMAND_TO_OFFER, has {client_uuid, url, offer_payload}
function SEND_OFFER(uuid, content){
    connected_users.get(content.peer_uuid).send(JSON.stringify({type: "OFFER", payload: content.offer_payload, peer_uuid: uuid}));
}

function ANSWER_OFFER(uuid, content){
    connected_users.get(content.peer_uuid).send(JSON.stringify({type: "ANSWER", payload: content.answer_payload, peer_uuid: uuid}));
}


function SEND_SWARM(uuid){
    let tmp = [];
    for(let u of connected_users.keys()){
        tmp.push(u);
    }
    tmp = tmp.sort((a,b)=>{0.5-Math.random()});
    connected_users.get(uuid).send(JSON.stringify({type: "SWARM_USERS", swarm:tmp.slice(0,20)}));
}

/*

function PUBLISH(friend_id, file_name){
console.log('publish');
    if(file_book.get(file_name) === undefined){
        file_book.set(file_name, []);
    }

    if(file_book.get(file_name).indexOf(friend_id) === -1){
        file_book.get(file_name).push(friend_id);
    }
    console.log(file_book);

}

function UNPUBLISH(friend_id, file_name){
    file_book.get(file_name).splice(file_book.get(file_name).indexOf(friend_id));
}

function SEARCH_FILE(ws, win_uuid, file_name){
    let file_hosters = file_book.get(file_name) || [];
    console.log(file_book,file_hosters);

    ws.send(JSON.stringify({type: 'SEARCH_RES', file_name: file_name, file_hosters: file_hosters, ticket_id: `${win_uuid} res`}));
}



function CLEARUUID(uuid, user_files){
    for(let url of user_files){
        file_book.get(url).splice(file_book.get(url).indexOf(uuid),1);
    }
    if(identified_users.has(uuid)){

        identity_to_uuid.delete(identified_users.get(uuid).IDENTITY);
        identified_users.delete(uuid);
    }
    
}

function IDENTIFY(uuid, id_card, signature_b64){
    let sig_arr = Uint8Array.from(atob(signature_b64), c => c.charCodeAt(0))

    importJWKKey(id_card.public_key, ['verify'], (public_key)=>{
        verifySignature(public_key, sig_arr, JSON.stringify(id_card), (res)=>{
            if(res){
                //WE ARE IDENTIFIED!
                //MAKE DIGEST FROM PUBLIC KEY AND GET EVERY 8TH LETTER
                digestMessage(JSON.stringify(id_card.public_key), (hashHex)=>{
                    let smallSig = "";
                    for(let i=0; i<hashHex.length; i+=8){
                        smallSig+=hashHex[i];
                    }
                    id_card['IDENTITY'] = smallSig;
                    identified_users.set(uuid,id_card);
                    identity_to_uuid.set(id_card.IDENTITY,uuid);
                })
            }
        })
    })
}

function verifySignature(public_key, signature, data, callback) {
    const algorithm = {
        name: "ECDSA",
        hash: "SHA-256",
    };
    crypto.subtle.verify(algorithm, public_key, signature, data).then((res)=>{
        console.log('signature is ???? valid???',res);
        callback(res);
    });
    
}

function importJWKKey(key_jwk, type, callback) {
    const algorithm = {
      name: "ECDSA",
      namedCurve: "P-256",
    };
    crypto.subtle.importKey("jwk", key_jwk, algorithm, true, type).then((key)=>{
        callback(key);
    });
    
}
function digestMessage(message, callback){
    const msgUint8 = new TextEncoder().encode(message);
    crypto.subtle.digest('SHA-256', msgUint8).then((hashBuffer)=>{
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        callback(hashHex);
    });
}


function IDENTITY_PING(reqesting_uuid, reqested_identity){
    for(let [uuid, ident_card] of identified_users){
        if(reqested_identity == ident_card.IDENTITY){
            connected_users.get(reqesting_uuid).send(JSON.stringify({type: "IDENTITY_PONG", identity: reqested_identity, uuid: uuid}));
            break;
        }
    }

    connected_users.get(reqesting_uuid).send(JSON.stringify({type: "IDENTITY_PONG", identity: reqested_identity, uuid: null}));
}

*/