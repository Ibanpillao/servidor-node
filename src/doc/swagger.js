
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
    apis: ['src/routes/martxa.route.js','src/routes/users.route.js','src/index.js'],
    security: [ { bearerAuth: [] } ]
}


module.exports = objSwagger;