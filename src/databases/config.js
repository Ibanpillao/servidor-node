
/****************************
 * CONEXION BBDD
****************************/

const mysql = require('mysql');

// HEROKU
// const conexion = mysql.createPool({
//     host: 'us-cdbr-east-05.cleardb.net',
//     user: 'b77f4ba431fed6',
//     password: '73e16742',
//     database: 'heroku_980031004d924ce'
// });

// LOCALHOST
const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mendimartxas'
});

conexion.connect();


module.exports = conexion;