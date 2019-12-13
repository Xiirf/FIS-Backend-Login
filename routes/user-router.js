const express = require('express');
const withAuth = require('./middleware');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const UserCtrl = require('../controllers/user-ctrl');

const router = express.Router();

router.post('/user', UserCtrl.createUser);
router.post('/authenticate', UserCtrl.authenticate);
router.post('/user/forgottenPassword', UserCtrl.forgottenPassword);
router.get('/users', withAuth, UserCtrl.getUsers);
router.get('/user', withAuth, UserCtrl.getUser);
/**
 * @swagger
 * path:
 *  /checkToken:
 *    get:
 *      summary: Check if the token is valid
 *      tags: [Token]
 *      responses:
 *        "200":
 *          description: Token is valid.
 *        "401":
 *          description: Unauthorized
 *        "500":
 *          description: Internal error
 */
router.get('/checkToken', withAuth, function(req, res) {
    res.sendStatus(200);
});
router.put('/user', withAuth, UserCtrl.updateUser);
router.delete('/user', withAuth, UserCtrl.deleteUser);

// Swagger set up
const options = {
    swaggerDefinition: {
      openapi: "3.0.0",
      info: {
        title: "FIS backend login",
        version: "1.0.0",
        description:
          "Documentation API FIS-backend-login",
        license: {
          name: "MIT",
          url: "https://choosealicense.com/licenses/mit/"
        },
        contact: {
          name: "Swagger",
          url: "https://swagger.io",
          email: "Info@SmartBear.com"
        },
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          }
        }
      },
      security: [{
        bearerAuth: []
      }],
      servers: [
        {
          url: process.env.urlApp
        }
      ]
    },
    apis: ["./models/user-model.js", "./controllers/user-ctrl.js", "./routes/user-router.js"],        
  };
  const specs = swaggerJsdoc(options);
  router.use("/docs", swaggerUi.serve);
  router.get(
    "/docs",
    swaggerUi.setup(specs, {
      explorer: true
    })
  );


router.get("/docs", swaggerUi.setup(specs, { explorer: true }));

module.exports = router