const { UniqueConstraintError } = require('sequelize');
const Task = require('./Task');

// GET all
exports.getAllTasks = async (req, res) => {
  const tasks = await Task.findAll();
  res.json(tasks);
};

// CREATE
exports.createTask = async (req, res) => {
  const { title, status } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });


   const existing = await Task.findOne({ where: { title } });
    if (existing) {
        return res.status(400).json({ error: 'Task title must be unique.' });
    }

    try {
        const task = await Task.create({ title, status });
        res.status(201).json(task);
    } catch (err) {
        if (err instanceof UniqueConstraintError) {
         return res.status(400).json({ error: 'Task title must be unique.' });
        }
        throw err;
    }

  const task = await Task.create({ title, status });
  res.status(201).json(task);
};

// UPDATE
exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, status } = req.body;

  const task = await Task.findByPk(id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  if (title !== undefined) task.title = title;
  if (status !== undefined) task.status = status;
  await task.save();

  res.json(task);
};

// DELETE
exports.deleteTask = async (req, res) => {
  const { id } = req.params;
  const task = await Task.findByPk(id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  await task.destroy();
  res.json({ message: 'Task deleted', task });
};
