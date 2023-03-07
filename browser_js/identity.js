const identity = {

    loaded: false,
    ident: {},
    async init(){
        this.ident = window.localStorage.getItem('identity') || 'NOIDENT';

        if(this.ident == 'NOIDENT'){
            await this.generateIdent();
        }
        else{
            this.ident = JSON.parse(this.ident);
        }

        await this.importKeys(this.ident);
        this.ident.IDENTITY = await this.identDigest(JSON.stringify(this.ident.public_key));
        window.localStorage.setItem('FRIENDCODE',this.ident.IDENTITY);
        this.loaded = true;
        
    },

    async generateIdent(){
        let uuid = (Math.random() + 1).toString(36).substring(2);

        const algorithm = {
            name: "ECDSA",
            namedCurve: "P-256",
        };
        const usages = ["sign", "verify"];
        const keyPair = await window.crypto.subtle.generateKey(algorithm, true, usages);

        const private_key = await window.crypto.subtle.exportKey("jwk",keyPair.privateKey);
        const public_key = await window.crypto.subtle.exportKey("jwk",keyPair.publicKey);

        this.ident = {private_key:private_key, public_key:public_key};
        window.localStorage.setItem('identity',JSON.stringify(this.ident));
    },

    async importKeys(ident){
        const algorithm = {
            name: "ECDSA",
            namedCurve: "P-256",
        };
        this.private_key = await window.crypto.subtle.importKey("jwk", ident.private_key, algorithm, true, ["sign"]);
        this.public_key = await window.crypto.subtle.importKey("jwk", ident.public_key, algorithm, true, ["verify"]);
    
    },

    async sign(data){
        if(!this.loaded){
            return;
        }

        const enc = new TextEncoder();
        const message = enc.encode(data); 

        const algorithm = {
            name: "ECDSA",
            hash: "SHA-256",
        };
        const signature = new Uint8Array(await crypto.subtle.sign(algorithm, this.private_key, message));
        var base64String = btoa(String.fromCharCode.apply(null, signature));

        return base64String;
    },

    
    async verifySignature(public_key, signature, data) {
        const algorithm = {
            name: "ECDSA",
            hash: "SHA-256",
        };
        const isValid = await crypto.subtle.verify(algorithm, public_key, signature, data);
        return isValid;
    },

    async identDigest(message, callback){
        const msgUint8 = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        console.log(hashHex)
        let smallSig = "";
        for(let i=0; i<hashHex.length; i+=8){
            smallSig+=hashHex[i];
        }
        return smallSig;
    }


    

}

identity.init();
