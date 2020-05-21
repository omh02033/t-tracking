const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const path = require('path');
const jwt = require('jsonwebtoken');
const secretObj = require('../config/jwt');


let conn = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'delivery'
});
conn.connect();

router
.get('/searchrecord', check, (req, res) => { res.render('/loginuser/searchrecord.ejs'); })

module.exports = router;

function check(req, res, next){
    console.log(req.cookies);
    let token = req.cookies.user;
    jwt.verify(token, config.secret, (err, decoded) => {
        if(err) { res.sendFile('loginpage.html', { root: path.join(__dirname, '../public/html') }); }
        else { next(); }
    });
}