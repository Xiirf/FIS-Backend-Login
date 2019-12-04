const express = require('express');
const withAuth = require('./middleware');

const UserCtrl = require('../controllers/user-ctrl')

const router = express.Router()

router.post('/user', UserCtrl.createUser);
router.post('/authenticate', UserCtrl.authenticate);
router.get('/users', withAuth, UserCtrl.getUsers);
//Permet de savoir si le token est bon
router.get('/checkToken', withAuth, function(req, res) {
    res.sendStatus(200);
});
router.put('/user/:login', withAuth, UserCtrl.updateUser);
module.exports = router