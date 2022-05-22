
const express = require('express');
const router = express.Router();

router.use((req, res, next)=>{
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

module.exports = router;