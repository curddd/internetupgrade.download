//CHAT ENTRY WINDOW
var div = document.createElement("div");
div.style.cssText = "position: fixed;bottom: 10px;right: 10px;width: 200px;background-color: rgb(229, 229, 229);text-align: center;z-index:999";
document.body.appendChild(div);

//LOAD STYLED CHAT
fetch(chrome.runtime.getURL('chat.html'))
    .then(response => response.text())
    .then(data => {
    div.innerHTML = data;
    bindChat();
});


//CHAT FUNCTIONALITY
function bindChat(){
    
    /*
    const messagesDiv = document.getElementById('messages-3406983049683046');
    const messageInput = document.getElementById('message-input-3406983049683046');
    const sendButton = document.getElementById('send-button-3406983049683046');
    
    sendButton.addEventListener('click', function() {
        chrome.runtime.sendMessage({type: 'SAY', channel: window.location.href, message: messageInput.value});
        messageInput.value = '';
    });
    messageInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendButton.click();
        }
    });
    */

    //LISTEN TO MSG FROM BACKGROUND
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            console.log(request);
            switch(request.type){
                case 'DEMAND_TO_OFFER':
                    DEMAND_TO_OFFER(request);
                    break;
            }
    });


    const publish = document.getElementById("publish-123415353645");
    const fetch = document.getElementById("fetch-543634534534");

    publish.addEventListener('click', function(){
        chrome.runtime.sendMessage({type: 'PUBLISH', content: {url: window.location.href}});
    });

    fetch.addEventListener('click', function(){
        chrome.runtime.sendMessage({type: 'FETCH', content: {url: window.location.href}});
    });
}




//SERVER SIDE

function DEMAND_TO_OFFER(request){
    if(request.url != window.location.href){
        return;
    }

    let rtc = new serverRTC()
    rtc.connection.onicecandidate = (e)=>{
        if (e.candidate == null) {
            chrome.runtime.sendMessage({type: 'SEND_OFFER', content: {offer_payload: rtc.connection.localDescription, client_uuid: request.client_uuid, url: window.location.href}});
        }
    }
    rtc.createOffer();

}

class serverRTC  {

    constructor(callback){
        var cfg = {'iceServers': [{'url': "stun:stun.gmx.net"}]},
        con = { 'optional': [{'DtlsSrtpKeyAgreement': true}] };

        this.connection = new RTCPeerConnection(cfg, con);
        this.channel = this.connection.createDataChannel('test', {reliable: true});
        this.connection.onicecandidate = callback;
    }

    createOffer(){
        var sdpConstraints = {
            optional: [],
        }

        this.connection.createOffer((desc)=>{
            this.connection.setLocalDescription(desc, function() {}, function() {})
        }, function() { }, sdpConstraints);

    }
}