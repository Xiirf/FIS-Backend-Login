const User = require('../models/user-model');
require('dotenv').config()
const jwt = require('jsonwebtoken');

createUser = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Por favor, introduzca una contraseña y un correo',
        })
    }

    const user = new User({ email, password });

    user
        .save()
        .then(() => {
            return res.status(201).json({
                success: true,
                id: user._id,
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

getUsers = async (req, res) => {
    await User.find({}, (err, users) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!users.length) {
            return res
                .status(404)
                .json({ success: false, error: `User not found` })
        }
        return res.status(200).json({ success: true, data: users })
    }).catch(err => console.log(err))
}

//Vérifie le mdp et crée le token
authenticate = (req, res) => {
    const { email, password } = req.body;
    User.findOne({ email }, function(err, user) {
        if (err) {
        console.error(err);
        res.status(500)
            .json({
            error: 'Internal error please try again'
        });
        } else if (!user) {
        res.status(401)
            .json({
            error: 'Incorrect email'
            });
        } else {
        user.isCorrectPassword(password, function(err, same) {
            if (err) {
            res.status(500)
                .json({
                error: 'Internal error please try again'
            });
            } else if (!same) {
            res.status(401)
                .json({
                error: 'Incorrect email or password'
            });
            } else {
            // Issue token
            const payload = { email };
            const token = jwt.sign(payload, process.env.secret, {
                expiresIn: '1h'
            });
            res.cookie('token', token, { httpOnly: true })
                .sendStatus(200);
            }
        });
        }
    });
}


module.exports = {
    createUser,
    getUsers,
}