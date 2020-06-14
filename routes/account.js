const express = require('express');
const router = express.Router();
const path = require('path');
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const config = require('../config/jwt');

let conn = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'delivery'
});
conn.connect();

function sm(email, res) {
    let code = Math.floor(Math.random() * 1000000) + 100000;
    if(code > 100000) {
        code = code - 100000;
    }
    let transporter = nodemailer.createTransport({
        service: 'Naver',
        host: 'smtp.naver.com',
        port: 587,
        auth: {
            user: 'sansogknnamu52@naver.com',
            pass: 'nagong-52'
        }
    });
    let mailOptions = {
        from: 'sansogknnamu52@naver.com',
        to: email,
        subject: '통합 택배 조회 서비스 이메일 계정 본인확인',
        text: `(회원가입) 인증번호 : ${code}`
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if(err) {
            console.log(err);
        } else {
            console.log(`send Mail : ${info.response}`);
            return res.status(200).json({
                result: 'success',
                code: code
            });
        }
    })
}

router
.get('/', check, (req, res) => {
    res.sendFile('account/index.html', { root: path.join(__dirname, '../public/html') });
})
.get('/login/', check, (req, res) => {
    res.sendFile('account/login.html', { root: path.join(__dirname, '../public/html') });
})
.get('/signup/', check, (req, res) => {
    res.sendFile('account/signup.html', { root: path.join(__dirname, '../public/html') });
})
.get('/forget/', check, (req, res) => {
    res.sendFile('account/forget.html', { root: path.join(__dirname, '../public/html') });
})
.get('/forget/id/', check, (req, res) => {
    res.sendFile('account/fid.html', { root: path.join(__dirname, '../public/html') });
})
.get('/forget/password/', check, (req, res) => {
    res.sendFile('account/fpass.html', { root: path.join(__dirname, '../public/html') });
})
.get('/logout/', (req, res) => {
    res.clearCookie('user');
    res.redirect('/');
})

