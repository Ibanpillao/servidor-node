const express = require('express');
const router = express.Router();
const conexionBBDD = require('../databases/config');


router.get('/', conexionBBDD);

module.exports = router;
