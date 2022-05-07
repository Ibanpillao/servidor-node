// const http = require('http');
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = process.env.PORT || 3309;
const app = express();
const bcrypt = require("bcryptjs");

app.use(bodyParser.json());
app.use(cors());

app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods","GET, POST, OPTIONS, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers","Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept");
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
//     database: 'mendimartxas'
// });

// conexion.connect();

// API - home
app.get('/', (request, response) => {
    response.send('Bizkaiko mendimartxak');
});

// // Registro usuario
app.post('/registro-usuario', (request, response) => {

    const user = {
        nombre : request.body.nombre,
        password : request.body.password
    }

    // let usuario = user.nombre;
    let clave = user.password;

    // let salto = bcrypt.genSalt(8);
    bcrypt.hash(clave, 8, (error, resp) => {
        user.password = resp;
    });
    
    if (user.nombre && user.password) {
        const sql2 = `SELECT * FROM usuarios WHERE nombre = '${user.nombre}'`;
                 
        conexion.query(sql2, async (error, results) => {
            if (error) throw error;

            // Si no existe el nombre, se inserta el usuario en la BBDD
            if (results.length == 0) {

                const sql = 'INSERT INTO usuarios SET ?';

                conexion.query(sql, user, (error,resul) => {
                    if (error) throw error;             
                    if (resul) {
                        response.json({success: true, message: 'Registro correcto!'});
                    } else {
                        response.json({success: false, message: 'Registro incorrecto!'});
                    }
                });    
            }            
             
        });
    }
});


// Login usuario
    app.post('/login-usuario', (request, response) => {

        const user = {
            nombre : request.body.nombre,
            password : request.body.password
        }

        if (user.nombre && user.password) {

            const sql = `SELECT * FROM usuarios WHERE nombre = '${user.nombre}'`;

            conexion.query(sql, (error, resul) => {
                if (error) throw error;
                if(resul.length > 0) {
                    bcrypt.compare( user.password, resul[0].password, (error, resultado) => {
                        if (resultado) {
                            response.json({success: true, message: 'Login correcto!'});
                            // response.send('Login correcto');
                        } else {
                            response.json({success: false, message: 'Login incorrecto!'});
                        }
                    })
                } 
            });
        }
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
    const sql = null;

    if (participantes == 0) {
        sql = `UPDATE martxas SET ciudad = '${ciudad}', distancia = '${distancia}', fecha = '${fecha}',nombre = '${nombre}' WHERE idmartxas = ${id}`;
    } else {
        sql = `UPDATE martxas SET ciudad = '${ciudad}', distancia = '${distancia}', fecha = '${fecha}',nombre = '${nombre}',participantes = '${participantes}' WHERE idmartxas = ${id}`;
    }
    
    conexion.query(sql, error => {
        if (error) throw error;
        response.send(`Mendimartxa ${id} actualizada!`);
    });
});

// Borrar
app.delete('/borrar/:id',(request, response) => {
    const {id} = request.params;
    const sql = `DELETE FROM martxas WHERE idmartxas = ${id}`;

    conexion.query(sql, (error,resul) => {
        if (error) throw error;
        if (resul) {
            response.json({success: true, message: `Marcha con id ${id} eliminada`});
        } else {
            response.json({success: false, message: `No se pudo eliminar la martxa`});
        }
    });
});


app.listen(PORT, () => {
    console.log(`Servidor oyendo en el puerto ${PORT}`);
});