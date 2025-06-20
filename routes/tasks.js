const express = require('express');
const router = express.Router();
const Task = require('../models/task');

router.get('/', async (req, res) => {
    const tasks = await Task.findAll();
    res.json(tasks);
});

router.post('/', async (req, res) => {
    const { title, status, dueDate } = req.body;

    // if (!title || !status) {
    //     return res.status(400).json({ error: 'Title and status are required.' });
    // }

    const newTask = await Task.create({ title, status, dueDate });
    res.status(201).json(newTask);
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, status } = req.body;

    const task = await Task.findByPk(id);

    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }

    // if ('id' in req.body) {
    //     return res.status(400).json({ error: 'Cannot update task ID.' });
    // }

    // if (title !== undefined) task.title = title;
    // if (status !== undefined) task.status = status;

    await task.save();
    res.json(task);
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const task = await Task.findByPk(id);

    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }

    await task.destroy();
    res.json({ message: 'Task deleted', task });
});

module.exports = router;