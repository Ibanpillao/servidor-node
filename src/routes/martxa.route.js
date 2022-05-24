const express = require('express');
const router = express.Router();
const conexion = require('../databases/config');
const verificacion = require('../settings/verifyKey');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const doc = require('../doc/swagger')
router.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerJsdoc(doc)));

// Habilitar CORS
router.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods","GET, POST, OPTIONS, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers","Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

// all mendimartxas
/**
 * @swagger
 * /mendimartxas:
 *  get:
 *    description: Selecciona las mendimartxas y utra-trails de <b>Euskal Herria</b>
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
 router.get('/mendimartxas', (request, response) => {

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
*     - bearerAuth: []
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
router.get('/mendimartxas/:id',(request, response) => {
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
*     - bearerAuth: []
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
router.post('/addMendiMartxa',verificacion, (request, response) => {
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
*     - bearerAuth: []
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
router.put('/update/:id',verificacion, (request, response) => {
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
*     - bearerAuth: []
*    summary: Borra una mendimartxa determinada
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
router.delete('/borrar/:id',verificacion, (request, response) => {
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



module.exports = router;