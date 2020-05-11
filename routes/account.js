const express = require('express');
const router = express.Router();
const path = require('path');
const mysql = require('mysql');
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
.get('/', (req, res) => {
    res.sendFile('account/index.html', { root: path.join(__dirname, '../public/html') });
})
.get('/login/', (req, res) => {
    res.sendFile('account/login.html', { root: path.join(__dirname, '../public/html') });
})
.get('/signup/', (req, res) => {
    res.sendFile('account/signup.html', { root: path.join(__dirname, '../public/html') });
})

.post('/login/', (req, res) => {
    let uid = req.body.id;
    let upass = req.body.password;
    let token = jwt.sign({
        id: uid,
    });
    let sql = 'SELECT * FROM account WHERE userid=?';
    conn.query(sql, [uid], (err, data) => {
        if(err) {
            res.status(400).json({
                msg: '에러가 발생했습니다.'
            })
        } else if(data.length < 1) {
            res.status(200).json({
                msg: '아이디 또는 비밀번호가 일치하지 않습니다.',
                result: 'fail'
            });
        } else if(data.length >= 1) {
            let user = data[0];
            if(user.userpass == upass) {
                // 로그인 성공
                res.cookie("user", token);
                res.json({ token: token });
                res.status(200).json({
                    msg: '로그인에 성공하였습니다.',
                    result: 'success'
                });
            } else {
                res.status(200).json({
                    msg: '아이디 또는 비밀번호가 일치하지 않습니다.',
                    result: 'fail'
                });
            }
        }
    });
})

.post('/signup/', (req, res) => {
    let uid = req.body.id;
    let upass = req.body.password;
    let uphone = req.body.phone;
    let uname = req.body.nick;
    let sql = 'INSERT INTO account (userid, userpass, phone, name) VALUES(?, ?, ?, ?)';
    conn.query(sql, [uid, upass, uphone, uname], (err, rows, fields) => {
        if(err) {
            console.log('signup : error');
            res.status(400).json({
                msg: '저장하는데 에러가 발생했습니다.',
                result: 'fail'
            });
        } else {
            console.log('signup : succress');
            res.status(200).json({
                msg: '유저 등록이 성공적으로 이루어졌습니다.',
                result: 'success'
            });
        }
    });
})
.post('/overlap/', (req, res) => {
    let uid = req.body.id;
    let sql = 'SELECT * FROM account WHERE userid=?';
    conn.query(sql, [uid], (err, rows, fields) => {
        if(err) {
            res.status(400).json({
                msg: '중복 확인도중 에러가 발생했습니다 !'
            })
        } else {
            if(rows.length < 1) {
                res.status(200).json({
                    msg: '중복확인 된것이 없습니다.',
                    result: 'success'
                });
            } else {
                res.status(200).json({
                    msg: '중복 아이디가 존재 합니다.',
                    result: 'fail'
                });
            }
        }
    });
})

module.exports = router;