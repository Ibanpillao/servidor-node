// const http = require('http');
const express = require('express');

const app = express()

let users = [
    {
        id: 1,
        nombre: "Juan",
        status: false
    },
    {
        id: 2,
        nombre: "Leire",
        status: false
    }
];

app.get('/', (request, response) => {
    response.send('<h1>Ongi etorri</h1>');
});

app.get('/api/users', (request, response) => {
    response.json(users);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor oyendo en el puerto ${PORT}`);
});