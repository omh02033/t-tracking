function isRegistered(subscribes, payType){
    for(let subscribe of subscribes){
        if(subscribe.type == payType) return true;
    }
    return false;
}


