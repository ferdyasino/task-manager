const express = require('express');
const router = express.Router();
const { login } = require('./AuthController'); 

router.post('/login', login);

module.exports = router;
