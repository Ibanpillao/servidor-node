const express = require('express');
const router = express.Router();
const conexion = require('../databases/config');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = require('../settings/keys');


// Registro usuario
router.post('/registro-usuario', (request, response) => {

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
 *    summary: Loguearse en app
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
    router.post('/login-usuario', (request, response) => {

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
                           jwt.sign({user : user.password}, secret.key, (err, token) => {
                             response.json({success: true, message: 'Login correcto!', token : token});
                           })
                        } else response.json({success: false, message: 'Contraseña incorrecta!'});
                    })
                } else if (resul.length == 0) {
                    response.json({success: false, message: 'El usuario no existe!'});                  
                }
            });
        }
    });

    module.exports = router;