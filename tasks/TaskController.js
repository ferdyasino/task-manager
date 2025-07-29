const { UniqueConstraintError, ValidationError, Op } = require('sequelize');
const Task = require('./Task');
const { normalizeStatus } = require('../utils/normalize');

exports.getAllTasks = async (req, res) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user info' });
    }

    const whereClause = req.user.role === 'admin'
      ? {}
      : { userId: req.user.userId };

    const tasks = await Task.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });

    if (!tasks.length) {
      return res.status(404).json({ message: 'No tasks found' });
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

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!dueDate || isNaN(Date.parse(dueDate))) {
      return res.status(400).json({ error: 'Valid due date is required' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || '',
      status: normalizeStatus(status),
      dueDate: new Date(dueDate),
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

exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const isOwner = task.userId === req.user.userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden: You can only update your own tasks' });
    }

    // Check duplicate title
    if (title && title.trim().toLowerCase() !== task.title.toLowerCase()) {
      const duplicate = await Task.findOne({
        where: {
          title: title.trim(),
          userId: req.user.userId,
          id: { [Op.ne]: task.id },
        },
      });
      if (duplicate) {
        return res.status(400).json({ error: 'Task title already exists' });
      }
    }

    // Validate date format (but allow any date)
    if (dueDate && isNaN(Date.parse(dueDate))) {
      return res.status(400).json({ error: 'Valid due date is required' });
    }

    await task.update({
      title: title ? title.trim() : task.title,
      description: description?.trim() ?? task.description,
      status: normalizeStatus(status) || task.status,
      dueDate: dueDate || task.dueDate,
    });

    res.json({ message: 'Task updated successfully', task });
  } catch (err) {
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.errors[0]?.message });
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

    const isOwner = task.userId === req.user.userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own tasks' });
    }

    await task.destroy();
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
