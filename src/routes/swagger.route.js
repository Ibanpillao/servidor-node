const express = require('express');
const router = express.Router();
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const doc = require('../doc/swagger');

router.use('/api-doc', swaggerUI.serve, swaggerUI.setup(swaggerJsdoc(doc)));

module.exports = router;