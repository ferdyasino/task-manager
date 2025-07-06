const { UniqueConstraintError, ValidationError } = require('sequelize');
const Task = require('./Task');
const { normalizeStatus } = require('../utils/normalize');

// ✅ GET all tasks for the logged-in user
exports.getAllTasks = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user info' });
    }

    const tasks = await Task.findAll({
      where: { userId: req.user.userId },
      order: [['createdAt', 'DESC']]
    });

    if (!tasks.length) {
      return res.status(404).json({ message: 'No tasks found for this user' });
    }

    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// ✅ POST create a new task for the logged-in user
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!dueDate || isNaN(Date.parse(dueDate))) {
      return res.status(400).json({ error: 'Valid due date is required' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || '',
      status: normalizeStatus(status),
      dueDate,
      userId: req.user.userId,
    });

    return res.status(201).json({ message: 'Task created successfully', task });
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      return res.status(400).json({ error: 'Task title already exists' });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.errors[0]?.message || 'Validation error' });
    }
    console.error('Error creating task:', err);
    return res.status(500).json({ error: 'Failed to create task' });
  }
};

// ✅ PUT update a task belonging to the logged-in user
exports.updateTask = async (req, res) => {
  try {
    const { description, status, dueDate } = req.body;
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden: You can only update your own tasks' });
    }

    await task.update({
      description: description?.trim() || '',
      status: normalizeStatus(status),
      dueDate,
    });

    res.json({ message: 'Task updated successfully', task });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

// ✅ DELETE a task owned by the logged-in user
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own tasks' });
    }

    await task.destroy();
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
