const { UniqueConstraintError } = require('sequelize');
const { normalizeStatus } = require('../utils/normalize');

module.exports = (Task) => ({
  // GET all
  getAllTasks: async (req, res) => {
    const tasks = await Task.findAll();
    res.json(tasks);
  },

  // CREATE
  createTask: async (req, res) => {
    const { title, status, dueDate } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });

    const existing = await Task.findOne({ where: { title } });
    if (existing) {
      return res.status(400).json({ error: 'Task title must be unique.' });
    }

    const normalizedStatus = normalizeStatus(status);
    if (!normalizedStatus) {
      return res.status(400).json({ error: "Invalid status. Allowed: 'pending', 'in-progress', 'done'." });
    }

    try {
      const task = await Task.create({ title, status: normalizedStatus, dueDate });
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        return res.status(400).json({ error: 'Task title must be unique.' });
      }
      if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({ error: err.errors.map(e => e.message) });
      }
      throw err;
    }
  },

  // UPDATE
  updateTask: async (req, res) => {
    const { id } = req.params;
    const { title, status, dueDate } = req.body;

    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (title !== undefined) task.title = title;

    if (status !== undefined) {
      const normalizedStatus = normalizeStatus(status);
      if (!normalizedStatus) {
        return res.status(400).json({ error: "Invalid status. Allowed: 'pending', 'in-progress', 'done'." });
      }
      task.status = normalizedStatus;
    }

    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();
    res.json(task);
  },

  // DELETE
  deleteTask: async (req, res) => {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await task.destroy();
    res.json({ message: 'Task deleted', task });
  }
});
