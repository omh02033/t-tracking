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

let apis = ['5yH0MNx3JNyytFrtB1D2gg', '33F145I7l05a5y9LkYKLYQ']
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
        console.log(promises);
        if(!promises[proIndex].data.senderName == '' && !promises[proIndex].data.senderName == '*' && !promises[proIndex].data.senderName == undefined && !promises[proIndex].data.senderName == null) {
            return;
        } else {
            proIndex++;
            continue;
        }
    }
    Promise.all(promises)
    .then(function (responses) {
        console.log(promises.length);
        console.log(promises);
        for(let response of responses) {
            console.log(response.data.senderName);
            if(!response.data.senderName == '' && !response.data.senderName == '*' && !response.data.senderName == undefined || !response.data.senderName == null) {
                res.status(200).json({
                    code: response.data.invoiceNo,
                    uname: response.data.receiverName,
                    itemName: response.data.itemName,
                    where: response.data.trackingDetails[response.data.trackingDetails.length - 1].where,
                    level: response.data.level
                });
                
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
            }
        }
    }).catch(err => {
        console.log('catch');
    })
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
        if(!response.data.senderName == '' || !response.data.senderName == '*') {
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