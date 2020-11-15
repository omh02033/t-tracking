const express = require('express');
const router = express.Router();
const axios = require('axios');
const mysql = require('mysql');
const path = require('path');
const jwt = require('jsonwebtoken');
const config = require('../config/jwt');

let conn = mysql.createConnection({
    host : process.env.DATABASE_HOST,
    user : process.env.DATABASE_USER,
    password : process.env.DATABASE_PASSWORD,
    database: 'delivery'
});
conn.connect();

let apis = ['RNGV4kBcpllubpkgwcRVTQ', 'ggs0bikJEzRyghtBVRf0sA'];
//ggs0bikJEzRyghtBVRf0sA
//RNGV4kBcpllubpkgwcRVTQ
let apiIndex = 0;

let gcode = ['99', '37', '29',     // 국제 택배
            '38', '42', '57',
            '13', '33', '12',
            '21', '41', '28',
            '34', '25', '55',
            '14', '26'];

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
.post('/', async (req, res) => {
    let promises = [];
    let proIndex = 0;
    if(!req.body.select) {
        if(req.body.num == '123456050203') {    // 샘플 코드
            tssample(req, res, '무료');
        } else {
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
                    );
                }
            });
            try {
                let data = await Promise.all(promises);
                ts(req, res, data, '무료');
            } catch(err){
                console.log('catch', err);
            }
        }
    } else if(req.body.select) {
        if(req.body.select == 'domestic') {
            if(req.body.num == '123456050203') {    // 샘플 코드
                tssample(req, res, '유료');
            } else {
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
                try {
                    if(req.body.num == '123456050203') {
                        tssample(req, res, '유료');
                    } else {
                        let data = await Promise.all(promises);
                        ts(req, res, data, '유료');
                    }
                } catch(err){
                    res.status(400).json({ msg: '유효하지 않은 운송장 번호 혹은 택배사 코드를 입력하셨습니다. 다시 시도해주세요.' });
                    console.log('catch', err);
                }
            }
        } else if(req.body.select == 'international') {
            if(req.body.num == '123456050203') {    // 샘플 코드
                tssample(req, res, '유료');
            } else {
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
                try {
                    if(req.body.num == '123456050203') {
                        tssample(req, res, '유료');
                    } else {
                        let data = await Promise.all(promises);
                        ts(req, res, data, '유료')
                    }
                } catch(err){
                    console.log('catch', err);
                }
            }
        }
    }
})

.get('/detail', (req, res) => {
    res.sendFile('track/detail.html', { root: path.join(__dirname, '../public/html') });
})

.post('/detail', async (req, res) => {
    if(req.body.t_code == '123456050203' && req.body.t_invoice == '333') {
        return res.status(200).json({
            data: {
                invoiceNo: '333',
                receiverName: '디미고',
                senderName: '오명훈',
                receiverAddr: '안산시',
                itemName: '델리 트래킹',
                trackingDetails: [
                    {
                        timeString: '2020-11-14 09:52:11',
                        where: '경기평택청북',
                        kind: '집화처리',
                        manName: '상훈쌤',
                        telno2: '01040389960'
                    },
                    {
                        timeString: '2020-11-15 10:15:51',
                        where: '경기평택청북',
                        kind: '행남포장',
                        manName: '상훈쌤',
                        telno2: '01040389960'
                    },
                    {
                        timeString: '2020-11-15 16:09:13',
                        where: '경기평택청북',
                        kind: '가선상차',
                        manName: '상훈쌤',
                        telno2: '01040389960'
                    },
                    {
                        timeString: '2020-11-15 19:15:05',
                        where: '평택B',
                        kind: '가선하차',
                        manName: '상훈쌤',
                        telno2: '01040389960'
                    },
                    {
                        timeString: '2020-11-15 20:01:43',
                        where: '평택B',
                        kind: '가선상차',
                        manName: '상훈쌤',
                        telno2: '01040389960'
                    },
                    {
                        timeString: '2020-11-15 23:48:05',
                        where: '안산시',
                        kind: '가선하차',
                        manName: '상훈쌤',
                        telno2: '01040389960'
                    },
                    {
                        timeString: '2020-11-16 16:09:13',
                        where: '안산시',
                        kind: '배달출발 (배달예정시간:17~19시)',
                        manName: '상훈쌤',
                        telno2: '01040389960'
                    },
                    {
                        timeString: '2020-11-16 10:59:12',
                        where: '안산시 단원구',
                        kind: '배달완료',
                        manName: '상훈쌤',
                        telno2: '01040389960'
                    }
                ],
                recipient: '',
                estimate: '17~19시'
            }
        });
    } else {
        function checking(response) {
            if(response.data.result == 'Y') {
                res.status(200).json({ data: response.data });
            } else {
                console.log('fail');
                res.status(400).json({ msg: '조회를 하지 못하였습니다.' });
            }
        }
        const data = await axios.get('http://info.sweettracker.co.kr/api/v1/trackingInfo', {
            params: {
                t_key: apis[apiIndex],
                t_code: req.body.t_code,
                t_invoice: req.body.t_invoice
            }
        });
        checking(data);
    }
})
.post('/recordcheck', (req, res) => {
    if(req.body.apploval == true) {
        let token = req.cookies.user;
        jwt.verify(token, config.secret, (err, decoded) => {
            if(err) { res.status(400).json({ msg: '쿠키를 조회하는 과정에서 에러가 발생했습니다.' }); }
            let sql = 'SELECT * FROM delirecord WHERE id=? ORDER BY `date` DESC, `pdate` DESC LIMIT 1000';
            conn.query(sql, [decoded.unum], (err, data) => {
                if(err) { res.status(400).json({ msg: '데이터를 조회 과정에서 에러가 발생했습니다.' }); }
                if(data.length <= 0) { res.status(200).json({ result: 'fail' }); }
                else {
                    res.status(200).json({
                        result: 'success',
                        data: data
                    });
                }
            });
        });
    }
})
.post('/recordcheck/del/', (req, res) => {
    let sql = 'DELETE FROM delirecord WHERE id=? and denum=?';
    conn.query(sql, [req.body.id, req.body.denum], (err, data) => {
        if(err) { return res.status(400).json({ msg: '삭제하는 과정에서 에러가 발생했습니다.' }); }
        res.status(200).json({ result: 'success' });
    })
})

