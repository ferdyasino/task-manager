const express = require('express');
const router = express.Router();

const taskRoutesPromise = require('../tasks/taskRoutes');
const userRoutesPromise = require('../users/userRoutes');

module.exports = (async () => {
  try {
    const [taskRoutes, userRoutes] = await Promise.all([
      taskRoutesPromise,
      userRoutesPromise,
    ]);

    router.use('/tasks', taskRoutes);
    router.use('/users', userRoutes);

  } catch (err) {
    console.error('❌ Failed to initialize routes in apiRoutes.js:', err);
    router.use((_, res) => res.status(500).json({ error: 'Route initialization failed' }));
  }

  return router;
})();
