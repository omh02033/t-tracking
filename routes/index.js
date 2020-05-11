const express = require('express');
const router = express.Router();

router
.get('/', (req, res) => {
    res.render('index');
})
.get('/about/', (req, res) => {
    res.render('about/index');
})

module.exports = router;