const express = require('express');
const router = express.Router();
const controller = require('./UserController');
const authGuard = require('../middlewares/authGuard');

// Public routes
router.post('/login', controller.login);
router.post('/register', controller.register);
router.post('/forgot-password', controller.forgotPassword);
router.post('/reset-password/:token', controller.resetPassword);

// Protected routes
router.use(authGuard);
router.get('/', controller.getAllUsers);
router.post('/', controller.createUser);
router.put('/:id', controller.updateUser);
router.delete('/:id', controller.deleteUser);

module.exports = router;
