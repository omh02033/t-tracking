const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const path = require('path');
const jwt = require('jsonwebtoken');
const config = require('../config/jwt');


let conn = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'delivery'
});
conn.connect();

router
.get('/searchrecord/', check, (req, res) => { res.render('loginuser/searchrecord.ejs'); })
.get('/setting/', check, (req, res) => { res.render('loginuser/setting.ejs'); })
.get('/tmanage/', check, (req, res) => { res.render('loginuser/taekmanager.ejs'); })
.get('/chat/', check, (req, res) => { res.render('loginuser/chat.ejs'); })
.get('/chat/:cid/:denum/:sid', chatcheck, (req, res) => { res.render('loginuser/chatsystem.ejs'); })

module.exports = router;

function chatcheck(req, res, next) {
    let token = req.cookies.user;
    if(!token) {
        res.locals.decoded = null;
        return res.sendFile('loginpage.html', { root: path.join(__dirname, '../public/html' ) });
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) { return res.json(err); }
        res.locals.decoded = decoded;
        next();
    })
}

function check(req, res, next) {
    let token = req.cookies.user;
    if(!token){
        res.locals.decoded = null;
        return res.sendFile('loginpage.html', { root: path.join(__dirname, '../public/html') });
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) {
            return res.json(err);
        }
        res.locals.decoded = decoded;
        next();
    });
}