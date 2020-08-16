const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const path = require('path');
const jwt = require('jsonwebtoken');
const config = require('../config/jwt');
let sha256 = require('./sha256');


let conn = mysql.createConnection({
    host : process.env.DATABASE_HOST,
    user : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASSWORD,
    database : 'delivery'
});
conn.connect();

router
.get('/searchrecord/', check, (req, res) => { res.render('loginuser/searchrecord.ejs'); })
.get('/setting/', check, (req, res) => { res.render('loginuser/setting.ejs'); })
.get('/tmanage/', check, (req, res) => { res.render('loginuser/taekmanager.ejs'); })
.get('/chat/', check, (req, res) => { res.render('loginuser/chat.ejs'); })
.get('/chat/:cid/:denum/:sid', chatcheck, (req, res) => { res.render('loginuser/chatsystem.ejs'); })
.get('/delienr/', youSeller, (req, res) => { res.render('loginuser/delienr.ejs'); })

module.exports = router;

function chatcheck(req, res, next) {
    let token = req.cookies.user;
    if(!token) {
        res.locals.decoded = null;
        res.locals.ProFile = null;
        res.locals.seller = null;
        return res.sendFile('loginpage.html', { root: path.join(__dirname, '../public/html' ) });
    }
    jwt.verify(token, config.secret, async (err, decoded) => {
        if(err) { return res.json(err); }
        res.locals.decoded = decoded;
        res.locals.ProFile = sha256(String(decoded.unum));
        res.locals.seller = await sellercheck(decoded.uid);
        next();
    })
}

function check(req, res, next) {
    let token = req.cookies.user;
    if(!token){
        res.locals.decoded = null;
        res.locals.ProFile = null;
        res.locals.seller = null;
        return res.sendFile('loginpage.html', { root: path.join(__dirname, '../public/html') });
    }
    jwt.verify(token, config.secret, async (err, decoded) => {
        if(err) { return res.json(err); }
        res.locals.decoded = decoded;
        res.locals.ProFile = sha256(String(decoded.unum));
        res.locals.seller = await sellercheck(decoded.uid);
        next();
    });
}

function youSeller(req, res, next) {
    let token = req.cookies.user;
    if(!token) {
        res.locals.decoded = null;
        res.locals.ProFile = null;
        res.locals.seller = null;
        return res.sendFile('loginpage.html', { root: path.join(__dirname, '../public/html') });
    }
    jwt.verify(token, config.secret, async (err, decoded) => {
        if(err) { return res.json(err); }
        res.locals.decoded = decoded;
        res.locals.ProFile = sha256(String(decoded.unum));
        let seller = await sellercheck(decoded.uid);
        if(seller) {
            res.locals.seller = seller;
            return next();
        }
        else { return res.sendFile('yournotseller.html', { root: path.join(__dirname, '../public/html') }); }
    })
}

function sellercheck(uid) {
    let sql = 'SELECT * FROM account WHERE userid=?';
    return new Promise((resolve, reject)=>{
        conn.query(sql, [uid], (err, data) => {
            if(err) { resolve(null); }
            else {
                let user = data[0];
                if(user.seller == 'true') { resolve(true) }
                else { resolve(null); }
            }
        });
    })
}