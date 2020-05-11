const express = require('express');
const router = express.Router();
const axios = require('axios');
const mysql = require('mysql');

let conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'delivery'
});
conn.connect();

let code = ['99', '37', '29',     // 국제 택배
            '38', '42', '57',
            '13', '33', '12',
            '21', '41', '28',
            '34', '25', '55',
            '14', '26',
            '18', '23', '54',     // 국내 택배
            '40', '53', '22',
            '06', '08', '52',
            '43', '01', '11',
            '17', '20', '16',
            '05', '32', '45',
            '04', '46', '24',
            '56', '30', '44',
            '64', '58'];

router.post('/', (req, res) => {
    console.log(code.length);
    for(let i=0; i<code.length; i++) {
        axios.get('http://info.sweettracker.co.kr/api/v1/trackingInfo', {
            params: {
                t_key: '5yH0MNx3JNyytFrtB1D2gg',
                t_code: code[i],
                t_invoice: req.body.num
            }
        }).then(function (response) {
            console.log(response.data.code + " : " + code[i]);
            if(response.data.code == 200) {
                res.status(200).json({ msg: response.data.msg });
                let sql = 'SELECT lookup FROM top WHERE code=?';
                conn.sql(sql, [code[i]], (err, data) => {
                    if(err) {
                        res.status(400).json({ msg: `조회 추가과정에서 에러가 발생했습니다 : ${code[i]}` });
                    } else {
                        let look = data + 1;
                        let sq = 'UPDATE top SET lookup=? WHERE code=?';
                        conn.sql(sq, [look, code[i]], (err, result, fields) => {
                            if(err) {
                                res.status(400).json({ msg: '조회 변경 과정에서 에러가 발생했습니다.' });
                            }
                        })
                    }
                });
                return;
            } else {
                if(i >= code.length - 1) {
                    console.log('fail');
                    console.log(response.data.msg);
                    res.status(400).json({ msg: response.data.msg });
                    return;
                }
            }
        })
    }
});

module.exports = router;