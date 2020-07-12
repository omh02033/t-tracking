const express = require('express');
const router = express.Router();
const config = require('../config/jwt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

let storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, path.join(__dirname, '../public/images/userProfile/')); },
    filename: function (req, file, cb) { cb(null, String(req.decoded.unum) ); }
});
const upload = multer({storage: storage});

let conn = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'delivery'
});
conn.connect();

router
.get('/', check, (req, res) => { res.render('index'); })
.get('/about/', checkabout, (req, res) => { res.render('about/index'); })
.get('/explain/', (req, res) => { res.sendFile('explain.html', { root: path.join(__dirname, '../public/html') }); })
.get('/form/', youSeller, (req, res) => { res.download(__dirname + "/../public/xlsxForm/deliverySeller.xlsx"); })
.get('/refund/', bcheck, (req, res) => { res.sendFile('refund.html', { root: path.join(__dirname, '../public/html') }); })

.post('/profileUpload/', fcheck, upload.single('proImage'), (req, res) => {
    let token = req.cookies.user;
    if(!token) { res.json({err: 'NO Token'}); }
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) { res.json(err); }
        res.status(200).json({ result: 'success' });
    });
})
.post('/paycheck/', (req, res) => {
    let token = req.cookies.user;
    if(!token) { res.json({err: 'NO Token'}); }
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) throw err;
        let sql = 'SELECT * FROM subsc WHERE id=? and userid=?';
        conn.query(sql, [decoded.unum, decoded.uid], (err, data) => {
            if(err) { res.status(400).json({ err: '예상치 못한 에러가 발생했습니다.' }); }
            if(data.length == 0) { res.send("유료서비스를 먼저 구매해주세요!"); }
            res.status(200).json(data);
        });
    });
})

module.exports = router;

function bcheck(req, res, next) {
    let token = req.cookies.user;
    if(!token) { res.redirect('/account/login'); }
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) throw err;
        let sql = 'SELECT * FROM subsc WHERE id=? and userid=?';
        conn.query(sql, [decoded.unum, decoded.uid], (err, data) => {
            if(err) { return res.send('예상치 못한 에러가 발생했습니다.'); }
            if(data.length == 0) { res.send('유료서비스를 먼저 구매해주세요!'); }
            next();
        });
    });
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

function fcheck(req, res, next) {
    let token = req.cookies.user;
    if(!token){
        res.locals.decoded = null;
        res.locals.seller = null;
        return next();
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) { return res.json(err); }

        let sql = 'SELECT * FROM account WHERE id=? and userid=?';
        conn.query(sql, [decoded.unum, decoded.uid], async (err, data) => {
            if(err) { res.send('예상치 못한 에러가 발생했습니다.'); }
            let user = data[0];
            if(user.pay1 == 'false') { res.locals.payo = false; }
            else if(user.pay1 == 'true') { res.locals.payo = true; }
            req.decoded = decoded;
            res.locals.decoded = decoded;
            res.locals.seller = await sellercheck(decoded.uid);
            next();
        });
    });
}

function isRegistered(subscribes, payType) {
    for(let subscribe of subscribes) {
        if(subscribe.toolname == payType) return true;
    }
    return false;
}

function check(req, res, next){
    let token = req.cookies.user;
    if(!token){
        res.locals.decoded = null;
        res.locals.seller = null;
        return next();
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) { return res.json(err); }
        let sql = 'SELECT * FROM subsc WHERE id=? and userid=?';
        conn.query(sql, [decoded.unum, decoded.uid], async (err, data) => {
            if(err) { res.send('예상치 못한 에러가 발생했습니다.'); }
            
            res.locals.payment = {};
            let paymentTypes = ["pay1", "pay2", "pay3"];
            for(let type of paymentTypes) {
                res.locals.payment[type] = isRegistered(data, type);
            }

            req.decoded = decoded;
            res.locals.decoded = decoded;
            res.locals.seller = await sellercheck(decoded.uid);
            next();
        })
    });
}

function checkabout(req, res, next){
    let token = req.cookies.user;
    if(!token){
        res.locals.decoded = null;
        res.locals.seller = null;
        res.locals.payo = null;
        res.locals.payt = null;
        return next();
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) {
            return res.json(err);
        }
        let sql = 'SELECT * FROM subsc WHERE id=? and userid=?';
        conn.query(sql, [decoded.unum, decoded.uid], (err, data) => {
            if(err) { res.send('예상치 못한 에러가 발생했습니다.'); }

            res.locals.payment = {};
            let paymentTypes = ["pay1", "pay2", "pay3"];
            for(let type of paymentTypes) {
                res.locals.payment[type] = isRegistered(data, type);
            }
            res.locals.decoded = decoded;
            res.locals.seller = sellercheck(decoded.uid);
            next();
        })
    });
}

function youSeller(req, res, next) {
    let token = req.cookies.user;
    if(!token) {
        res.locals.decoded = null;
        res.locals.seller = null;
        return res.sendFile('loginpage.html', { root: path.join(__dirname, '../public/html') });
    }
    jwt.verify(token, config.secret, async (err, decoded) => {
        if(err) { return res.json(err); }
        res.locals.decoded = decoded;
        let seller = await sellercheck(decoded.uid);
        if(seller) { return next(); }
        else { return res.sendFile('yournotseller.html', { root: path.join(__dirname, '../public/html') }); }
    })
}