const { UniqueConstraintError, ValidationError } = require('sequelize');
const Task = require('./TaskModel');
const { normalizeStatus } = require('../utils/normalize');

// ✅ GET all tasks for the authenticated user
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json(tasks);
  } catch (err) {
    console.error('❌ Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// ✅ POST create a new task for the user
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const normalizedStatus = normalizeStatus(status);

    const task = await Task.create({
      title: title.trim(),
      description,
      status: normalizedStatus,
      dueDate,
      userId: req.user.id, // ✅ associate with logged-in user
    });

    res.status(201).json(task);
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      return res.status(400).json({ error: 'Task title already exists' });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.errors[0].message });
    }

    console.error('❌ Create error:', err);
    res.status(400).json({ error: 'Failed to create task' });
  }
};

// ✅ PUT update a task — only if it belongs to the user
exports.updateTask = async (req, res) => {
  try {
    const { description, status, dueDate } = req.body;
    const normalizedStatus = normalizeStatus(status);
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await task.update({
      description,
      status: normalizedStatus,
      dueDate,
    });

    res.json(task);
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.errors[0].message });
    }

    console.error('❌ Update error:', err);
    res.status(400).json({ error: 'Failed to update task' });
  }
};

// ✅ DELETE task — only if it belongs to the user
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('❌ Delete error:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
