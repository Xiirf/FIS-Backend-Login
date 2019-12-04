const User = require('../models/user-model');
require('dotenv').config();
const jwt = require('jsonwebtoken');

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
        .catch(error => {
            return res.status(400).json({
                error,
                message: 'User not created!',
            })
        })
}

getUsers = (req, res) => {
    User.find({}, (err, users) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!users.length) {
            return res
                .status(404)
                .json({ success: false, error: `User not found` })
        }
        return res.status(200).json(users.map( u => {
            return {email: u.email, login: u.login}
        }))
    })
}

updateUser = (req, res) => {
    var login = req.params.login;
    var flag = req.body.flag;
    
    User.findOne({ login }, function(err, user) {
        if (err) {
            console.error(err);
            return res.status(500)
                .json({
                error: 'Internal error please try again'
            });
        } else if (!user) {
            return res.status(401)
                .json({
                error: 'Incorrect login or password '
                });
        }
        if (flag === "password"){
            this.updatePassword(req, res, user);
        } else if (flag === "email"){
            this.updateEmail(req, res, user);
        } else {
            return res.status(401)
                .json({
                error: 'Incorrect flag'
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

updateEmail = (req, res, user) => {
    var newEmail = req.body.newEmail;
    
    if (!newEmail){
        return res.status(400).json({
            success: false,
            error: 'You must provide an email',
        })
    }
    user.email = req.body.newEmail;
    updateCollection(res, user);
}

updatePassword = async (req, res, user) => {
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
            return res.status(401)
                .json({
                error: 'Incorrect password'
            });
        } else {
            user.password = req.body.newPassword;
            updateCollection(res, user);
        }
    });
}

//Vérifie le mdp et crée le token
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
            return res.status(401)
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
                    return res.status(401)
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
    //return res;
}


module.exports = {
    createUser,
    getUsers,
    authenticate,
    updateUser,
}