const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const config = require('../config/jwt');
const path = require('path');

let conn = mysql.createConnection({
    host : process.env.DATABASE_HOST,
    user : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASSWORD,
    database: 'delivery'
});
conn.connect();

router
.get('/', check, (req, res) => { res.sendFile('chat/foundSeller.html', { root: path.join(__dirname, '../public/html') }); })

.get('/:consumer/:denum/:seller', async (req, res) => {
    let sql = 'SELECT * FROM account WHERE id=?';
    let sellerInfo = await NameCheck(sql, req.params.seller, res);
    let consumerInfo = await NameCheck(sql, req.params.consumer, res);

    let token = req.cookies.user;
    if(!token) return res.redirect("/account/login/");
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) return res.send("토큰 값을 불러오는데 실패하였습니다.");
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
                                res.render('chat/index');
                            } else { res.send("판매자 아이디에 해당 송장번호가 존재하지 않습니다."); }
                        });
                    } else { res.send("맞지 않는 url값이 들어왔습니다."); }
                } else {
                    if(req.params.consumer == decoded.unum && req.params.consumer == user.id && decoded.unum == user.id) {
                        let sql1 = 'SELECT * FROM sellerdb WHERE id=? AND denum=?';
                        conn.query(sql1, [req.params.seller, req.params.denum], (err, data) => {
                            if(err) return res.send("데이터를 읽어오는 도중 에러가 발생했습니다.<br>다시 시도해 주세요.");
                            if(data.length == 1) {
                                res.locals.seller = null;
                                res.locals.targetName = sellerInfo.name;
                                res.locals.targetInfo = sellerInfo;
                                res.render('chat/index');
                            } else { res.send("판매자 아이디에 해당 송장번호가 존재하지 않습니다."); }
                        });
                    } else { res.send("맞지 않는 url값이 들어왔습니다."); }
                }
            } else { res.send("존재하지 않는 ID입니다."); }
        });
    });
})

.post('/history', (req, res) => {
    let token = req.cookies.user;
    if(!token) return res.status(400).json({ msg: '토큰을 불러오지 못했습니다.' });
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) return res.status(400).json({ msg: '토큰을 읽지 못했습니다.' });
        let room = req.body.url;

        let sql = 'SELECT * FROM chat WHERE roomID=? ORDER BY `time` ASC, `date` ASC LIMIT 1000';
        conn.query(sql, [room], (err, data) => {
            if(err) return res.status(400).json({ msg: '조회도중 에러가 발생했습니다' });
            res.status(200).json({ result: 'success', data, me: decoded.unum });
        });
    });
})

module.exports = router;

function check(req, res, next) {
    let token = req.cookies.user;
    if(!token){
        return res.sendFile('loginpage.html', { root: path.join(__dirname, '../public/html') });
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) { return res.json(err); }
        return next();
    });
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