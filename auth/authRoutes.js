const express = require('express');
const path = require('path');
const router = express.Router();
const controller = require('./AuthController');
const authGuard = require('../middlewares/authGuard');

// Show login form
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/login.html'));
});

// ✅ Show register form (optional browser UI)
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/register.html'));
});

// ✅ Handle login POST
router.post('/login', controller.login);

// ✅ Handle registration POST (needed for Postman or frontend)
router.post('/register', controller.register);

// Protected tasks page
router.get('/tasks', authGuard, (req, res) => {
  res.sendFile(path.join(__dirname, '../views/tasks.html'));
});

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

module.exports = router;
