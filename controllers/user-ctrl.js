/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Website's users
 */
const User = require('../models/user-model');
require('dotenv').config();
const jwt = require('jsonwebtoken');

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
 *        "400":
 *          description: Request error
 */
getUsers = (req, res) => {
    User.find({}, (err, users) => {
        if (err) {
            return res.status(400).json({ error: err })
        }
        if (!users.length) {
            return res
                .status(404)
                .json({ error: 'User not found' })
        }
        return res.status(200).json(users.map( u => {
            return {email: u.email, login: u.login}
        }))
    })
}

/**
 * @swagger
 * path:
 *  /user/{login}/email:
 *    put:
 *      summary: Update email
 *      tags: [Users]
 *      parameters: 
 *        - in: path
 *          name: login
 *          schema: 
 *            type: string
 *          required:
 *            login
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - newEmail
 *              properties:
 *                newEmail:
 *                  type: string
 *                  format: email
 *                  description: Email for the user.
 *              example:
 *                newEmail: test@email.com
 *      responses:
 *        "200":
 *          description: User updated
 *        "400":
 *          description: Parameters are missing
 *        "500":
 *          description: Server error
 */
updateEmail = (req, res) => {
    var login = req.params.login;
    
    User.findOne({ login }, function(err, user) {
        if (err) {
            console.error(err);
            return res.status(500)
                .json({
                error: 'Internal error please try again'
            });
        } else if (!user) {
            return res.status(400)
                .json({
                error: 'Incorrect login'
                });
        }
        var newEmail = req.body.newEmail;
    
        if (!newEmail){
            return res.status(400).json({
                success: false,
                error: 'You must provide an email',
            })
        }
        user.email = req.body.newEmail;
        updateCollection(res, user);
    });
}

/**
 * @swagger
 * path:
 *  /user/{login}/password:
 *    put:
 *      summary: Update password
 *      tags: [Users]
 *      parameters: 
 *        - in: path
 *          name: login
 *          schema: 
 *            type: string
 *          required:
 *            login
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - oldPassword
 *                - newPassword
 *              properties:
 *                oldPassword:
 *                  type: string
 *                  description: Old password.
 *                newPassword:
 *                  type: string
 *                  description: New password.
 *              example:
 *                oldPassword: oldMDP
 *                newPassword: newMDP
 *      responses:
 *        "200":
 *          description: User updated
 *        "400":
 *          description: Parameters are missing
 *        "500":
 *          description: Server error
 */
updatePassword = (req, res) => {
    var login = req.params.login;
    
    User.findOne({ login }, function(err, user) {
        if (err) {
            console.error(err);
            return res.status(500)
                .json({
                error: 'Internal error please try again'
            });
        } else if (!user) {
            return res.status(400)
                .json({
                error: 'Incorrect login'
                });
        } else {
            var newPassword = req.body.newPassword;
            var oldPassword = req.body.oldPassword;

            if (!newPassword || !oldPassword){
                return res.status(400).json({
                    success: false,
                    error: 'You must provide an old and new password',
                })
            }

            //vérifier si mdp est bon (faire méthode)
            user.isCorrectPassword(oldPassword, function(err, same) {
                if (err) {
                    console.log(err);
                    return res.status(500)
                        .json({
                        error: 'Internal error please try again'
                    });
                } else if (!same) {
                    return res.status(400)
                        .json({
                        error: 'Incorrect password'
                    });
                } else {
                    user.password = req.body.newPassword;
                    updateCollection(res, user);
                }
            });
        }
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
 *      summary: Update password
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
 *        "500":
 *          description: Server error
 */
authenticate = (req, res) => {
    const { login, password } = req.body;
    User.findOne({ login }, function(err, user) {
        if (err) {
            console.error(err);
            return res.status(500)
                .json({
                error: 'Internal error please try again'
            });
        } else if (!user) {
            return res.status(400)
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
 *  /user/{login}:
 *    delete:
 *      summary: Delete user
 *      tags: [Users]
 *      parameters: 
 *        - in: path
 *          name: login
 *          schema: 
 *            type: string
 *          required:
 *            login
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
 */
deleteUser = (req, res) => {
    if (!req.params.login){
        return res.status(400).json({ error: 'Parameters are missing' })
    }
    console.log(req.params.login);

    User.findOneAndDelete({ login: req.params.login }, (err, user) => {
        if (err) {
            return res.status(400).json({ error: err })
        }

        if (!user) {
            return res
                .status(404)
                .json({ error: 'User not found' })
        }

        return res.status(200).json({ user })
    })
}


module.exports = {
    createUser,
    getUsers,
    authenticate,
    updateEmail,
    updatePassword,
    deleteUser,
}