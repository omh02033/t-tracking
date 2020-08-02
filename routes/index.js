const express = require('express');
const router = express.Router();
const config = require('../config/jwt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const path = require('path');
const multer = require('multer');
const moment = require('moment');

let storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, path.join(__dirname, '../public/images/userProfile/')); },
    filename: function (req, file, cb) { cb(null, String(req.decoded.unum) ); }
});
const upload = multer({storage: storage});

let conn = mysql.createConnection({
    host : process.env.DATABASE_HOST,
    user : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASSWORD,
    database : 'delivery'
});
conn.connect();

router
.get('/', ech, check, (req, res) => { res.render('index'); })
.get('/about/', ech, checkabout, (req, res) => { res.render('about/index'); })
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
        let sql = 'SELECT * FROM subsc WHERE id=? and userid=? ORDER BY `toolname` ASC LIMIT 1000;';
        conn.query(sql, [decoded.unum, decoded.uid], (err, data) => {
            if(err) { res.status(400).json({ err: '예상치 못한 에러가 발생했습니다.' }); }
            if(data.length == 0) { res.send("유료서비스를 먼저 구매해주세요!"); }
            res.status(200).json(data);
        });
    });
})

.post('/refund/cardcheck/', (req, res) => {
    let token = req.cookies.user;
    if(!token) { res.redirect('/account/login/'); }
    else {
        jwt.verify(token, config.secret, (err, decoded) => {
            if(err) { return res.status(400).json({ msg: '에러가 발생했습니다..' }); }
            let sql = 'SELECT * FROM payment WHERE id=? AND toolname=?';
            conn.query(sql, [decoded.uid, req.body.toolname], (err, data) => {
                if(err) { return res.status(400).json({msg: '확인도중 에러가 발생했습니다..'}); }
                let info = data[0];
                res.status(200).json({ cardno: info.card_no });
            });
        });
    }
})

.post('/refund/try/', (req, res) => {
    let token = req.cookies.user;
    if(!token) { res.redirect('/accountn/login/'); }
    else {
        jwt.verify(token, config.secret, (err, decoded) => {
            if(err) { return res.status(400).json({ msg: '에러가 발생했습니다..' }); }
            let sql = 'SELECT * FROM payment WHERE id=? AND toolname=?';
            conn.query(sql, [decoded.uid, req.body.toolname], (err, data) => {
                if(err) { return res.status(400).json({ msg: '확인도중 에러가 발생했습니다..' }); }
                let info = data[0];
                BootpayRest.setConfig(
                    "5ef815974f74b40021f2b98c",
                    "9VV9mQE4zOv+NdtKirEDIDFqAqY9ZZXcpES9UCBRWxE="
                );
                
                BootpayRest.getAccessToken().then(function (token) {
                    if (token.status === 200) {
                        BootpayRest.cancel(info.receipt_id, req.body.refund_pay, req.body.username, '').then(function (response) {
                            if (response.status === 200) {
                                let sql = 'DELETE FROM payment WHERE id=? AND toolname=?';
                                conn.query(sql, [decoded.uid, req.body.toolname], (err, data) => {
                                    if(err) { return res.status(400).json({ msg: '삭제하는 과정에서 에러가 발생했습니다.' }); }
                                });
                                let sq = 'DELETE FROM subsc WHERE id=? AND toolname=? AND userid=?';
                                conn.query(sq, [decoded.uid, req.body.toolname, req.body.userid], (err, data) => {
                                    if(err) { return res.status(400).json({ msg: '삭제하는 과정에서 에러가 발생했습니다.' }); }
                                });
                                // TODO: 결제 취소에 관련된 로직을 수행하시면 됩니다.
                                res.status(200).json({ msg: "결제최소가 완료되었습니다." });
                            }
                        });
                    }
                });
            });
        });
    }
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

function ech(req, res, next) {
    let token = req.cookies.user;
    if(!token) { next(); }
    else {
        jwt.verify(token, config.secret, (err, decoded) => {
            if(err) { return next(); }
            let sql = 'SELECT * FROM subsc WHERE id=? AND userid=?';
            conn.query(sql, [decoded.unum, decoded.uid], (err ,data) => {
                if(err) { return next(); }
                if(data.length == 0) { next(); }
                else {
                    let date = moment();
                    let now = date.format("YYYYMMDD");
                    for(let i=0; i<data.length; i++) {
                        if(data[i].toolname == "pay1") {
                            if(data[i].end_at > now) {
                                let dsql = 'DELETE FROM subsc WHERE id=? AND toolname=? AND userid=?';
                                conn.query(dsql, [decoded.unum, data[i].toolname, decoded.uid], (err, data1) => {
                                    if(err) { return res.status(400).json({ msg: '삭제하는 과정에서 에러가 발생했습니다.' }); }
                                    next();
                                });
                            } else { next(); }
                        }
                    }
                }
            });
        });
    }
}