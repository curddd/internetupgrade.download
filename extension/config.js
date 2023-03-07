
document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(['server', 'nick'], (result)=>{
        document.getElementById('nick').value = result.nick;
        document.getElementById('server').value = result.server;
    });
});

document.getElementById('save').addEventListener('click', ()=>{
    chrome.storage.local.set({'nick': document.getElementById('nick').value});
    chrome.storage.local.set({'server': document.getElementById('server').value});
    chrome.runtime.reload()
});

