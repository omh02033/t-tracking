const express = require('express');
const router = express.Router();
const path = require('path');
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const config = require('../config/jwt');
const fs = require('fs');
const BootpayRest = require('bootpay-rest-client');
const moment = require('moment');

let conn = mysql.createConnection({
    host : process.env.DATABASE_HOST,
    user : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASSWORD,
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

.post('/signup/overlap/id/', (req, res) => {
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

.post('/signup/overlap/phone/', (req, res) => {
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
                });
            }
        }
    });
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
                        });
                    }
                });
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
                res.status(200).json({ msg: '새로운 비밀번호를 저장했습니다. 로그인화면으로 갈까요?', result: 'success' });
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
                    userid: decoded.uid,
                    userpass: user.userpass,
                    userphone: user.phone,
                    useremail: user.email
                });
            })
        })
    }
})

.post('/delPro/', (req, res) => {
    let token = req.cookies.user;
    if(!token) { res.redirect('/account/login/'); }
    else {
        jwt.verify(token, config.secret, (err, decoded) => {
            if(err) { res.json(err); }
            fs.unlink(path.join(__dirname, '../public/images/userProfile/')+decoded.unum, (err) => {
                res.status(200).json({ result: 'success' });
            });
        });
    }
})

.post('/checkacc/', (req, res) => {
    let token = req.cookies.user;
    if(!token) { res.redirect('/account/login/'); }
    else {
        jwt.verify(token, config.secret, (err, decoded) => {
            if(err) { res.json(err); }
            let sql = "SELECT * FROM account WHERE userid=? AND id=?";
            conn.query(sql, [decoded.uid, decoded.unum], (err, data) => {
                if(err) { res.status(400).json({ msg: 'err' }); }
                let user = data[0];
                if(user) {
                    res.status(200).json({
                        result: 'success',
                        uphone: user.phone,
                        uemail: user.email,
                        uname: decoded.uname
                    });
                } else { res.status(400).json({ msg: 'error' }); }
            });
        });
    }
})

.post('/buycheck/', (req, res) => {
    let token = req.cookies.user;
    if(!token) { res.redirect('/account/login/'); }
    else {
        jwt.verify(token, config.secret, (err, decoded) => {
            if(err) { res.json({ err: err }); }
            BootpayRest.setConfig(
                "5ef815974f74b40021f2b98c",
                "9VV9mQE4zOv+NdtKirEDIDFqAqY9ZZXcpES9UCBRWxE="
            );

            BootpayRest.getAccessToken().then(function (response) {
                if(response.status === 200 && response.data.token !== undefined) {
                    BootpayRest.verify(req.body.data.receipt_id).then(function (_response) {
                        _response = JSON.parse(_response);
                        if(_response.status === 200) {
                            if(_response.data.receipt_id == req.body.data.receipt_id && _response.data.price == req.body.data.price) {
                                let sq = 'INSERT INTO payment (`id`, `toolname`, `pay`, `card_name`, `card_no`, `n`, `receipt_id`, `purchased_at`, `status`, `pg`) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                                let sql = 'INSERT INTO subsc (`id`, `userid`, `username`, `kinds`, `toolname`, `price`, `purchased`, `end_at`, `recent_pay`) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)';

                                let cn = _response.data.payment_data.card_no;
                                let cn1 = cn.substring(0, 4);
                                let cn2 = cn.substring(4, 8);
                                let cn3 = cn.substring(8, 12);
                                let cn4 = cn.substring(12, cn.length);

                                if(cn1 == '0000') { cn1 = "****"; }
                                if(cn2 == '0000') { cn2 = "****"; }
                                if(cn3 == '0000') { cn3 = "****"; }
                                if(cn4 == '0000') { cn4 = "****"; }

                                let card_number = cn1 + "-" + cn2 + "-" + cn3 + "-" + cn4;

                                let date = moment();
                                let now = date.format("YYYYMMDD");

                                date.add(30, "d");
                                let end = date.format("YYYYMMDD");

                                if(_response.data.name == "국제 택배 조회" && _response.data.price == 1200) {
                                    conn.query(sq, [decoded.unum, 'pay1', _response.data.price, _response.data.payment_data.card_name, card_number, _response.data.payment_data.n, _response.data.receipt_id, _response.data.purchased_at, _response.data.status_en, _response.data.pg_name], (err, rows, fields) => { if(err) throw err; });
                                    conn.query(sql, [decoded.unum, decoded.uid, decoded.uname, _response.data.name, 'pay1', _response.data.price, now, end, now], (err, rows, fields) => {
                                        if(err) { return res.status(400).json({ buySu: false }); }
                                        res.status(200).json({ buySu: true });
                                    });
                                } else if(_response.data.name == "카카오톡 봇 이용" && _response.data.price == 1500) {
                                    conn.query(sq, [decoded.unum, 'pay2', _response.data.price, _response.data.payment_data.card_name, card_number, _response.data.payment_data.n, _response.data.receipt_id, _response.data.purchased_at, _response.data.status_en, _response.data.pg_name], (err, rows, fields) => { if(err) throw err; });
                                    conn.query(sql, [decoded.unum, decoded.uid, decoded.uname, _response.data.name, 'pay2', _response.data.price, now, end, now], (err, rows, fields) => {
                                        if(err) { return res.status(400).json({ buySu: false }); }
                                        res.status(200).json({ buySu: true });
                                    });
                                } else if(_response.data.name == "둘다 마음껏" && _response.data.price == 2500) {
                                    conn.query(sq, [decoded.unum, 'pay3', _response.data.price, _response.data.payment_data.card_name, card_number, _response.data.payment_data.n, _response.data.receipt_id, _response.data.purchased_at, _response.data.status_en, _response.data.pg_name], (err, rows, fields) => { if(err) throw err; });
                                    conn.query(sql, [decoded.unum, decoded.uid, decoded.uname, _response.data.name, 'pay3', _response.data.price, now, end, now], (err, rows, fields) => {
                                        if(err) { return res.status(400).json({ buySu: false }); }
                                        res.status(200).json({ buySu: true });
                                    });
                                }
                            } else { res.status(400).json({ buySu: false, msg: '변조가 감지되었습니다.' }); }
                        }
                    });
                }
            });
        });
    }
})

