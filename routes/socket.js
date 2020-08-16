const Server = require('socket.io');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const config = require('../config/jwt');

let conn = mysql.createConnection({
    host : process.env.DATABASE_HOST,
    user : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASSWORD,
    database: 'delivery'
});
conn.connect();

var io;

function getCook(cookieStr, cookiename) {
    var cookiestring=RegExp(cookiename+"=[^;]+").exec(cookieStr);
    return decodeURIComponent(!!cookiestring ? cookiestring.toString().replace(/^[^=]+./,"") : "");
}

exports.init = function(httpServer) {
    if(io === undefined)
        io = new Server(httpServer);

    initSocket();
}

function initSocket() {
    io.on('connection', connectHandler);
}

function connectHandler(socket) {
    // console.log(getCook(socket.request.headers.cookie, "user"));
    let room = GetRoomId(socket);

    socket.join(room);

    socket.on('hi', hiHandler);
}

function hiHandler(data) {
    let socket = this;
    let room = GetRoomId(socket);

    let sender;
    let recipient;
    let denum = socket.handshake.headers.referer.split('/')[5];

    let token = getCook(socket.request.headers.cookie, "user");
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) return console.log(err);
        sender = decoded.unum;
        if(sender == socket.handshake.headers.referer.split('/')[4]) recipient = socket.handshake.headers.referer.split('/')[6];
        else recipient = socket.handshake.headers.referer.split('/')[4];
    });

    let today = new Date();   

    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    let week = today.getDay();
    let KoWeek;

    if(week == 0) KoWeek = '일요일';
    else if(week == 1) KoWeek = '월요일';
    else if(week == 2) KoWeek = '화요일';
    else if(week == 3) KoWeek = '수요일';
    else if(week == 4) KoWeek = '목요일';
    else if(week == 5) KoWeek = '금요일';
    else if(week == 6) KoWeek = '토요일';

    let date = `${year}년 ${month}월 ${day}일`;
    let time = today.toLocaleTimeString();

    let sql = 'INSERT INTO chat (`senderID`, `recipientID`, `roomID`, `denum`, `content`, `date`, `week`, `time`) VALUES(?, ?, ?, ?, ?, ?, ?, ?)';
    conn.query(sql, [sender, recipient, room, denum, data, date, KoWeek, time], (err, rows, fields) => {
        if(err) console.log('Error : ', err);
    });
    socket.to(room).emit("metoo", data);
}

function GetRoomId(socket) {
    let url = socket.handshake.headers.referer;
    let url1 = url.split('/');
    return `${url1[4]}.${url1[5]}.${url1[6]}`;
}