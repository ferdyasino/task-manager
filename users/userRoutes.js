// users/userRoutes.js
const express = require('express');
const { User } = require('../models');
const createUserController = require('./UserController');

const router = express.Router();
const controller = createUserController(User);

router.get('/', controller.getAllUsers);
router.post('/', controller.createUser);
router.put('/:id', controller.updateUser);
router.delete('/:id', controller.deleteUser);

module.exports = router;