.post('/refund/cardcheck/', (req, res) => {
    let token = req.cookies.user;
    if(!token) { res.redirect('/account/login/'); }
    else {
        jwt.verify(token, config.secret, (err, decoded) => {
            if(err) { return res.status(400).json({ msg: '에러가 발생했습니다..' }); }
            let sql = 'SELECT * FROM payment WHERE id=? AND toolname=?';
            conn.query(sql, [decoded.unum, req.body.toolname], (err, data) => {
                if(err) { return res.status(400).json({msg: '확인도중 에러가 발생했습니다..'}); }
                if(data.length == 0){
                    res.status(400).json({msg: '존재하지 않은 데이터입니다.'});
                } else{
                    let info = data[0];
                    res.status(200).json({ cardno: info.card_no });
                }
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
            conn.query(sql, [decoded.unum, req.body.toolname], (err, data) => {
                if(err) { return res.status(400).json({ msg: '확인도중 에러가 발생했습니다..' }); }
                let info = data[0];
                BootpayRest.setConfig(
                    "5ef815974f74b40021f2b98c",
                    "9VV9mQE4zOv+NdtKirEDIDFqAqY9ZZXcpES9UCBRWxE="
                );
                
                BootpayRest.getAccessToken().then(function (token) {
                    if (token.status === 200) {
                        // req.body.refund_pay
                        BootpayRest.cancel(info.receipt_id, 1200, req.body.username, '고객의 환불 요청').then(function (response) {
                            if (response.status === 200) {
                                let sql = 'DELETE FROM payment WHERE id=? AND toolname=?';
                                conn.query(sql, [decoded.unum, req.body.toolname], (err, data) => {
                                    if(err) { return res.status(400).json({ msg: '삭제하는 과정에서 에러가 발생했습니다.' }); }
                                });
                                let sq = 'DELETE FROM subsc WHERE id=? AND toolname=? AND userid=?';
                                conn.query(sq, [decoded.unum, req.body.toolname, req.body.userid], (err, data) => {
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

.post('/finishcheck/', (req, res) => {
    let token = req.cookies.user;
    if(!token) { res.redirect('/account/login/'); }
    else {
        jwt.verify(token, config.secret, (err, decoded) => {
            if(err) { return res.status(400).json({ msg: '에러가 발생했습니다..' }); }
            let sql = 'SELECT * FROM subsc WHERE id=? AND toolname=?';
            if(req.body.kind == 'pay1' || req.body.kind == 'pay2') {
                conn.query(sql, [decoded.unum, req.body.kind], (err, data) => {
                    if(err) { return res.status(400).json({ msg: '데이터 확인하는 도중 에러가 발생했습니다..' }); }
                    if(data.length == 0) {
                        conn.query(sql, [decoded.unum, 'pay3'], (err, data1) => {
                            if(err) { return res.status(400).json({ msg: '데이터 확인하는 도중 에러가 발생했습니다..' }); }
                            if(data1.length == 0) { res.status(400).json({ msg: '존재하지 않은 데이터 입니다..' }); }
                            else { res.status(200).json({ value: data1[0].end_at }); }
                        });
                    } else {
                        let info = data[0];
                        res.status(200).json({ value: info.end_at });
                    }
                });
            } else if(req.body.kind == 'pay3') {
                conn.query(sql, [decoded.unum, req.body.kind], (err, data) => {
                    if(err) { return res.status(400).json({ msg: '데이터 확인하는 도중 에러가 발생했습니다..' }); }
                    if(data.length == 0) {
                        conn.query(sql, [decoded.unum, 'pay1'], (err, data1) => {
                            if(err) { return res.status(400).json({ msg: '데이터 확인하는 도중 에러가 발생했습니다..' }); }
                            if(data1.length == 0) { res.status(400).json({ msg: '뭔가 이상한 값입니다..' }); }
                            else {
                                let pay1ec = data1[0].end_at;
                                conn.query(sql, [decoded.unum, 'pay2'], (err, data2) => {
                                    if(err) { return res.status(400).json({ msg: '데이터 확인하는 도중 에러가 발생했습니다..' }); }
                                    if(data2.length == 0) { res.status(400).json({ msg: '데이터 확인하는 도중 에러가 발생했습니다..' }); }
                                    else {
                                        let pay2ec = data2[0].end_at;
                                        res.status(200).json({ pay1ec, pay2ec });
                                    }
                                })
                            }
                        });
                    } else {
                        let info = data[0];
                        res.status(200).json({ value: info.end_at });
                    }
                });
            }
        });
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
        if(err) { return res.json(err); }
        return res.sendFile('comeback.html', { root: path.join(__dirname, '../public/html') });
    });
}