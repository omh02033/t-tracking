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
.get('/searchrecord', check, (req, res) => { res.render('loginuser/searchrecord.ejs'); })
.get('/setting', check, (req, res) => { res.render('loginuser/setting.ejs'); })
.get('/tmanage', check, (req, res) => { res.render('loginuser/taekmanager.ejs'); })
.get('/buyer', buyercheck, (req, res) => { res.render('loginuser/buyer.ejs'); })

module.exports = router;

function check(req, res, next) {
    let token = req.cookies.user;
    if(!token){
        res.locals.decoded = null;
        return res.sendFile('loginpage.html', { root: path.join(__dirname, '../public/html') });
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) {
            return res.json(err)
        }
        res.locals.decoded = decoded;
        next();
    });
}

function buyercheck(req, res, next) {
    let token = req.cookies.user;
    if(!token){
        res.locals.decoded = null;
        return res.sendFile('loginpage.html', { root: path.join(__dirname, '../public/html') });
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) {
            return res.json(err)
        }
        let sql = 'SELECT * FROM account WHERE userid=? and id=? and name=?';
        conn.query(sql, [decoded.uid, decoded.unum, decoded.uname], (err, data) => {
            if(err) {
                console.log(err + "(04)");
                res.send('예상치 못한 에러가 발생했습니다.');
            } else {
                let user = data[0];
                if(user.pay2 == 'true') { next(); }
                else if(user.pay2 == 'false') { res.sendFile('notbuypay2.html', { root: path.join(__dirname, '../public/html') }); }
            }
        })
    });
}