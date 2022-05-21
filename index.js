
// Servidor + API
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = process.env.PORT || 3309;
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
var config = require('./config');

// Swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const objSwagger = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Node MySQL API",
            description: "API que trabaja con mendimartxas de EuskalHerria",
            version: "1.0.0",
            contact: {
                name: "Iván Sola",
                email: "ibanpillao@gmail.com"
            }
        },
        bearer: {
            description: "For accessing the API a valid JWT token must be passed in all the queries in the 'Authorization' header.",
            type: "apikey",
            name: "Authorization",
            in: "header"
        },
        servers: [
            {
                url : "https://mendimartxas.herokuapp.com/",
                description: "Heroku server"
            }
        ],     
    },
    apis: ['index.js'],
}

app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerJsdoc(objSwagger)));

/**
 * @swagger
 * components:
 *   securitySchemes: 
 *     basicAuth: 
 *        type: http
 *        scheme: basic
 *   schemas:
 *     Mendimartxa:
 *       description: Listado de mendimartxas de Euskalherria
 *       type: object
 *       properties:
 *         nombre :
 *           type : string
 *           description : Nombre de martxa
 *         ciudad : 
 *           type : string
 *           description : Ciudad donde se celebra la martxa
 *         distancia :
 *           type : number
 *           description : Distancia de martxa en km
 *         fecha :
 *           type : string
 *           description : Fecha en la que se celebra la martxa
 *         participantes :
 *           type: number
 *           description : Número de participantes
 *       required:
 *          - nombre
 *          - ciudad
 *          - distancia
 *          - fecha
 *       example:
 *          nombre : Bilboko mendi martxa
 *          ciudad : Bilbao
 *          distancia: 24.5
 *          fecha: 2022/02/23
 *          participantes: 350
 * security:
 *   - basicAuth: []
 * tags: 
 *  - name : Mendimartxa
 *    description: Listado y fechas de mendimartxas en Euskal Herria 
 *  - name : Inicio
 *    description : Ongi etorri, mendizaleok! 
 */

app.use(bodyParser.json());
app.use(cors());

// Habilitar CORS
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods","GET, POST, OPTIONS, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers","Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

// CONEXION BBDD HEROKU
const conexion = mysql.createPool({
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b77f4ba431fed6',
    password: '73e16742',
    database: 'heroku_980031004d924ce'
});

// CONEXION BBDD LOCALHOST
// const conexion = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'mendimartxas'
// });

// conexion.connect();

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

// Registro usuario
app.post('/registro-usuario', (request, response) => {

    const user = {
        nombre : request.body.nombre,
        password : request.body.password
    }

    let clave = user.password;

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
            } else {
                response.json({success: false, message: `El usuario \'${user.nombre}\' está en uso!`});
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
                        } else response.json({success: false, message: 'Contraseña incorrecta!'});
                    })
                } else if (resul.length == 0) {
                    response.json({success: false, message: 'El usuario no existe!'});                  
                }
            });
        }
    });

// all mendimartxas
/**
 * @swagger
 * /mendimartxas:
 *  get:
 *    security:
 *     - bearer: []
 *    summary: Lista todas las martxas de la BBDD
 *    tags : 
 *     - Mendimartxa
 *    responses:
 *      200:
 *        description: Lista completa de mendimartxas
 *        content: 
 *          application/json:
 *            schema: 
 *              type: array
 *              items:
 *                $ref : '#/components/schemas/Mendimartxa'
 */ 
app.get('/mendimartxas', (request, response) => {

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
/**
 * @swagger
 * /mendimartxas/{id}:
 *  get:
 *    security:
 *     - basicAuth: []
 *    summary: Lista una mendimartxa determinada
 *    tags : 
 *     - Mendimartxa
 *    parameters:
 *      - in: path
 *        name : id
 *        schema:
 *          type: string
 *        required : true
 *        description: Id de mendimartxa
 *    responses:
 *      200:
 *        description: Respuesta ok!
 *        content: 
 *          application/json:
 *            schema: 
 *              type: array
 *              items:
 *                $ref : '#components/schemas/Mendimartxa'
 *      404:
 *        description: La mendimartxa no existe
 */ 
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
/**
 * @swagger
 * /addMendiMartxa:
 *  post:
 *    security:
 *     - basicAuth: []
 *    summary: Añade 1 mendimartxa a la BBDD
 *    tags : 
 *      - Mendimartxa
 *    requestBody:
 *      required : true
 *      content: 
 *        application/json:
 *          schema:
 *            type: object
 *            $ref: '#/components/schemas/Mendimartxa'
 *    responses:
 *      200:
 *        description: Martxa añadida correctamente
 *        content: 
 *          application/json:
 *            schema: 
 *              type: array
 *              items:
 *                $ref : '#components/schemas/Mendimartxa'
 */ 
app.post('/addMendiMartxa',(request, response) => {
    const sql = "INSERT INTO martxas SET ?";

    const martxaObj = {
        nombre: request.body.nombre,
        ciudad: request.body.ciudad,
        distancia: request.body.distancia,
        fecha: request.body.fecha,
        participantes: request.body.participantes
    }
    conexion.query(sql, martxaObj, (error,result) => {
        if (error) throw error;
        response.json(result);
    });
});

// Actualizar
/**
 * @swagger
 * /update/{id}:
 *  put:
 *    security:
 *     - basicAuth: []
 *    summary: Actualiza una mendimartxa
 *    tags : 
 *      - Mendimartxa
 *    requestBody:
 *      required : true
 *      content: 
 *        application/json:
 *          schema:
 *            type: object
 *            $ref: '#/components/schemas/Mendimartxa'
 *    parameters:
 *      - in: path
 *        name : id
 *        schema:
 *          type: string
 *        required : true
 *        description: Id de mendimartxa
 *    responses:
 *      200:
 *        description: Martxa actualizada
 *      404:
 *        description: La mendimartxa no existe
 */ 
app.put('/update/:id',(request, response) => {
    const {id} = request.params;
    const {nombre, ciudad, distancia, fecha, participantes} = request.body;
    const sql = `UPDATE martxas SET ciudad = '${ciudad}', distancia = '${distancia}', fecha = '${fecha}',nombre = '${nombre}',participantes = '${participantes}' WHERE idmartxas = ${id}`;
    
    conexion.query(sql, (error,resul) => {
        if (error) throw error;
        if (resul) {
            response.json({success: true, message: `Martxa ${id} actualizada`});
        }

    });
});


// Borrar
/**
 * @swagger
 * /borrar/{id}:
 *  delete:
 *    security:
 *     - basicAuth: []
 *    summary: Lista una mendimartxa determinada
 *    tags : 
 *      - Mendimartxa
 *    parameters:
 *      - in: path
 *        name : id
 *        schema:
 *          type: string
 *        required : true
 *        description: Id de mendimartxa
 *    responses:
 *      200:
 *        description: Mendimartxa borrada correctamente
 *      404:
 *        description: La mendimartxa no existe
 */ 
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

app.post("/api/login", (req , res) => {
    const user = {
        id: 1,
        nombre : "Iban",
        email: "isola@birt.eus"
    }

    jwt.sign({user}, 'secretkey', {expiresIn: '32s'}, (err, token) => {
        res.json({
            token
        });
    });

});


app.listen(PORT, () => {
    console.log(`Servidor oyendo en el puerto ${PORT}`);
});