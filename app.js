// const http = require('http');
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3001;
const app = express();

app.use(bodyParser.json());

// let users = [
//     {
//         id: 1,
//         nombre: "Juan",
//         status: false
//     },
//     {
//         id: 2,
//         nombre: "Leire",
//         status: false
//     }
// ];

app.get('/', (request, response) => {
    response.send('<h1>Ongi etorri</h1>');
});

// all mendimartxas
app.get('/mendimartxas',(request, response) => {
    response.send("Lista de mendimartxas");
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

// BBDD
const conexion = mysql.createConnection({
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b77f4ba431fed6',
    password: '73e16742',
    database: 'heroku_980031004d924ce'
});

conexion.connect();