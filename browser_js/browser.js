const screenInterface = {

    power: false,


    toggleSwitch(){
        if(this.power){
            window.removeEventListener('message', onMessage)
            this.powerOff();
            
        }
        else{
            window.addEventListener('message', onMessage);
            this.powerOn();
        }
        this.power = !this.power;

    },

    state: 'off',
    powerOn(){
    
        this.browser.innerHTML = '';

        this.screen = document.createElement('iframe');
        this.screen.src = "screen.html";

        let res = document.getElementById('resolution').value.split('x');
        this.screen.width = res[0];
        this.screen.height = res[1];
        this.browser.appendChild(this.screen);

        this.state = 'booting';
        
    },
    
    powerOff(){
        //kill all frames etc... 
        
    },
    
    postMessage(message){
        this.screen.contentWindow.postMessage(message, '*');
    }

    
}


function updatedFileList(){
    screenInterface.postMessage({op: 'BUS', ticket_id: 'trusted db_file_list', db_file_list: database.fileList});
    screenInterface.postMessage({op: 'BUS', ticket_id:'all draw'});
console.log('sent ;)')
    
}

function openFile(file){
    screenInterface.postMessage({op: 'FROM_DB', action: 'openFile', capsule: file});
}

function openTrustedFile(file){
    screenInterface.postMessage({op: 'FROM_DB', action: 'openTrustedFile', capsule: file});
}


function onMessage(e){
    switch(e.data.type){
        
        case 'SCREEN_READY':
            if(screenInterface.state == 'booting'){
                screenInterface.state = 'booted';
                screenInterface.postMessage({op: "START_SCREEN", w: screenInterface.screen.width, h: screenInterface.screen.height, autoLoad: autoFile});
            }
        break;

    }
}




let autoFile = null;
window.addEventListener('DOMContentLoaded', ()=>{

    screenInterface.browser = document.getElementById('browser');
    let powerSwitch = document.getElementById('powerSwitch');
    powerSwitch.addEventListener('click',(e)=>{
        screenInterface.toggleSwitch();
    })

    if(window.location.hash != ''){
        autoFile = window.location.hash.substring(1);
    }

})