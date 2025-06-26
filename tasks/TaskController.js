const { Task } = require('../models');
const { normalizeStatus } = require('../utils/normalize');
const { UniqueConstraintError } = require('sequelize');

exports.getAllTasks = async (req, res) => {
  const tasks = await Task.findAll();
  res.json(tasks);
};

exports.createTask = async (req, res) => {
  const { title, status, dueDate } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required.' });

  const existing = await Task.findOne({ where: { title } });
  if (existing) return res.status(400).json({ error: 'Task title must be unique.' });

  const normalizedStatus = normalizeStatus(status);
  if (!normalizedStatus) return res.status(400).json({ error: 'Invalid status.' });

  try {
    const task = await Task.create({ title, status: normalizedStatus, dueDate });
    res.status(201).json(task);
  } catch (err) {
    if (err instanceof UniqueConstraintError) return res.status(400).json({ error: 'Title must be unique.' });
    if (err.name === 'SequelizeValidationError') return res.status(400).json({ error: err.errors.map(e => e.message) });
    throw err;
  }
};

exports.updateTask = async (req, res) => {
  const task = await Task.findByPk(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { title, status, dueDate } = req.body;

  if (title) task.title = title;
  if (status) {
    const normalized = normalizeStatus(status);
    if (!normalized) return res.status(400).json({ error: 'Invalid status.' });
    task.status = normalized;
  }
  if (dueDate) task.dueDate = dueDate;

  await task.save();
  res.json(task);
};

exports.deleteTask = async (req, res) => {
  const task = await Task.findByPk(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  await task.destroy();
  res.json({ message: 'Task deleted', task });
};
