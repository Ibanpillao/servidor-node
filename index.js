// const http = require('http');
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3050;
const app = express();

app.use(bodyParser.json());

// // BBDD
const conexion = mysql.createConnection({
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b77f4ba431fed6',
    password: '73e16742',
    database: 'heroku_980031004d924ce'
});


// const conexion = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'ud04'
// });

conexion.connect();

app.get('/', (request, response) => {
    response.send('Bizkaiko mendimartxak');
});

// // all mendimartxas
app.get('/mendimartxas',(request, response) => {
    const sql = 'SELECT * FROM martxas';

    conexion.query(sql, (err, resul) => {
        if (err) throw err;
        if (resul.length > 0) {
            response.json(resul);
        } else {
            response.send('No hay datos');
        }
    });
});

// // 1 mendimartxa
app.get('/mendimartxas/:id',(request, response) => {
    const {id } = request.params;
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

// // Add mendimartxa
app.post('/addMendiMartxa',(request, response) => {
    const sql = "INSERT INTO martxas SET ?";

    const martxaObj = {
        ciudad: request.body.ciudad,
        distancia: request.body.distancia,
        fecha: request.body.fecha
    }
    conexion.query(sql, martxaObj, error => {
        if (error) throw error;
        response.send("Mendimartxa añadida!");
    });
});

// Actualizar
app.put('/update/:id',(request, response) => {
    const {id} = request.params;
    const {ciudad, distancia, fecha} = request.body;
    const sql = `UPDATE martxas SET ciudad = '${ciudad}', distancia = '${distancia}', fecha = '${fecha}' WHERE idmartxas = ${id}`;
    
    conexion.query(sql, error => {
        if (error) throw error;
        response.send(`Mendimartxa ${id} actualizada!`);
    });
});

// // Borrar
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
