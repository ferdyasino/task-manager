const express = require('express');
const router = express.Router();
const controller = require('./TaskController');

router.get('/', controller.getAllTasks);
router.post('/', controller.createTask);
router.put('/:id', controller.updateTask);
router.delete('/:id', controller.deleteTask);

module.exports = router;
