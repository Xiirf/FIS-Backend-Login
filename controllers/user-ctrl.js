/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Website's users
 */
const User = require('../models/user-model');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

/**
 * @swagger
 * path:
 *  /user:
 *    post:
 *      summary: Create a new user
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      responses:
 *        "201":
 *          description: User created
 *        "400":
 *          description: Parameters are missing
 *        "401":
 *          description: Login or email already used
 */
createUser = (req, res) => {
    const { email, login, password } = req.body;

    if (!email || !password || !login) {
        return res.status(400).json({
            error: 'You must provide an user (email/password/login)',
        })
    }

    const user = new User({ email, login, password });

    user
        .save()
        .then(() => {
            return res.status(201).json({
                message: 'User created!',
            })
        })
        .catch(() => {
            return res.status(401).json({
                error: 'Login or email already used!',
            })
        })
}

/**
 * @swagger
 * path:
 *  /users:
 *    get:
 *      summary: Get all users
 *      tags: [Users]
 *      responses:
 *        "200":
 *          description: Return all users login and email
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                required:
 *                  - email
 *                  - login
 *                properties:
 *                  email:
 *                    type: string
 *                    description: User email.
 *                  login:
 *                    type: string
 *                    description: User login.
 *        "404":
 *          description: Ressource not found
 *        "500":
 *          description: Internal error
 */
getUsers = (req, res) => {
    User.find({}, (err, users) => {
        if (err) {
            return res.status(500).json({ error: err })
        }
        if (!users.length) {
            return res
                .status(404)
                .json({ error: 'User not found' })
        }
        userList = users.map( u => {
            return {email: u.email, login: u.login}
        })
        return res.status(200).json({users: userList})
    })
}

/**
 * @swagger
 * path:
 *  /user:
 *    get:
 *      summary: Get actual user info
 *      tags: [Users]
 *      responses:
 *        "200":
 *          description: Return all users login and email
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                required:
 *                  - email
 *                  - login
 *                properties:
 *                  email:
 *                    type: string
 *                    description: User email.
 *                  login:
 *                    type: string
 *                    description: User login.
 *        "404":
 *          description: Ressource not found
 *        "500":
 *          description: Internal error
 */
getUser = (req, res) => {
    var token = req.headers['authorization'];
    token = token.replace('Bearer ', '');
    const login = jwt.decode(token).login;

    User.findOne({login}, (err, user) => {
        if (err) {
            return res.status(500).json({ error: err })
        } else if (!user) {
            return res.status(404)
                .json({
                error: 'Incorrect login'
                });
        }
        return res.status(200).json({email: user.email, login: user.login})
    })
}

/**
 * @swagger
 * path:
 *  /user:
 *    put:
 *      summary: Update User
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                newEmail:
 *                  type: string
 *                  format: email
 *                  description: Email for the user.
 *                newPassword:
 *                  type: string
 *                  description: New password.
 *              example:
 *                newEmail: test@email.com
 *                newPassword: newMdp
 *      responses:
 *        "200":
 *          description: User updated
 *        "400":
 *          description: Parameters are missing
 *        "404":
 *          description: Ressource not found
 *        "500":
 *          description: Server error
 */
updateUser = (req, res) => {
    var token = req.headers['authorization'];
    token = token.replace('Bearer ', '');
    const login = jwt.decode(token).login;
    
    User.findOne({ login }, function(err, user) {
        if (err) {
            console.error(err);
            return res.status(500)
                .json({
                error: 'Internal error please try again'
            });
        } else if (!user) {
            return res.status(404)
                .json({
                error: 'Incorrect login'
                });
        }

        if(!req.body.newEmail && !req.body.newPassword){
            return res.status(400)
                .json({
                error: 'No parameter to update'
                });
        }else {
            if(req.body.newEmail){
                user.email = req.body.newEmail;
            } 
            if (req.body.newPassword){
                user.password = req.body.newPassword;
            }
        }
        updateCollection(res, user);
    });
}

updateCollection = (res, collection) => {
    collection.save()
        .then(() => {
            return res.status(200).json({
                message: 'User updated!',
            })
        })
        .catch(error => {
            return res.status(400).json({
                error,
                message: 'User not updated!',
            })
        })
}

