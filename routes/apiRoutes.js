const express = require('express');
const router = express.Router();

router.use('/tasks', require('../tasks/taskRoutes'));
router.use('/users', require('../users/userRoutes'));

module.exports = router;
