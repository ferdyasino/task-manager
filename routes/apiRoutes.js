const express = require('express');
const router = express.Router();

router.use('/', require('./configRoutes'));
router.use('/tasks', require('../tasks/taskRoutes'));
router.use('/users', require('../users/userRoutes'));
router.use('/auth', require('../auth/authRoutes'));

module.exports = router;
