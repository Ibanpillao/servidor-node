// const http = require('http');
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3301;
const app = express();
const crypto = require("crypto");
// const hash = crypto.createHash('sha256',secret).digest('hex');

app.use(bodyParser.json());

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods","*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

// CONEXION HEROKU
const conexion = mysql.createPool({
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b77f4ba431fed6',
    password: '73e16742',
    database: 'heroku_980031004d924ce'
});

// CONEXION LOCAL
// const conexion = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'app-martxas'
// });

// conexion.connect();

// API - home
app.get('/', (request, response) => {
    response.send('Bizkaiko mendimartxak');
});

// // Registro usuario
// app.post('/registro-usuario',(request, response) => {

//     const hash = crypto.createHash('sha256',request.body.password).digest('hex');

//     const sql = 'INSERT INTO usuarios SET ?';

//     const user = {
//         nombre : request.body.nombre,
//         password : hash
//     }

//     conexion.query(sql, user, error => {
//         if (error) throw error;
//         response.send("Usuario añadido!");
//     });
// });

// Login usuario
app.post('/login-usuario',(request, response) => {

    const hash = crypto.createHash('sha256',request.body.password).digest('hex');

    const user = {
        nombre : request.body.nombre,
        password : hash
    }

    const sql = `SELECT * FROM usuarios WHERE nombre = '${user.nombre}' AND password = '${user.password}'`;

    conexion.query(sql, (error, resul) => {
        if (error) throw error;
        if (resul.length > 0) {
            response.json(resul);
        } else {
            response.send('Regístrese!');
        }
    });
});

// all mendimartxas
app.get('/mendimartxas',(request, response) => {
    const sql = 'SELECT * FROM martxas ORDER BY fecha';

    conexion.query(sql, (err, resul) => {
        if (err) throw err;
        if (resul.length > 0) {
            response.json(resul);
        } else {
            response.send('No hay datos');
        }
    });
});

// 1 mendimartxa
app.get('/mendimartxas/:id',(request, response) => {
    const {id} = request.params;
    const sql = `SELECT * FROM martxas WHERE idmartxas = ${id}`;

    conexion.query(sql, (err, resul) => {
        if (err) throw err;
        if (resul.length > 0) {
            response.json(resul);
        } else {
            response.send('No hay datos');
        }
    });
});

// Add mendimartxa
app.post('/addMendiMartxa',(request, response) => {
    const sql = "INSERT INTO martxas SET ?";

    const martxaObj = {
        nombre: request.body.nombre,
        ciudad: request.body.ciudad,
        distancia: request.body.distancia,
        fecha: request.body.fecha,
        participantes: request.body.participantes
    }
    conexion.query(sql, martxaObj, error => {
        if (error) throw error;
        response.send("Mendimartxa añadida!");
    });
});

// Actualizar
app.put('/update/:id',(request, response) => {
    const {id} = request.params;
    const {nombre, ciudad, distancia, fecha, participantes} = request.body;
    const sql = `UPDATE martxas SET ciudad = '${ciudad}', distancia = '${distancia}', fecha = '${fecha}',nombre = '${nombre}',participantes = '${participantes}' WHERE idmartxas = ${id}`;
    
    conexion.query(sql, error => {
        if (error) throw error;
        response.send(`Mendimartxa ${id} actualizada!`);
    });
});

// Borrar
app.delete('/borrar/:id',(request, response) => {
    const {id} = request.params;
    const sql = `DELETE FROM martxas WHERE idmartxas = ${id}`;

    conexion.query(sql, error => {
        if (error) throw error;
        response.send(`Mendimartxa ${id} borrada!`);
    });
});


app.listen(PORT, () => {
    console.log(`Servidor oyendo en el puerto ${PORT}`);
});