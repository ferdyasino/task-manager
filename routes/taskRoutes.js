const express = require('express');
const router = express.Router();

const tasks = [];

router.get('/', (req, res) => res.json(tasks));

router.post('/', (req, res) => {
    if ('id' in req.body) {
        return res.status(400).json({ error: 'Do not provide ID; it is generated automatically.' });
    }

    const nextId = tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1;
    const { title, status } = req.body;

    if (!title || !status) {
        return res.status(400).json({ error: 'Title and status are required.' });
    }

    const newTask = { id: nextId, title, status };
    tasks.push(newTask);

    res.status(201).json(newTask);
});

router.put('/:id',(req, res) => {
    const tID = req.params.id;
    const task = tasks.find(t => t.id == tID);
    
    if (!task){
        return res.status(404).json({ error: 'Task not found' });
    }

    const { title, status } = req.body;

    if (title !== undefined) task.title = title;
    if (status !== undefined) task.status = status;
    res.json(task);
});

router.delete('/:id', (req, res) => {
    const tID = parseInt(req.params.id);
    const task = tasks.findIndex(t => t.id === tID);

    if (task === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }

    const delTask = tasks.splice(task, 1);
    res.json({ message: 'Task deleted', task: delTask[0] });
});

module.exports = router;