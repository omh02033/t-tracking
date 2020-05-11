const express = require('express');
const router = express.Router();
const mysql = require('mysql');

let conn = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'delivery'
});
conn.connect();

router