.post('/login/', (req, res) => {
    let uid = req.body.id;
    let upass = req.body.password;
    let sql = 'SELECT * FROM account WHERE userid=?';
    conn.query(sql, [uid], (err, data) => {
        if(err) {
            console.log(err + "(00)");
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
                let token = jwt.sign({ unum: user.id, uid: user.userid, uname: user.name }, config.secret );
                res.cookie("user", token);
                res.status(200).json({
                    msg: '로그인에 성공하였습니다.',
                    result: 'success',
                    token: token
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
    let uemail = req.body.email;
    let uname = req.body.nick;
    let seller = req.body.seller;
    let sql = 'INSERT INTO account (userid, userpass, phone, email, name, seller) VALUES(?, ?, ?, ?, ?, ?)';
    conn.query(sql, [uid, upass, uphone, uemail, uname, String(seller)], (err, rows, fields) => {
        if(err) {
            console.log(err + "(01)");
            res.status(400).json({
                msg: '저장하는데 에러가 발생했습니다.',
                result: 'fail'
            });
        } else {
            console.log('signup : success');
            res.status(200).json({
                msg: '유저 등록이 성공적으로 이루어졌습니다.',
                result: 'success'
            });
        }
    });
})
.post('/signup/overlap/email/', (req, res) => {
    let email = req.body.uemail;
    let sql = 'SELECT * FROM account WHERE email=?';
    conn.query(sql, [email], (err, data) => {
        let info = data[0];
        if(err) {
            console.log('중복 확인도중 에러가 발생했습니다.');
            res.status(200).json({ msg: '중복 확인도중 에러가 발생했습니다. 관리자에게 문의해주세요.' });
        } else if(info == undefined || info == null) {
            sm(email, res);
        } else { res.status(200).json({ msg: '이미 등록된 이메일입니다.' }); }
    })
})

.post('/overlap/id/', (req, res) => {
    let uid = req.body.id;
    let sql = 'SELECT * FROM account WHERE userid=?';
    conn.query(sql, [uid], (err, rows, fields) => {
        if(err) {
            console.log(err + "(02)");
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

.post('/overlap/phone/', (req, res) => {
    let uphone = req.body.phone;
    let sql = 'SELECT * FROM account WHERE phone=?';
    conn.query(sql, [uphone], (err, data) => {
        if(err) {
            console.log(err + "(03)");
            res.status(400).json({ msg: '중복 확인도중 에러가 발생했습니다 !' });
        }
        if(data.length < 1) {
            res.status(200).json({
                msg: '중복확인 된것이 없습니다.',
                result: 'success'
            });
        } else {
            res.status(200).json({
                msg: '중복 번호가 존재 합니다.',
                result: 'fail'
            });
        }
    })
})

.post('/fid/', (req, res) => {
    let uemail = req.body.email;
    let sql = 'SELECT * FROM account WHERE email=?';
    conn.query(sql, [uemail], (err, data) => {
        if(err) {
            console.log(err + "(03)");
            res.status(400).json({ msg: '조회도중 에러가 발생했습니다.' });
        } else {
            let user = data[0];
            if(user == undefined || user == null) {
                res.status(200).json({ msg: '가입되어 있지 않은 이메일 입니다.' });
            } else {
                let code = Math.floor(Math.random() * 1000000) + 100000;
                if(code > 100000) {
                    code = code - 100000;
                }
                let transporter = nodemailer.createTransport({
                    service: 'Naver',
                    host: 'smtp.naver.com',
                    port: 587,
                    auth: {
                        user: 'sansogknnamu52@naver.com',
                        pass: 'nagong-52'
                    }
                });
                let mailOptions = {
                    from: 'sansogknnamu52@naver.com',
                    to: uemail,
                    subject: '통합 택배 조회 서비스 이메일 계정 본인확인',
                    text: `(아이디 찾기) 인증번호 : ${code}`
                }

                transporter.sendMail(mailOptions, (err, info) => {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log(`send Mail : ${info.response}`);
                        res.status(200).json({
                            result: 'success',
                            code: code,
                            uid : user.userid
                        });
                    }
                })
            }
        }
    })
})

.post('/fpass/', (req, res) => {
    let code = Math.floor(Math.random() * 1000000) + 100000;
    if(code > 100000) {
        code = code - 100000;
    }
    let uid = req.body.uid;
    let uemail = req.body.email;
    console.log(uid, uemail);
    let sq = 'SELECT * FROM account WHERE userid=? AND email=?'
    conn.query(sq, [uid, uemail], (err, data) => {
        if(err) {
            console.log(err + "(04)");
            res.status(400).json({ msg: '조회도중 에러가 발생했습니다.' });
        } else {
            let user = data[0];
            if(!user) {
                res.status(200).json({ msg: '가입되어 있지 않은 아이디 또는 이메일 입니다.' });
            } else {
                let transporter = nodemailer.createTransport({
                    service: 'Naver',
                    host: 'smtp.naver.com',
                    port: 587,
                    auth: {
                        user: 'sansogknnamu52@naver.com',
                        pass: 'nagong-52'
                    }
                });
                let mailOptions = {
                    from: 'sansogknnamu52@naver.com',
                    to: uemail,
                    subject: '통합 택배 조회 서비스 이메일 계정 본인확인',
                    text: `(비밀번호 찾기) 인증번호 : ${code}`
                }

                transporter.sendMail(mailOptions, (err, info) => {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log(`send Mail : ${info.response}`);
                        res.status(200).json({
                            result: 'success',
                            code: code,
                            upass : user.userpass
                        })
                    }
                })
            }
        }
    });
})

.post('/numcheck/', (req, res) => {
    if(req.body.result == 'true') {
        let sql = 'SELECT * FROM account WHERE userid=? and email=?';
        conn.query(sql, [req.body.uid, req.body.email], (err, data) => {
            if(err) { res.status(400).json({ msg: '데이터를 확인하는 도중에서 에러가 발생했습니다.' }); }
            let user = data[0];
            if(user) {
                let sq = 'UPDATE account SET newpass=? WHERE userid=? and email=?';
                conn.query(sq, ['true', req.body.uid, req.body.email], (err, rows, fields) => {
                    if(err) { res.status(400).json({ msg: '데이터를 저장과정에서 에러가 발생했습니다.' }); }
                    res.status(200).json({ msg: 'success' });
                });
            } else { res.status(200).json({ msg: '가입되어 있지 않은 아이디 또는 이메일 입니다.' }); }
        });
    }
})

.post('/newpass/', (req, res) => {
    let sql = 'SELECT * FROM account WHERE userid=? and email=?';
    conn.query(sql, [req.body.uid, req.body.email], (err, data) => {
        if(err) { res.status(400).json({ msg: '데이터를 읽는 과정에서 에러가 발생했습니다.' }); }
        let user = data[0];
        if(user.newpass == 'true') {
            let sq = 'UPDATE account SET userpass=?, newpass=? WHERE userid=? and email=?';
            conn.query(sq, [req.body.newpass, 'false', req.body.uid, req.body.email], (err, rows, fields) => {
                if(err) { res.status(400).json({ msg: '데이터를 저장과정에서 에러가 발생했습니다.' }); }
                res.status(200).json({ msg: '새로운 비밀번호를 저장했습니다. 로그인화면으로 갈까요?' });
            })
        } else { res.status(400).json({ msg: '인증번호를 입력해 주세요!!' }); }
    })
})

.post('/set/', (req, res) => {
    let token = req.cookies.user;
    if(!token) {
        res.json(err);
    } else {
        jwt.verify(token, config.secret, (err, decoded) => {
            let sql = 'SELECT * FROM account WHERE userid=? and id=?';
            conn.query(sql, [decoded.uid, decoded.unum], (err, data) => {
                if(err) { res.status(400).json({ msg: '조회 과정에서 에러가 발생했습니다.' }); }
                let user = data[0];
                res.status(200).json({
                    userpass: user.userpass,
                    userphone: user.phone,
                    useremail: user.email
                });
            })
        })
    }
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
            return res.json(err)
        }
        return res.sendFile('comeback.html', { root: path.join(__dirname, '../public/html') });
    });
}