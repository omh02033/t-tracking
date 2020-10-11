const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const config = require('../config/jwt');
const path = require('path');
const sha256 = require('./sha256');

let conn = mysql.createConnection({
    host : process.env.DATABASE_HOST,
    user : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASSWORD,
    database: 'delivery'
});
conn.connect();

router
.get('/', check, (req, res) => {
    if(req.query.location == 'denum') res.render('chat/foundSeller');
    else if(req.query.location == 'auto') res.render('chat/autoFound');
    else if(req.query.location == 'history') {
        let token = req.cookies.user;
        if(!token) return res.redirect('/account/login');
        jwt.verify(token, config.secret, (err, decoded) => {
            if(err) return res.send("예상치 못한 에러가 발생했습니다.");

            let sql = 'SELECT * FROM (SELECT * FROM chat WHERE senderID=? OR recipientID=? ORDER BY `date` DESC, `time` DESC LIMIT 1000) AS chat GROUP BY roomID';
            conn.query(sql, [decoded.unum, decoded.unum], (err, data) => {
                if(err) return res.send('예상치 못한 에러가 발생했습니다.');
                let dt = data;
                dt.sort(function(a, b) {
                    return a.date > b.date ? -1 : a.date < b.date ? 1 : 0;
                });
                dt.sort(function(a, b) {
                    return a.time > b.time ? -1 : a.time < b.time ? 1 : 0;
                });
                res.locals.chatData = dt;
                res.locals.sha256 = sha256;
                res.locals.me = decoded.unum;
                res.render('chat/history');
            });
        });
    }
    else res.render('chat/foundSeller');
})
.get('/chatnotfound', (req, res) => {
    res.sendFile('chatnotfound.html', { root: path.join(__dirname, '../public/html/err') });
})

.get('/:consumer/:denum/:seller/history', async (req, res) => {
    let sql = 'SELECT * FROM account WHERE id=?';
    let sellerInfo = await NameCheck(sql, req.params.seller, res);
    let consumerInfo = await NameCheck(sql, req.params.consumer, res);

    let token = req.cookies.user;
    if(!token) return res.redirect("/account/login/");
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) return res.send("토큰 값을 불러오는데 실패하였습니다.");

        if(req.params.consumer == req.params.seller) return res.sendFile('meandme.html', { root: path.join(__dirname, '../public/html/err') });

        conn.query(sql, [decoded.unum], (err, data) => {
            if(err) return res.send("데이터를 읽어오는 도중 에러가 발생했습니다.<br>다시 시도해 주세요.");
            if(data.length == 1) {
                let user = data[0];
                if(user.seller == 'true') {
                    if(req.params.seller == decoded.unum && req.params.seller == user.id && decoded.unum == user.id) {
                        let sql1 = 'SELECT * FROM sellerdb WHERE id=? AND denum=?';
                        conn.query(sql1, [req.params.seller, req.params.denum], (err, data) => {
                            if(err) return res.send("데이터를 읽어오는 도중 에러가 발생했습니다.<br>다시 시도해 주세요.");
                            if(data.length == 1) {
                                res.locals.seller = true;
                                res.locals.targetName = consumerInfo.name;
                                res.locals.targetInfo = consumerInfo;
                                res.locals.ProFile = sha256(String(consumerInfo.id));
                                res.render('chat/historychat');
                            } else { res.send("판매자 아이디에 해당 송장번호가 존재하지 않습니다."); }
                        });
                    } else {
                        let sql1 = 'SELECT * FROM sellerdb WHERE id=? AND denum=?';
                        conn.query(sql1, [req.params.seller, req.params.denum], (err, data) => {
                            if(err) return res.send("데이터를 읽어오는 도중 에러가 발생했습니다.<br>다시 시도해 주세요.<br>1-1");
                            if(data.length == 1) {
                                res.locals.seller = null;
                                res.locals.targetName = sellerInfo.name;
                                res.locals.targetInfo = sellerInfo;
                                res.locals.ProFile = sha256(String(sellerInfo.id));
                                res.render('chat/historychat');
                            } else { res.send("판매자 아이디에 해당 송장번호가 존재하지 않습니다."); }
                        });
                    }
                } else {
                    if(req.params.consumer == decoded.unum && req.params.consumer == user.id && decoded.unum == user.id) {
                        let sql1 = 'SELECT * FROM sellerdb WHERE id=? AND denum=?';
                        conn.query(sql1, [req.params.seller, req.params.denum], (err, data) => {
                            if(err) return res.send("데이터를 읽어오는 도중 에러가 발생했습니다.<br>다시 시도해 주세요.");
                            if(data.length == 1) {
                                res.locals.seller = null;
                                res.locals.targetName = sellerInfo.name;
                                res.locals.targetInfo = sellerInfo;
                                res.locals.ProFile = sha256(String(sellerInfo.id));
                                res.render('chat/historychat');
                            } else { res.send("판매자 아이디에 해당 송장번호가 존재하지 않습니다."); }
                        });
                    } else { res.send("맞지 않는 url값이 들어왔습니다."); }
                }
            } else { res.send("존재하지 않는 ID입니다."); }
        });
    });
})

