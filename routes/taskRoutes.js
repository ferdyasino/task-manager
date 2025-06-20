const express = require('express');
const router = express.Router();

const tasks = [];

router.get('/', (req, res) => res.json(tasks));

router.post('/', (req, res) => {
    const newTask = { id: tasks.length + 1, ...req.body };
    tasks.push(newTask); 
    res.status(201).json(newTask);
});

router.put('/:id',(req, res) => {
    const tID = req.params.id;
    const task = tasks.find(t => t.id == tID);
    
    if (!task){
        return res.status(404).json({ error: 'Task not found' });
    }

    task.title = req.body.title || task.title;
    task.status = req.body.status || task.status;
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