
// Servidor + API
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
app.use(cors());

// Habilitar CORS
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods","GET, POST, OPTIONS, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers","Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

// SETTINGS
const PORT = process.env.PORT || 3309;

// MIDDLEWARES
app.use(bodyParser.json());

// RUTAS
app.use(require('./routes/martxa.route'));
app.use(require('./routes/swagger.route'));
app.use(require('./routes/users.route'));

// API - home
/**
 * @swagger
 * /:
 *  get:
 *    summary: mensaje inicial de API
 *    tags : 
 *     - Inicio
 *    responses:
 *      200:
 *        description: Respuesta exitosa!
 */
app.get('/', (request, response) => {
    response.send('<h1>Bizkaiko mendimartxak</h1>');
});

app.listen(PORT, () => {
    console.log(`Servidor oyendo en el puerto ${PORT}`);
});