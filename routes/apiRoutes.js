const express = require('express');
const router = express.Router();

const userRoutes = require('../users/userRoutes');
const taskRoutes = require('../tasks/taskRoutes');

router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;
