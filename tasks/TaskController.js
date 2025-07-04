const { UniqueConstraintError, ValidationError } = require('sequelize');
const Task = require('./Task');
const { normalizeStatus } = require('../utils/normalize');

exports.getAllTasks = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized: Missing user info' });
    }

    console.log('Fetching tasks for user:', req.user.id);

    const tasks = await Task.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    if (tasks.length === 0) {
      return res.status(404).json({ message: 'No tasks found for this user' });
    }

    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};



exports.createTask = async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const normalizedStatus = normalizeStatus(status);
    const normalizedDescription = description ? description.trim() : '';

    if (!dueDate || isNaN(new Date(dueDate))) {
      return res.status(400).json({ error: 'Valid due date is required' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: normalizedDescription,
      status: normalizedStatus,
      dueDate,
      userId: req.user.id, 
    });

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      return res.status(400).json({ error: 'Task title already exists' });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.errors[0].message });
    }

    console.error('Error creating task:', err);
    res.status(400).json({ error: 'Failed to create task' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { description, status, dueDate } = req.body;
    const normalizedStatus = normalizeStatus(status);

    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You can only update your own tasks' });
    }

    const normalizedDescription = description ? description.trim() : '';

    if (dueDate && isNaN(new Date(dueDate))) {
      return res.status(400).json({ error: 'Valid due date is required' });
    }

    await task.update({
      description: normalizedDescription,
      status: normalizedStatus,
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

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own tasks' });
    }

    await task.destroy();
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
