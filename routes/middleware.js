//Protège les routes
const jwt = require('jsonwebtoken');
require('dotenv').config();

const withAuth = function(req, res, next) {
    var token = req.headers['authorization'];

    if (!token) {
        res.status(401).send('Unauthorized: No token provided');
    } else {
        token = token.replace('Bearer ', '');
        jwt.verify(token, process.env.secret, function(err, decoded) {
            if (err) {
                res.status(401).send('Unauthorized: Invalid token');
            } else {
                next();
            }
        });
    }
}
module.exports = withAuth;