const express = require('express');
const router = express.Router();
const axios = require('axios');
const mysql = require('mysql');
const path = require('path');

let conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'delivery'
});
conn.connect();

let code = ['18', '23', '54',     // 국내 택배
            '40', '53', '22',
            '06', '08', '52',
            '43', '01', '11',
            '17', '20', '16',
            '05', '32', '45',
            '04', '46', '24',
            '56', '30', '44',
            '64', '58',
            '99', '37', '29',     // 국제 택배
            '38', '42', '57',
            '13', '33', '12',
            '21', '41', '28',
            '34', '25', '55',
            '14', '26'];

router
.post('/', (req, res) => {
    console.log(code.length);
    for(let i=0; i<code.length; i++) {
        axios.get('http://info.sweettracker.co.kr/api/v1/trackingInfo', {
            params: {
                t_key: '5yH0MNx3JNyytFrtB1D2gg',
                t_code: code[i],
                t_invoice: req.body.num
            }
        }).then(function (response) {
            console.log(`${i} : ${code[i]}`);
            if(!response.data.senderName == '' || !response.data.senderName == '*') {
                console.log('Success');
                console.log(response.data);

                res.status(200).json({
                    msg: 'success',
                    code: response.data.invoiceNo,
                    uname: response.data.receiverName,
                    itemName: response.data.itemName,
                    where: response.data.trackingDetails[response.data.trackingDetails.length - 1].where,
                    level: response.data.level,
                    t_code: code[i]
                });
                /*
                let sql = 'SELECT lookup FROM top WHERE code=?';
                console.log(code[i]);
                conn.query(sql, [code[i]], (err, data) => {
                    console.log("data" + data);
                    if(err) {
                        res.status(400).json({ msg: `조회 추가과정에서 에러가 발생했습니다 : ${code[i]}` });
                    } else {
                        let look = data + 1;
                        let sq = 'UPDATE top SET lookup=? WHERE code=?';
                        console.log(look, code[i]);
                        conn.query(sq, [look, code[i]], (err, result, fields) => {
                            if(err) {
                                res.status(400).json({ msg: '조회 변경 과정에서 에러가 발생했습니다.' });
                            } else {
                                res.status(200).json({ msg: '.`success`.' });
                            }
                        })
                    }
                });
                */
                return;
            }
        }).catch(err => {
            console.log('catch');
        })
    }
})


.get('/detail', (req,res) => {
    res.sendFile('track/detail.html', { root: path.join(__dirname, '../public/html') });
})

.post('/detail', (req, res) => {
    axios.get('http://info.sweettracker.co.kr/api/v1/trackingInfo', {
        params: {
            t_key: '5yH0MNx3JNyytFrtB1D2gg',
            t_code: req.body.t_code,
            t_invoice: req.body.t_invoice
        }
    }).then(function (response) {
        console.log(req.body.t_code);
        console.log(req.body.t_invoice);
        if(!response.data.senderName == '') {
            res.status(200).json({
                code: response.data.invoiceNo,
                uname: response.data.receiverName,
                sender: response.data.senderName,
                itemName: response.data.itemName,
                detail: response.data.trackingDetails,
                home: response.data.receiverAddr
            });
        } else {
            console.log('fail');
            res.status(400).json({ msg: '조회를 하지 못하였습니다.' });
        }
    })
})

module.exports = router;