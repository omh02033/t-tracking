const express = require("express");
const path = require("path");
const logger = require("morgan");

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, '/public')));

app.use('/', require('./routes/index.js'));
app.use('/account/', require('./routes/account.js'));
app.use('/tracking/', require('./routes/track.js'));
app.use('/loginuser/', require('./routes/loginuser.js'));

app.listen(3000, () => { console.log("Connected !") });