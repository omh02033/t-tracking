const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "config", process.env.NODE_ENV == "production" ? ".env" : ".env.dev")
})

console.log(process.env)

const express = require("express");
const logger = require("morgan");
const cookieParser = require('cookie-parser');


const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, '/public')));
app.use(cookieParser());

app.use('/', require('./routes/index.js'));
app.use('/account/', require('./routes/account.js'));
app.use('/tracking/', require('./routes/track.js'));
app.use('/loginuser/', require('./routes/loginuser.js'));

app.listen(3000, () => { console.log("Connected !") });