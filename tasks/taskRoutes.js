const express = require('express');
const router = express.Router();
const controller = require('./TaskController');
const authGuard = require('../middlewares/authGuard');

router.use(authGuard);

router.get('/', controller.getAllTasks);
router.post('/', controller.createTask);
router.put('/:id', controller.updateTask);
router.delete('/:id', controller.deleteTask);

module.exports = router;
