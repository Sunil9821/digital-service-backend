const mysql = require('mysql2');
const connection = mysql.createConnection({
    host : 'localhost',
    database: 'digitalservices',
    user: 'root',
    password: '123456',
})

connection.connect();

module.exports = connection;