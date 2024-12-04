require("dotenv").config();

const mysql = require('mysql2');
const dbConnect = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_CONNECT_ID,
    password: process.env.DB_CONNECT_PW,
    database: 'test_db'
});

dbConnect.connect();

module.exports = dbConnect; 