.get('/:consumer/:denum/:seller', async (req, res) => {
    let sql = 'SELECT * FROM account WHERE id=?';
    let sellerInfo = await NameCheck(sql, req.params.seller, res);
    let consumerInfo = await NameCheck(sql, req.params.consumer, res);

    let token = req.cookies.user;
    if(!token) return res.redirect("/account/login/");
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) return res.send("토큰 값을 불러오는데 실패하였습니다.");

        if(req.params.consumer == req.params.seller) return res.sendFile('meandme.html', { root: path.join(__dirname, '../public/html/err') });

        conn.query(sql, [decoded.unum], (err, data) => {
            if(err) return res.send("데이터를 읽어오는 도중 에러가 발생했습니다.<br>다시 시도해 주세요.");
            if(data.length == 1) {
                let user = data[0];
                if(user.seller == 'true') {
                    if(req.params.seller == decoded.unum && req.params.seller == user.id && decoded.unum == user.id) {
                        let sql1 = 'SELECT * FROM sellerdb WHERE id=? AND denum=?';
                        conn.query(sql1, [req.params.seller, req.params.denum], (err, data) => {
                            if(err) return res.send("데이터를 읽어오는 도중 에러가 발생했습니다.<br>다시 시도해 주세요.");
                            if(data.length == 1) {
                                res.locals.seller = true;
                                res.locals.targetName = consumerInfo.name;
                                res.locals.targetInfo = consumerInfo;
                                res.locals.ProFile = sha256(String(consumerInfo.id));
                                res.render('chat/index');
                            } else { res.send("판매자 아이디에 해당 송장번호가 존재하지 않습니다."); }
                        });
                    } else {
                        let sql1 = 'SELECT * FROM sellerdb WHERE id=? AND denum=?';
                        conn.query(sql1, [req.params.seller, req.params.denum], (err, data) => {
                            if(err) return res.send("데이터를 읽어오는 도중 에러가 발생했습니다.<br>다시 시도해 주세요.<br>1-1");
                            if(data.length == 1) {
                                res.locals.seller = null;
                                res.locals.targetName = sellerInfo.name;
                                res.locals.targetInfo = sellerInfo;
                                res.locals.ProFile = sha256(String(sellerInfo.id));
                                res.render('chat/index');
                            } else { res.send("판매자 아이디에 해당 송장번호가 존재하지 않습니다."); }
                        });
                    }
                } else {
                    if(req.params.consumer == decoded.unum && req.params.consumer == user.id && decoded.unum == user.id) {
                        let sql1 = 'SELECT * FROM sellerdb WHERE id=? AND denum=?';
                        conn.query(sql1, [req.params.seller, req.params.denum], (err, data) => {
                            if(err) return res.send("데이터를 읽어오는 도중 에러가 발생했습니다.<br>다시 시도해 주세요.");
                            if(data.length == 1) {
                                res.locals.seller = null;
                                res.locals.targetName = sellerInfo.name;
                                res.locals.targetInfo = sellerInfo;
                                res.locals.ProFile = sha256(String(sellerInfo.id));
                                res.render('chat/index');
                            } else { res.send("판매자 아이디에 해당 송장번호가 존재하지 않습니다."); }
                        });
                    } else { res.send("맞지 않는 url값이 들어왔습니다."); }
                }
            } else { res.send("존재하지 않는 ID입니다."); }
        });
    });
})


.post('/seller/found', (req, res) => {
    let token = req.cookies.user;
    if(!token) return res.redirect('/account/login');
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) return res.status(400).json({ msg: '토큰을 읽지 못했습니다.' });
        let denum = req.body.denum;
        let sql = 'SELECT * FROM sellerdb WHERE denum=?';
        conn.query(sql, [denum], (err, data) => {
            if(err) return res.status(400).json({ msg: '데이터 확인중 에러가 발생했습니다.' });
            if(data.length == 0) { res.status(200).json({ result: 'notFound', msg: '송장을 등록한 판매자가 없습니다.' }); }
            else {
                let seller = data[0];
                res.status(200).json({
                    result: 'success',
                    sellerID: seller.id,
                    myID: decoded.unum,
                    toolname: seller.toolname,
                    denum: seller.denum,
                    estimated: seller.estimated,
                    sellerName: seller.name
                });
            }
        });
    });
})

