function createPP(data, chunkSize=10000){
    var chunks = [];
    var start = 0;
    var end = chunkSize;
    while (start < data.length) {
        chunks.push(data.slice(start, end));
        start += chunkSize;
        end += chunkSize;
    }
    let packed = [];
    let i = 1;
    let id = (Math.random()  + 1 ).toString(36).substring(2);
    for(let chunk of chunks){
        packed.push({id: id, item: i, total: chunks.length, data: chunk});
        i++;
    }
    return packed;
}


var waiting = new Map();

function mergePP(package){

    if(!waiting.get(package.id)){
        waiting.set(package.id, []);
    }

    waiting.get(package.id).push(package);

    console.log(waiting.get(package.id).length, package.total,package.id)


    if(waiting.get(package.id).length == package.total){
        
        let done = "";
        for(let s of waiting.get(package.id)){
            done+=s.data;
        }
        console.log(done)
        return done;
        
    }
    return false;

}