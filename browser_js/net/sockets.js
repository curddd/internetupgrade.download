const sockets = {
    listening: {},
    add(label, onmessage){
        if(!this.listening[label]){
            this.listening[label] = onmessage;
        }
    },
    remove(label){
        delete this.listening[label];
    }
}