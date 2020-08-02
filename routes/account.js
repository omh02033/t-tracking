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


function SHA256(s){
    var chrsz   = 8;
    var hexcase = 0;
  
    function safe_add (x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }
  
    function S (X, n) { return ( X >>> n ) | (X << (32 - n)); }
    function R (X, n) { return ( X >>> n ); }
    function Ch(x, y, z) { return ((x & y) ^ ((~x) & z)); }
    function Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)); }
    function Sigma0256(x) { return (S(x, 2) ^ S(x, 13) ^ S(x, 22)); }
    function Sigma1256(x) { return (S(x, 6) ^ S(x, 11) ^ S(x, 25)); }
    function Gamma0256(x) { return (S(x, 7) ^ S(x, 18) ^ R(x, 3)); }
    function Gamma1256(x) { return (S(x, 17) ^ S(x, 19) ^ R(x, 10)); }
  
    function core_sha256 (m, l) {
         
        var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1,
            0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
            0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786,
            0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
            0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147,
            0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
            0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B,
            0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
            0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A,
            0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
            0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);

        var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);

        var W = new Array(64);
        var a, b, c, d, e, f, g, h, i, j;
        var T1, T2;
  
        m[l >> 5] |= 0x80 << (24 - l % 32);
        m[((l + 64 >> 9) << 4) + 15] = l;
  
        for ( var i = 0; i<m.length; i+=16 ) {
            a = HASH[0];
            b = HASH[1];
            c = HASH[2];
            d = HASH[3];
            e = HASH[4];
            f = HASH[5];
            g = HASH[6];
            h = HASH[7];
  
            for ( var j = 0; j<64; j++) {
                if (j < 16) W[j] = m[j + i];
                else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
  
                T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
                T2 = safe_add(Sigma0256(a), Maj(a, b, c));
  
                h = g;
                g = f;
                f = e;
                e = safe_add(d, T1);
                d = c;
                c = b;
                b = a;
                a = safe_add(T1, T2);
            }
            HASH[0] = safe_add(a, HASH[0]);
            HASH[1] = safe_add(b, HASH[1]);
            HASH[2] = safe_add(c, HASH[2]);
            HASH[3] = safe_add(d, HASH[3]);
            HASH[4] = safe_add(e, HASH[4]);
            HASH[5] = safe_add(f, HASH[5]);
            HASH[6] = safe_add(g, HASH[6]);
            HASH[7] = safe_add(h, HASH[7]);
        }
        return HASH;
    }
  
    function str2binb (str) {
        var bin = Array();
        var mask = (1 << chrsz) - 1;
        for(var i = 0; i < str.length * chrsz; i += chrsz) {
            bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i%32);
        }
        return bin;
    }
  
    function Utf8Encode(string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    }
  
    function binb2hex (binarray) {
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for(var i = 0; i < binarray.length * 4; i++) {
            str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
            hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
        }
        return str;
    }
  
    s = Utf8Encode(s);
    return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
}

