const express = require('express');
const router = express.Router();
const axios = require('axios');
const mysql = require('mysql');
const path = require('path');
const jwt = require('jsonwebtoken');
const config = require('../config/jwt');

let conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'delivery'
});
conn.connect();

let apis = ['5yH0MNx3JNyytFrtB1D2gg', '33F145I7l05a5y9LkYKLYQ']
//5yH0MNx3JNyytFrtB1D2gg
let apiIndex = 0;

let gcode = ['99', '37', '29',     // 국제 택배
            '38', '42', '57',
            '13', '33', '12',
            '21', '41', '28',
            '34', '25', '55',
            '14', '26']

let code = ['18', '23', '54',     // 국내 택배
            '40', '53', '22',
            '06', '08', '52',
            '43', '01', '11',
            '17', '20', '16',
            '05', '32', '45',
            '04', '46', '24',
            '56', '30', '44',
            '64', '58'];

router
.post('/', (req, res) => {
    console.log(code.length);
    let promises = [];
    let proIndex = 0;
    if(!req.body.select) {
        const p = new Promise((resolve, reject) => {
            for(let i=0; i<code.length; i++) {
                promises.push(
                    axios.get('http://info.sweettracker.co.kr/api/v1/trackingInfo', {
                        params: {
                            t_key: apis[apiIndex],
                            t_code: code[i],
                            t_invoice: req.body.num
                        }
                    })
                )
            }
        })
        Promise.all(promises)
        .then(function (response) {
            console.log(promises.length);
            for(let i=0; i<response.length; i++) {
                if(response[i].data.result == 'Y') {
                    let today = new Date();   

                    let year = today.getFullYear();
                    let month = today.getMonth() + 1;
                    let date = today.getDate();

                    let sodate = year + '/' + month + '/' + date;
                    let token = req.cookies.user;
                    if(!token){
                        res.status(200).json({
                            code: response[i].data.invoiceNo,
                            uname: response[i].data.receiverName,
                            itemName: response[i].data.itemName,
                            where: response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].where,
                            level: response[i].data.level,
                            t_code: code[i]
                        });
                    } else {
                        jwt.verify(token, config.secret, (err, decoded) => {
                            if(err) { return res.json(err); }
                            let sql = 'SELECT * FROM delirecord WHERE denum=?';
                            conn.query(sql, [req.body.num], (err, data) => {
                                if(err) { res.status(400).json({ msg: '중복 조회 과정에서 에러가 발생했습니다.' }); }
                                let dat = data[0];
                                if(dat) {
                                    res.status(200).json({
                                        code: response[i].data.invoiceNo,
                                        uname: response[i].data.receiverName,
                                        itemName: response[i].data.itemName,
                                        where: response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].where,
                                        level: response[i].data.level,
                                        t_code: code[i]
                                    });
                                } else {
                                    let sq = 'INSERT INTO delirecord (id, denum, tcode, toolname, result, phonenum, manname, receiverName, `where`, `date`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                                    conn.query(sq, [decoded.unum, req.body.num, code[i], response[i].data.itemName, response[i].data.level, response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].telno2, response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].manName, response[i].data.receiverName, response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].where, sodate], (err, rows, field) => {
                                        if(err) {
                                            console.log(err);
                                            res.status(400).json({msg: '저장하는 중에 에러가 발생하였습니다.'});
                                        } else {
                                            res.status(200).json({
                                                code: response[i].data.invoiceNo,
                                                uname: response[i].data.receiverName,
                                                itemName: response[i].data.itemName,
                                                where: response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].where,
                                                level: response[i].data.level,
                                                t_code: code[i]
                                            });
                                        }
                                    })
                                }
                            })
                        });
                    }
                    
                    // let sql = 'SELECT * FROM top WHERE code=?';
                    // console.log(code[i]);
                    // conn.query(sql, [code[i]], (err, data) => {
                    //     let lookup = data[0]
                    //     console.log("data" + lookup.lookup);
                    //     if(err) {
                    //         res.status(400).json({ msg: `조회 추가과정에서 에러가 발생했습니다 : ${code[i]}` });
                    //     } else {
                    //         let look = lookup.lookup + 1;
                    //         let sq = 'UPDATE top SET lookup=? WHERE code=?';
                    //         console.log(look, code[i]);
                    //         conn.query(sq, [look, code[i]], (err, result, fields) => {
                    //             if(err) {
                    //                 console.log(err);
                    //             } else {
                    //                 console.log('success');
                    //             }
                    //         })
                    //     }
                    // });
                    
                    return;
                } else if(i+1 == response.length) {
                    res.status(200).json({ msg: '유효하지 않은 운송장 번호 혹은 택배사 코드를 입력하셨습니다.' });
                }
            }
        }).catch(err => {
            console.log('catch');
        })
    } else if(req.body.select) {
        if(req.body.select == 'domestic') {
            const p = new Promise((resolve, reject) => {
                for(let i=0; i<code.length; i++) {
                    promises.push(
                        axios.get('http://info.sweettracker.co.kr/api/v1/trackingInfo', {
                            params: {
                                t_key: apis[apiIndex],
                                t_code: code[i],
                                t_invoice: req.body.num
                            }
                        })
                    )
                }
            })
            Promise.all(promises)
            .then(function (response) {
                console.log(promises.length);
                for(let i=0; i<response.length; i++) {
                    if(response[i].data.result == 'Y') {
                        let today = new Date();   

                        let year = today.getFullYear();
                        let month = today.getMonth() + 1;
                        let date = today.getDate();

                        let sodate = year + '/' + month + '/' + date;
                        let token = req.cookies.user;
                        if(!token){
                            res.status(200).json({
                                code: response[i].data.invoiceNo,
                                uname: response[i].data.receiverName,
                                itemName: response[i].data.itemName,
                                where: response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].where,
                                level: response[i].data.level,
                                t_code: code[i]
                            });
                        } else {
                            jwt.verify(token, config.secret, (err, decoded) => {
                                if(err) { return res.json(err); }
                                let sql = 'SELECT * FROM delirecord WHERE denum=?';
                                conn.query(sql, [req.body.num], (err, data) => {
                                    if(err) { res.status(400).json({ msg: '중복 조회 과정에서 에러가 발생했습니다.' }); }
                                    let dat = data[0];
                                    if(dat) {
                                        res.status(200).json({
                                            code: response[i].data.invoiceNo,
                                            uname: response[i].data.receiverName,
                                            itemName: response[i].data.itemName,
                                            where: response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].where,
                                            level: response[i].data.level,
                                            t_code: code[i]
                                        });
                                    } else {
                                        let sq = 'INSERT INTO delirecord (id, denum, tcode, toolname, result, phonenum, manname, receiverName, `where`, `date`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                                        conn.query(sq, [decoded.unum, req.body.num, code[i], response[i].data.itemName, response[i].data.level, response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].telno2, response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].manName, response[i].data.receiverName, response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].where, sodate], (err, rows, field) => {
                                            if(err) {
                                                console.log(err);
                                                res.status(400).json({msg: '저장하는 중에 에러가 발생하였습니다.'});
                                            } else {
                                                res.status(200).json({
                                                    code: response[i].data.invoiceNo,
                                                    uname: response[i].data.receiverName,
                                                    itemName: response[i].data.itemName,
                                                    where: response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].where,
                                                    level: response[i].data.level,
                                                    t_code: code[i]
                                                });
                                            }
                                        })
                                    }
                                })
                            });
                        }
                        
                        // let sql = 'SELECT * FROM top WHERE code=?';
                        // console.log(code[i]);
                        // conn.query(sql, [code[i]], (err, data) => {
                        //     let lookup = data[0]
                        //     console.log("data" + lookup.lookup);
                        //     if(err) {
                        //         res.status(400).json({ msg: `조회 추가과정에서 에러가 발생했습니다 : ${code[i]}` });
                        //     } else {
                        //         let look = lookup.lookup + 1;
                        //         let sq = 'UPDATE top SET lookup=? WHERE code=?';
                        //         console.log(look, code[i]);
                        //         conn.query(sq, [look, code[i]], (err, result, fields) => {
                        //             if(err) {
                        //                 console.log(err);
                        //             } else {
                        //                 console.log('success');
                        //             }
                        //         })
                        //     }
                        // });
                        
                        return;
                    } else if(i+1 == response.length) {
                        res.status(200).json({ msg: '유효하지 않은 운송장 번호 혹은 택배사 코드를 입력하셨습니다.' });
                    }
                }
            }).catch(err => {
                console.log('catch');
            })
        } else if(req.body.select == 'international') {
            const p = new Promise((resolve, reject) => {
                for(let i=0; i<gcode.length; i++) {
                    promises.push(
                        axios.get('http://info.sweettracker.co.kr/api/v1/trackingInfo', {
                            params: {
                                t_key: apis[apiIndex],
                                t_code: gcode[i],
                                t_invoice: req.body.num
                            }
                        })
                    )
                }
            })
            Promise.all(promises)
            .then(function (response) {
                console.log(promises.length);
                for(let i=0; i<response.length; i++) {
                    if(response[i].data.result == 'Y') {
                        let today = new Date();   

                        let year = today.getFullYear();
                        let month = today.getMonth() + 1;
                        let date = today.getDate();

                        let sodate = year + '/' + month + '/' + date;
                        let token = req.cookies.user;
                        if(!token){
                            res.status(200).json({
                                code: response[i].data.invoiceNo,
                                uname: response[i].data.receiverName,
                                itemName: response[i].data.itemName,
                                where: response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].where,
                                level: response[i].data.level,
                                t_code: code[i]
                            });
                        } else {
                            jwt.verify(token, config.secret, (err, decoded) => {
                                if(err) { return res.json(err); }
                                let sql = 'SELECT * FROM delirecord WHERE denum=?';
                                conn.query(sql, [req.body.num], (err, data) => {
                                    if(err) { res.status(400).json({ msg: '중복 조회 과정에서 에러가 발생했습니다.' }); }
                                    let dat = data[0];
                                    if(dat) {
                                        res.status(200).json({
                                            code: response[i].data.invoiceNo,
                                            uname: response[i].data.receiverName,
                                            itemName: response[i].data.itemName,
                                            where: response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].where,
                                            level: response[i].data.level,
                                            t_code: code[i]
                                        });
                                    } else {
                                        let sq = 'INSERT INTO delirecord (id, denum, tcode, toolname, result, phonenum, manname, receiverName, `where`, `date`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                                        conn.query(sq, [decoded.unum, req.body.num, code[i], response[i].data.itemName, response[i].data.level, response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].telno2, response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].manName, response[i].data.receiverName, response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].where, sodate], (err, rows, field) => {
                                            if(err) {
                                                console.log(err);
                                                res.status(400).json({msg: '저장하는 중에 에러가 발생하였습니다.'});
                                            } else {
                                                res.status(200).json({
                                                    code: response[i].data.invoiceNo,
                                                    uname: response[i].data.receiverName,
                                                    itemName: response[i].data.itemName,
                                                    where: response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].where,
                                                    level: response[i].data.level,
                                                    t_code: code[i]
                                                });
                                            }
                                        })
                                    }
                                })
                            });
                        }
                        
                        // let sql = 'SELECT * FROM top WHERE code=?';
                        // console.log(code[i]);
                        // conn.query(sql, [code[i]], (err, data) => {
                        //     let lookup = data[0]
                        //     console.log("data" + lookup.lookup);
                        //     if(err) {
                        //         res.status(400).json({ msg: `조회 추가과정에서 에러가 발생했습니다 : ${code[i]}` });
                        //     } else {
                        //         let look = lookup.lookup + 1;
                        //         let sq = 'UPDATE top SET lookup=? WHERE code=?';
                        //         console.log(look, code[i]);
                        //         conn.query(sq, [look, code[i]], (err, result, fields) => {
                        //             if(err) {
                        //                 console.log(err);
                        //             } else {
                        //                 console.log('success');
                        //             }
                        //         })
                        //     }
                        // });
                        
                        return;
                    } else if(i+1 == response.length) {
                        res.status(200).json({ msg: '유효하지 않은 운송장 번호 혹은 택배사 코드를 입력하셨습니다.' });
                    }
                }
            }).catch(err => {
                console.log('catch');
            })
        }
    }
})

.get('/detail', (req, res) => {
    res.sendFile('track/detail.html', { root: path.join(__dirname, '../public/html') });
})

.post('/detail', (req, res) => {
    axios.get('http://info.sweettracker.co.kr/api/v1/trackingInfo', {
        params: {
            t_key: apis[apiIndex],
            t_code: req.body.t_code,
            t_invoice: req.body.t_invoice
        }
    }).then(function (response) {
        if(!response.data.senderName == '' || !response.data.senderName == '*') {
            res.status(200).json({ data: response.data });
        } else {
            console.log('fail');
            res.status(400).json({ msg: '조회를 하지 못하였습니다.' });
        }
    })
})

module.exports = router;