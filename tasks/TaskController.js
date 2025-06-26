const Task = require('./TaskModel');
const { normalizeStatus } = require('../utils/normalize');

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, status, dueDate } = req.body;
    const normalizedStatus = normalizeStatus(status);
    const task = await Task.create({ title, status: normalizedStatus, dueDate });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, status, dueDate } = req.body;
    const normalizedStatus = normalizeStatus(status);
    const task = await Task.findByPk(req.params.id);

    if (!task) return res.status(404).json({ error: 'Task not found' });

    await task.update({ title, status: normalizedStatus, dueDate });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
