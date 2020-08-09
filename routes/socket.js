const Server = require('socket.io');

var io;

function getCook(cookieStr, cookiename) {
    var cookiestring=RegExp(cookiename+"=[^;]+").exec(cookieStr);
    return decodeURIComponent(!!cookiestring ? cookiestring.toString().replace(/^[^=]+./,"") : "");
}

exports.init = function(httpServer){
    if(io === undefined)
        io = new Server(httpServer);

    initSocket();
}

function initSocket(){
    io.on('connection', connectHandler);
}

function connectHandler(socket){
    // console.log(getCook(socket.request.headers.cookie, "user"));
    
    socket.join("abc");

    socket.on('hi', hiHandler);
}

function hiHandler(data){
    let socket = this;
    socket.to("abc").emit("metoo", data);
}