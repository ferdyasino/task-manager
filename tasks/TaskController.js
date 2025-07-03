const { UniqueConstraintError, ValidationError } = require('sequelize');
const Task = require('./Task');
const { normalizeStatus } = require('../utils/normalize');

// ✅ GET all tasks for the authenticated user (with pagination)
exports.getAllTasks = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    console.log('Fetching tasks for user:', req.user.id);  // Debugging log

    // Fetch tasks with pagination, using the correct userId field
    const tasks = await Task.findAll({
      where: { userId: req.user.id },  // Use userId instead of id
      order: [['createdAt', 'DESC']],  // Order by creation date
      limit: parseInt(limit),
      offset: (page - 1) * limit
    });

    if (tasks.length === 0) {
      return res.status(404).json({ message: 'No tasks found for this user' });
    }

    // Get total task count for pagination info
    const totalTasks = await Task.count({
      where: { userId: req.user.id }  // Use userId instead of id
    });

    const totalPages = Math.ceil(totalTasks / limit);

    res.json({
      tasks,
      totalTasks,
      totalPages,
      currentPage: page,
      perPage: limit
    });
  } catch (err) {
    console.error('❌ Error fetching tasks:', err);
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
    const normalizedDescription = description ? description.trim() : '';

    // Validate dueDate
    if (!dueDate || isNaN(new Date(dueDate))) {
      return res.status(400).json({ error: 'Valid due date is required' });
    }

    // Create task
    const task = await Task.create({
      title: title.trim(),
      description: normalizedDescription,
      status: normalizedStatus,
      dueDate,
      userId: req.user.id, // associate with logged-in user
    });

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      return res.status(400).json({ error: 'Task title already exists' });
    }
    if (err instanceof ValidationError) {
      return res.status(400).json({ error: err.errors[0].message });
    }

    console.error('❌ Error creating task:', err);
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

    console.error('❌ Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
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
      return res.status(403).json({ error: 'Forbidden: You can only delete your own tasks' });
    }

    await task.destroy();
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
