const express = require('express');
const router = express.Router();
const controller = require('./TaskController');
const authGuard = require('../middlewares/authGuard');
const upload = require('../middlewares/upload');

router.use(authGuard);

router.get('/', controller.getAllTasks);
router.post('/', upload.single('file'), controller.createTask);
router.put('/:id', upload.single('file'),  controller.updateTask);
router.delete('/:id', controller.deleteTask);

// 🔹 Task File Deletion
router.delete('/:taskId/files/:fileId', controller.deleteTaskFile);

module.exports = router;
