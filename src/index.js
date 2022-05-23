
// Servidor + API
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const secret = require('./settings/keys');
const cors = require('cors');

app.use(cors());

// Habilitar CORS
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods","GET, POST, OPTIONS, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers","Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.set('key', secret.key);

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

// Login usuario
/**
 * @swagger
 * /login-usuario:
 *  post:
 *    description: Login de usuario de App
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
                
                        const token = jwt.sign(payLoad, router.get('key'), {
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

app.listen(PORT, () => {
    console.log(`Servidor oyendo en el puerto ${PORT}`);
});