.post('/retrack', async (req, res) => {
    function rts(response) {
        if(response.data.result == 'Y') {
            let today = new Date();

            let year = String(today.getFullYear());
            let month = String(today.getMonth() + 1);
            let date = String(today.getDate());

            let sodate = month;
            let pdate = year + '년 ' + month + '월 ' + date + '일';
            let token = req.cookies.user;

            jwt.verify(token, config.secret, (err, decoded) => {
                if(err) { return res.json(err); }
                let sql = 'UPDATE delirecord SET denum = ?, tcode = ?, toolname = ?, result = ?, phonenum = ?, manname = ?, receiverName = ?, `where` = ?, `date` = ?, pdate = ? WHERE id = ?';
                conn.query(sql, [req.body.denum, req.body.tcode, response.data.itemName, response.data.level, response.data.trackingDetails[response.data.trackingDetails.length - 1].telno2, response.data.trackingDetails[response.data.trackingDetails.length - 1].manName, response.data.receiverName, response.data.trackingDetails[response.data.trackingDetails.length - 1].where, sodate, pdate, decoded.unum], (err, rows, field) => {
                    if(err) {
                        console.log(err);
                        res.status(400).json({msg: '저장하는 중에 에러가 발생하였습니다.'});
                    } else {
                        res.status(200).json({ data: response.data, result: 'success', code: req.body.denum, t_code: req.body.tcode });
                    }
                })
            })
        } else {
            console.log('fail');
            res.status(400).json({ msg: '조회를 하지 못하였습니다.', result: 'fail' });
        }
    }
    const data = await axios.get('http://info.sweettracker.co.kr/api/v1/trackingInfo', {
        params: {
            t_key: apis[apiIndex],
            t_code: req.body.tcode,
            t_invoice: req.body.denum
        }
    });

    rts(data);
})

.post('/lookupcheck', (req, res) => {
    if(req.body.app == 'apploval') {
        let dt = [];
        let sql = 'SELECT * FROM `delivery`.`top` ORDER BY `lookup` DESC LIMIT 1000';
        conn.query(sql, (err, data) => {
            if(err) { res.status(400).json({ msg: '에러가 발생했습니다(06)' }); }
            for(let i=0; i<10; i++) {
                dt.push({
                    "name": data[i].name,
                    "lookup": data[i].lookup
                });
            }
            let redt = dt.reverse();
            res.status(200).json({ result: 'success', data: redt });
        })
    }
})

module.exports = router;

