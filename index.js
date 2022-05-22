
// Servidor + API
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = process.env.PORT || 3309;
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = require('./settings/keys');
app.set('key', secret.key);

// Validar token de users
const verificacion = express.Router();

verificacion.use((req, res, next)=>{
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    
    if (!token) {
        res.status(401).send({
            error: "Es necesario un token de autentificación"
        });
        return;
    }

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length);
        console.log(token);
    }

    if (token) {
        jwt.verify(token, app.get('key'), (err, decoded) => {
            if (err) {
                return res.json({
                    message: "El token no es válido"
                })
            } else {
                req.decoded = decoded;
                next();
            }
        })
    }

});

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
        tags: [
            {
                name: "Mendimartxa",
                description: "Listado y fechas de mendimartxas en <b>Euskal Herria</b>",
            },
            {
                name: "Usuarios",
                description: "Usuarios de App"
            },
            {
                name: "Inicio",
                description: "<b>Ongi etorri, mendizaleok!</b>"
            }
        ],
        servers: [
            {
                url : "https://mendimartxas.herokuapp.com/",
                description: "Heroku server"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'apiKey',
                    name: 'Authorization',
                    scheme: 'bearer',
                    in: 'header',
                }
            },
            schemas: {
                Mendimartxa : {
                    type: "object",
                    properties: {
                        nombre: { type: "string" },
                        ciudad: { type: "string" },
                        distancia: { type: "float" },
                        fecha: { type: "string" },
                        participantes : { type: "number"}
                    },
                    required: ["nombre", "ciudad", "distancia", "fecha"],
                    example: {
                        nombre : "Gernikako mendi jaia",
                        ciudad : "Gernika",
                        distancia: 24.5,
                        fecha: "2022-05-09",
                        participantes: 350
                      }
                },
                Usuario: {
                    type: "object",
                    properties: {
                        nombre: {
                            type: "string",
                        },
                        password: {
                            type: "string"
                        }
                    },
                    example: {
                      nombre : "iban",
                      password : "1234abcd",
                    },
                    required: ["nombre", "password"]
                }
            }
        }     
    },
    apis: ['index.js'],
    security: [ { bearerAuth: [] } ]
}

app.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerJsdoc(objSwagger)));
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
/**
 * @swagger
 * /login-usuario:
 *  post:
 *    description: Login de usuario de App
 *    security:
 *     - bearerAuth: []
 *    tags : 
 *     - Usuarios
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *              type: object
 *              $ref: '#/components/schemas/Usuario'
 *    responses:
 *      200:
 *        description: Login correcto
 *        content: 
 *          application/json:
 *            schema: 
 *              type: array
 *              items:
 *                $ref : '#/components/schemas/Usuario'
 */
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

                            const payLoad = {
                                check : true
                            }
                    
                            const token = jwt.sign(payLoad, app.get('key'), {
                                expiresIn : '7d',
                                
                            })

                            response.json({success: true, message: 'Login correcto!', token : token});
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
 *    description: Selecciona las mendimartxas y utra-trails de <b>Euskal Herria</b>
 *    security:
 *     - bearerAuth: []
 *    summary: Lista todas las martxas de la BBDD
 *    tags : 
 *     - Mendimartxa
 *    responses:
 *      200:
 *        description: Respuesta exitosa
 *        content: 
 *          application/json:
 *            schema: 
 *              type: array
 *              $ref : '#/components/schemas/Mendimartxa'
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
app.post('/addMendiMartxa',verificacion, (request, response) => {
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
app.put('/update/:id',verificacion, (request, response) => {
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
app.delete('/borrar/:id',verificacion, (request, response) => {
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