/**
 * @swagger
 * path:
 *  /authenticate:
 *    post:
 *      summary: Authenticate
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - login
 *                - password
 *              properties:
 *                login:
 *                  type: string
 *                  description: Login for the user.
 *                password:
 *                  type: string
 *                  description: New password.
 *              example:
 *                login: loginTest
 *                password: mdpTest
 *      responses:
 *        "200":
 *          description: User updated
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                required:
 *                  - token
 *                properties:
 *                  token:
 *                    type: string
 *                    description: Token.
 *        "400":
 *          description: Parameters are missing
 *        "404":
 *          description: Ressource not found
 *        "500":
 *          description: Server error
 */
authenticate = (req, res) => {
    const { login, password } = req.body;
    if (!password || !login) {
        return res.status(400).json({
            error: 'You must provide an user (password/login)',
        })
    }
    User.findOne({ login }, function(err, user) {
        if (err) {
            return res.status(500)
                .json({
                error: 'Internal error please try again'
            });
        } else if (!user) {
            return res.status(404)
                .json({
                error: 'Incorrect login or password '
                });
        } else {
            user.isCorrectPassword(password, function(err, same) {
                if (err) {
                    return res.status(500)
                        .json({
                        error: 'Internal error please try again'
                    });
                } else if (!same) {
                    return res.status(400)
                        .json({
                        error: 'Incorrect password or login'
                    });
                } else {
                    // Issue token
                    const payload = { login };
                    const token = jwt.sign(payload, process.env.secret, {
                        expiresIn: '1h'
                    });
                    return res.status(200)
                            .json({ token: token });
                }
            });
        }
    });
}

/**
 * @swagger
 * path:
 *  /user:
 *    delete:
 *      summary: Delete user
 *      tags: [Users]
 *      responses:
 *        "200":
 *          description: User deleted
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/User'
 *        "400":
 *          description: Parameters are missing
 *        "404":
 *          description: User not found
 *        "500":
 *          description: Internal error
 */
deleteUser = (req, res) => {
    var token = req.headers['authorization'];
    token = token.replace('Bearer ', '');
    const login = jwt.decode(token).login;

    User.findOneAndDelete({ login }, (err, user) => {
        if (err) {
            return res.status(500).json({ error: err })
        }

        if (!user) {
            return res
                .status(404)
                .json({ error: 'User not found' })
        }

        return res.status(200).json({ user })
    })
}

/**
 * @swagger
 * path:
 *  /user/forgottenPassword:
 *    post:
 *      summary: Send an email to change password
 *      tags: [Users]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - email
 *              properties:
 *                email:
 *                  type: string
 *                  description: User email.
 *              example:
 *                email: test@email.com
 *      responses:
 *        "200":
 *          description: Email send.
 *        "404":
 *          description: Ressource not found
 *        "500":
 *          description: Internal error
 */
forgottenPassword = (req, res) => {
    var email = req.body.email;
    if (!email) {
        return res.status(400).json({
            error: 'You must provide an email',
        })
    }

    User.findOne({ email }, (err, user) => {
        if (err) {
            return res.status(500).json({ error: err })
        } else if (!user) {
            return res.status(404)
                .json({
                error: 'Incorrect email'
                });
        }
        const login = user.login
        const payload = { login };
        const token = jwt.sign(payload, process.env.secret, {
            expiresIn: '1h'
        });

        var transporter = nodemailer.createTransport({
            host: "smtp-mail.outlook.com", // hostname
            secureConnection: false, // TLS requires secureConnection to be false
            port: 587, // port for secure SMTP
            tls: {
                ciphers:'SSLv3'
            },
            auth: {
              user: 'fistest@outlook.fr',
              pass: 'testFIS2019'
            }
        });

        var mailOptions = {
            from: 'fistest@outlook.fr',
            to: email,
            subject: 'Password change',
            text: token
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                return res.status(500).json({ error: error })
            } else {
                return res.status(200).json({message: info});
            }
        });
    })
}

module.exports = {
    createUser,
    getUsers,
    authenticate,
    updateUser,
    deleteUser,
    getUser,
    forgottenPassword,
}