function tssample(req, res, type) {    // 샘플
    let today = new Date();
    
    let year = String(today.getFullYear());
    let month = String(today.getMonth() + 1);
    let date = String(today.getDate());

    let sodate = month;
    let pdate = year + '년 ' + month + '월 ' + date + '일 ';
    let token = req.cookies.user;
    if(!token) {
        return res.status(200).json({
            code: '333',
            uname: '디미고',
            itemName: '델리 트래킹',
            where: '안산시',
            level: 4,
            t_code: '123456050203'
        });
    } else {
        jwt.verify(token, config.secret, (err, decoded) => {
            if(err) return res.json(err);
            let sql = 'SELECT * FROM delirecord WHERE id=? and denum=?';
            conn.query(sql, [decoded.unum, '123456050203'], (err, data) => {
                if(err) return res.status(400).json({ msg: '중복 조회 과정에서 에러가 발생했습니다.' });
                let dat = data[0];
                if(dat) {
                    return res.status(200).json({
                        code: '333',
                        uname: '디미고',
                        itemName: '델리 트래킹',
                        where: '안산시',
                        level: 4,
                        t_code: '123456050203'
                    });
                } else {
                    if(type === '유료' || type === '무료' && !req.body.sec){
                        let sq = 'INSERT INTO delirecord (id, denum, tcode, toolname, result, phonenum, manname, receiverName, `where`, `date`, pdate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                        conn.query(sq, [decoded.unum, '123456050203', '333', '델리 트래킹', 4, '01040389960', '오명훈', '디미고', '안산시', sodate, pdate], (err, rows, field) => {
                            if(err) {
                                console.log(err);
                                return res.status(400).json({msg: '저장하는 중에 에러가 발생하였습니다.'});
                            } else {
                                return res.status(200).json({
                                    code: '333',
                                    uname: '디미고',
                                    itemName: '델리 트래킹',
                                    where: '안산시',
                                    level: 4,
                                    t_code: '123456050203'
                                });
                            }
                        })
                    } else {
                        return res.status(200).json({
                            code: '333',
                            uname: '디미고',
                            itemName: '델리 트래킹',
                            where: '안산시',
                            level: 4,
                            t_code: '123456050203'
                        });
                    }
                }
            });
        });
    }
}

function ts(req, res, response, type) {
    for(let i=0; i<response.length; i++) {
        if(response[i].data.result == 'Y') {
            let today = new Date();   

            let year = String(today.getFullYear());
            let month = String(today.getMonth() + 1);
            let date = String(today.getDate());

            let sodate = month;
            let pdate = year + '년 ' + month + '월 ' + date + '일';
            let token = req.cookies.user;
            if(!token) {
                return res.status(200).json({
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
                    let sql = 'SELECT * FROM delirecord WHERE id=? and denum=?';
                    conn.query(sql, [decoded.unum, req.body.num], (err, data) => {
                        if(err) { return res.status(400).json({ msg: '중복 조회 과정에서 에러가 발생했습니다.' }); }
                        let dat = data[0];
                        if(dat) {
                            return res.status(200).json({
                                code: response[i].data.invoiceNo,
                                uname: response[i].data.receiverName,
                                itemName: response[i].data.itemName,
                                where: response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].where,
                                level: response[i].data.level,
                                t_code: code[i]
                            });
                        } else {
                            if(type === '유료' || type === '무료' && !req.body.sec){
                                let sq = 'INSERT INTO delirecord (id, denum, tcode, toolname, result, phonenum, manname, receiverName, `where`, `date`, pdate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                                conn.query(sq, [decoded.unum, req.body.num, code[i], response[i].data.itemName, response[i].data.level, response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].telno2, response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].manName, response[i].data.receiverName, response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].where, sodate, pdate], (err, rows, field) => {
                                    if(err) {
                                        console.log(err);
                                        return res.status(400).json({msg: '저장하는 중에 에러가 발생하였습니다.'});
                                    } else {
                                        return res.status(200).json({
                                            code: response[i].data.invoiceNo,
                                            uname: response[i].data.receiverName,
                                            itemName: response[i].data.itemName,
                                            where: response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].where,
                                            level: response[i].data.level,
                                            t_code: code[i]
                                        });
                                    }
                                })
                            } else {
                                return res.status(200).json({
                                    code: response[i].data.invoiceNo,
                                    uname: response[i].data.receiverName,
                                    itemName: response[i].data.itemName,
                                    where: response[i].data.trackingDetails[response[i].data.trackingDetails.length - 1].where,
                                    level: response[i].data.level,
                                    t_code: code[i]
                                });
                            }
                        }
                    })
                });
            }
            
            let sql = 'SELECT * FROM top WHERE code=?';
            conn.query(sql, [code[i]], (err, data) => {
                let lookup = data[0]
                if(err) {
                    return res.status(400).json({ msg: `조회 추가과정에서 에러가 발생했습니다 : ${code[i]}` });
                } else {
                    let look = lookup.lookup + 1;
                    let sq = 'UPDATE top SET lookup=? WHERE code=?';
                    conn.query(sq, [look, code[i]], (err, result, fields) => {
                        if(err) {
                            console.log(err);
                        } else {
                            console.log('success');
                        }
                    })
                }
            });
            
            return;
        } else if(i+1 == response.length) {
            return res.status(200).json({ msg: '유효하지 않은 운송장 번호 혹은 택배사 코드를 입력하셨습니다.' });
        }
    }
}