function sm(email, res, uid, code) {
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
        html: `<div style="width: 100%; height: fit-content; background: linear-gradient(#ff951c, #ea7d00); background-color: #d67200; box-shadow: 0 1px 1px #ffb45e; color: #fff; font-weight: bold; min-width: 194px; margin: 0 !important;">` + 
        `<h1>통합 택배 조회 서비스</h1>` +
        `<h2 style="text-align: center; font-weight: bold;">회원가입</h2>` +
        `<h3 style="text-align: center;">이메일 인증</h3>` +
        `<div>` +
        `버튼을 눌러, 이메일 인증해주세요! --> <a href="https://www.delitracking.com/account/signup/email/certification/${SHA256(uid)}/${code}" style="text-align: center;">이메일 인증하기</a> <---</div></div>`
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
.get('/', check, (req, res) => { res.sendFile('account/index.html', { root: path.join(__dirname, '../public/html') }); })
.get('/login/', check, (req, res) => { res.sendFile('account/login.html', { root: path.join(__dirname, '../public/html') }); })
.get('/signup/', check, (req, res) => { res.sendFile('account/signup.html', { root: path.join(__dirname, '../public/html') }); })
.get('/forget/', check, (req, res) => { res.sendFile('account/forget.html', { root: path.join(__dirname, '../public/html') }); })
.get('/forget/id/', check, (req, res) => { res.sendFile('account/fid.html', { root: path.join(__dirname, '../public/html') }); })
.get('/forget/password/', check, (req, res) => { res.sendFile('account/fpass.html', { root: path.join(__dirname, '../public/html') }); })

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
            if(user.userpass == SHA256(upass + user.password_salt)) {
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
    let hashid = req.body.hashid;
    let sql = 'SELECT * FROM Signing WHERE userid=?';
    conn.query(sql, [hashid], (err, data) => {
        if(err) { return res.status(400).json({ result: "fail" }); }
        if(data.length > 0) {
            let user = data[0];
            if(user.result == "Y") {
                let sql1 = 'INSERT INTO account (userid, userpass, password_salt, phone, email, name, seller) VALUES(?, ?, ?, ?, ?, ?, ?)';
                conn.query(sql1, [user.originalid, , user.userpass, user.password_salt, user.email, req.body.nick, user.seller], (err, rows, fields) => {
                    if(err) {
                        console.log(err + "(01)");
                        res.status(400).json({
                            msg: '저장하는데 에러가 발생했습니다.',
                            result: 'fail'
                        });
                    } else {
                        let desql = 'DELETE FROM Signing WHERE userid=? AND code=?';
                        conn.query(desql, [hashid, user.code], (err, data) => { if(err) { console.log(err); } });
                        console.log('signup : success');
                        res.status(200).json({
                            msg: '유저 등록이 성공적으로 이루어졌습니다.',
                            result: 'success'
                        });
                    }
                });
            } else { return res.status(400).json({ result: "emailfail" }); }
        } else { return res.status(400).json({ result: "fail" }); }
    });
})
.post('/signup/overlap/email/', (req, res) => {
    let email = req.body.uemail;
    let sql = 'SELECT * FROM account WHERE email=?';
    conn.query(sql, [email], (err, data) => {
        let info = data[0];
        if(err) {
            console.log('중복 확인도중 에러가 발생했습니다.');
            res.status(400).json({ errmsg: '중복 확인도중 에러가 발생했습니다. 관리자에게 문의해주세요.' });
        } else if(info == undefined || info == null) {
            let code = Math.floor(Math.random() * 1000000) + 100000;
            if(code > 100000) { code = code - 100000; }

            let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
            let min_length = 7;
            let max_length = 13;
            let string_length = Math.floor(Math.random() * (max_length - min_length +1)) + min_length;
            let randomString = '';
            for(let i=0; i<string_length; i++) {
                let rnum = Math.floor(Math.random() * chars.length);
                randomString += chars.substring(rnum, rnum+1);
            }

            let sql1 = 'INSERT INTO Signing (`originalid`, `userid`, `userpass`, `password_salt`, `phone`, `email`, `seller`, `code`, `result`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
            conn.query(sql1, [req.body.uid, SHA256(req.body.uid), SHA256(req.body.upass + randomString), randomString, req.body.uphone, req.body.uemail, String(req.body.seller), code, 'N'], (err, rows, fields) => {
                if(err) { return res.status(400).json({ errmsg: '저장하는 과정에서 에러가 발생했습니다.\n관리자에게 연락해주세요!' }); }
                sm(email, res, req.body.uid, code);
            });
        } else { res.status(200).json({ msg: '이미 등록된 이메일입니다.' }); }
    });
})
.get('/signup/email/certification/:hashid/:code', check, (req, res) => {
    let sql = 'SELECT * FROM Signing WHERE userid=?';
    conn.query(sql, [req.params.hashid], (err, data) => {
        if(err) { return res.status(400).json({ msg: '데이터를 읽는 과정에서 에러가 발생했습니다.' }); }
        if(data.length > 0) {
            let user = data[0];
            console.log(user.code);
            console.log(req.params.code);
            if(user.code == req.params.code) {
                let sql1 = 'UPDATE Signing SET result=? WHERE userid=? AND code=?';
                conn.query(sql1, ['Y', req.params.hashid, req.params.code], (err, rows, fields) => {
                    if(err) { return res.status(400).json({ msg: '처리하는 과정에서 에러가 발생했습니다.' }); }
                    res.sendFile('account/wName.html', { root: path.join(__dirname, '../public/html') });
                });
            } else {
                let sql1 = 'DELETE FROM Signing WHERE userid=?';
                conn.query(sql1, [req.params.hashid], (err) => { if(err) throw err; });
                res.sendFile('account/ECErr.html', { root: path.join(__dirname, '../public/html') });
            }
        } else {
            res.send("다시 회원가입 해주세요..");
        }
    });
})
.post('/email/Certification', (req, res) => {
    let sql = 'SELECT * FROM Signing WHERE originalid=?';
    conn.query(sql, [req.body.uid], (err, data) => {
        if(err) throw err;
        if(data.length > 0) {
            let user = data[0];
            if(user.result == "Y") { return res.status(200).json({ result: "success" }); }
            else { return res.status(200).json({ result: "fail" }); }
        } else {
            return res.status(200).json({ result: 'deleted' });
        }
    });
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
                        BootpayRest.cancel(info.receipt_id, Number(req.body.refund_pay), req.body.username, '고객의 환불 요청').then(function (response) {
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