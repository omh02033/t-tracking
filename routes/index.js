const express = require('express');
const router = express.Router();
const config = require('../config/jwt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const path = require('path');

let conn = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'delivery'
});
conn.connect();

router
.get('/', check, (req, res) => {
    res.render('index');
})
.get('/about/', checkabout, (req, res) => {
    res.render('about/index');
})
.get('/explain/', (req, res) => {
    res.sendFile('explain.html', { root: path.join(__dirname, '../public/html') });
})

module.exports = router;

function check(req, res, next){
    let token = req.cookies.user;
    if(!token){
        res.locals.decoded = null;
        return next();
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) {
            return res.json(err);
        }
        let sql = 'SELECT * FROM account WHERE id=? and userid=?';
        conn.query(sql, [decoded.unum, decoded.uid], (err, data) => {
            if(err) { res.send('예상치 못한 에러가 발생했습니다.'); }
            let user = data[0];
            if(user.pay1 == 'false') { res.locals.payo = false; }
            else if(user.pay1 == 'true') { res.locals.payo = true; }
            res.locals.decoded = decoded;
            next();
        })
    });
}

function checkabout(req, res, next){
    let token = req.cookies.user;
    if(!token){
        res.locals.decoded = null;
        res.locals.payo = null;
        res.locals.payt = null;
        return next();
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) {
            return res.json(err);
        }
        let sql = 'SELECT * FROM account WHERE id=? and userid=?';
        conn.query(sql, [decoded.unum, decoded.uid], (err, data) => {
            if(err) { res.send('예상치 못한 에러가 발생했습니다.'); }
            let user = data[0];
            if(user.pay1 == 'false') { res.locals.payo = false; }
            else if(user.pay1 == 'true') { res.locals.payo = true; }
            if(user.pay2 == 'false') { res.locals.payt = false; }
            else if(user.pay2 == 'true') { res.locals.payt = true; }
            res.locals.decoded = decoded;
            next();
        })
    });
}