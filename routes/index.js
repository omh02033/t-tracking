const express = require('express');
const router = express.Router();
const config = require('../config/jwt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');

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

module.exports = router;

function check(req, res, next){
    let token = req.cookies.user;
    if(!token){
        res.locals.decoded = null;
        return res.render('index');
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) {
            return res.json(err)
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
        return res.render('about/index');
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) {
            return res.json(err)
        }
        res.locals.decoded = decoded;
        next();
    });
}