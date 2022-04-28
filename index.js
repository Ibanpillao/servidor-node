// const http = require('http');
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3306;
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

// all mendimartxas
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

// 1 mendimartxa
app.get('/mendimartxas/:id',(request, response) => {
    response.send("Mendimartxa");
});

app.post('/addMendiMartxa',(request, response) => {
    response.send("Nueva mendimartxa");
});

app.put('/update/:id',(request, response) => {
    response.send("Actualizar mendimartxa");
});

app.delete('/borrar/:id',(request, response) => {
    response.send("Borrar mendimartxa");
});

app.get('/api/users', (request, response) => {
    response.json(users);
});

app.listen(PORT, () => {
    console.log(`Servidor oyendo en el puerto ${PORT}`);
});