.post('/seller/found/auto', (req, res) => {
    let token = req.cookies.user;
    if(!token) return res.redirect('/account/login');
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) return res.status(400).json({ msg: '토큰을 읽지 못했습니다.' });
        let sql = 'SELECT * FROM delirecord WHERE id=?';
        conn.query(sql, [decoded.unum], async (err, data) => {
            if(err) return res.status(400).json({ msg: '데이터를 조회하는 과정에서 에러가 발생했습니다.' });
            if(data.length == 0) return res.status(200).json({ result: 'fail' });
            
            let sql1 = 'SELECT * FROM sellerdb WHERE denum=?';
            let promises = [];
            for(let i=0; i<data.length; i++) {
                promises.push( 
                    new Promise((resolve, reject) => {
                        conn.query(sql1, [data[i].denum], (err, data1) => {
                            if(err) reject(err);
                            if(data1.length > 0) resolve(data1[0]);
                            else return res.status(200).json({ result: 'fail' });
                        });
                    }) 
                )
            }

            // Promise : await - promise : promise 한개를 기다리겠다.
            // promise.then() : 한개를 기다리겠다.
            // Promise.all([promise]) : promise가 여러개있을때 그 여러개를 다 기다라겠다.
            try{
                const chseller = await Promise.all(promises)
                res.status(200).json({ result: 'success', chseller, me: decoded.unum });
            } catch(err){
                console.log(err);
                return res.status(400).json({ msg: '상대를 조회하는 과정에서 에러가 발생했습니다.' });
            }
        });
    });
})

.post('/history', (req, res) => {
    let token = req.cookies.user;
    if(!token) return res.status(400).json({ msg: '토큰을 불러오지 못했습니다.' });
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) return res.status(400).json({ msg: '토큰을 읽지 못했습니다.' });
        let room = req.body.url;

        let sql = 'SELECT * FROM chat WHERE roomID=? ORDER BY `date` ASC, `time` ASC LIMIT 1000;';
        conn.query(sql, [room], (err, data) => {
            if(err) return res.status(400).json({ msg: '조회도중 에러가 발생했습니다' });
            res.status(200).json({ result: 'success', data, me: decoded.unum });
        });
    });
})

.post('/readed', (req, res) => {
    let data = req.body.data;
    let sql = 'UPDATE chat SET `readS`=? WHERE senderID=? AND recipientID=? AND roomID=? AND denum=? AND content=? AND date=? AND week=? AND time=?';
    conn.query(sql, [0, data.senderID, data.recipientID, data.roomID, data.denum, data.content, data.date, data.week, data.time], (err) => {
        if(err) { console.log(err);return res.status(400).json({ msg: '데이터를 변경하는 과정에서 에러가 발생했습니다.' }); }
        res.status(200).json({ result: 'success' });
    });
})

.get('/getTime', (req, res) => {
    let today = new Date();
    let time = today.toLocaleTimeString();
    res.status(200).json({ time });
})
.get('/getWeek', (req, res) => {
    let today = new Date;

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

    res.status(200).json({ date, KoWeek });
})
.get('/getMsgid', (req, res) => {
    let today = new Date;

    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    let week = today.getDay();

    let shmonth;
    let shday;

    if(String(month).length == 1) { shmonth = `0${month}`; }
    else shmonth = month;
    if(String(day).length == 1) { shday = `0${day}`; }
    else shday = day;

    res.status(200).json({
        year,
        month: shmonth,
        day: shday,
        week,
        hours: today.getHours(),
        minutes: today.getMinutes(),
        seconds: today.getSeconds(),
        milliseconds: today.getMilliseconds()
    });
})

module.exports = router;

function check(req, res, next) {
    let token = req.cookies.user;
    if(!token){
        res.locals.decoded = null;
        res.locals.ProFile = null;
        res.locals.seller = null;
        return res.sendFile('loginpage.html', { root: path.join(__dirname, '../public/html/err') });
    }
    jwt.verify(token, config.secret, async (err, decoded) => {
        if(err) { return res.json(err); }
        res.locals.decoded = decoded;
        res.locals.ProFile = sha256(String(decoded.unum));
        res.locals.seller = await sellercheck(decoded.uid);
        next();
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

async function NameCheck(sql, who, res) {
    return new Promise((resolve, reject) => {
        conn.query(sql, [who], (err, data) => {
            if(err) return res.send("데이터를 읽어오는 도중 에러가 발생했습니다.<br>다시 시도해 주세요.");
            if(data.length == 1) {
                resolve(data[0]);
            } else { res.send("존재하지 않는 아이디입니다."); }
        });
    })
}