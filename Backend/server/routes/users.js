const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { verifyToken } = require('../middleware/authMiddleware');


router.get('/users', usersController.getAllUsers);

router.get('/users/:id', verifyToken, usersController.getUserById);

//pre auth user creation
//router.post('/users', usersController.createUser);

router.put('/users/:id', verifyToken, usersController.updateUser);

router.delete('/users/:id', verifyToken, usersController.deleteUser);

module.exports = router;
