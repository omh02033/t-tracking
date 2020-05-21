const express = require('express');
const router = express.Router();

router
.get('/', check, (req, res) => {
    res.render('index');
})
.get('/about/', (req, res) => {
    res.render('about/index');
})

module.exports = router;

function check(req, res, next){
    console.log(req.cookies);
    try {
        let token = req.cookies.user;
        console.log(token);
        jwt.verify(token, config.secret, (err, decoded) => {
            if(err) {
                next();
            }
            else { next(); }
        });
    } catch {
        next();
    }
}