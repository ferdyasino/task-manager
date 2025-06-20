const express = require('express');
const router = express.Router();
const taskRoutes = require('../tasks/taskRoutes');
const userRoutes = require('../users/userRoutes');

router.use('/tasks', taskRoutes); // /api/tasks
router.use('/users', userRoutes); // /api/users

module.exports = router;
