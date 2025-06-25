const express = require('express');
const initModels = require('../models');

module.exports = (async () => {
  const router = express.Router();

  try {
    const models = await initModels(); // ✅ load models
    const controller = require('./TaskController')(models.Task); // ✅ inject Task

    router.get('/', controller.getAllTasks);
    router.post('/', controller.createTask);
    router.put('/:id', controller.updateTask);
    router.delete('/:id', controller.deleteTask);

  } catch (err) {
    console.error('❌ Failed to initialize task routes:', err);
    router.use((_, res) => {
      res.status(500).json({ error: 'Task controller init failed.' });
    });
  }

  return router;
})();
