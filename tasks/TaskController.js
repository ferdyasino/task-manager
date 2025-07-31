const { UniqueConstraintError, ValidationError, Op } = require('sequelize');
const Task = require('./Task');
const TaskFile = require('../taskFiles/TaskFile');
const { normalizeStatus } = require('../utils/normalize');
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

// 🔹 Helper to delete file from disk
function deleteFileFromDisk(fileUrl) {
  try {
    const fileName = path.basename(fileUrl);
    const filePath = path.join(UPLOADS_DIR, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    }
  } catch (err) {
    console.warn(`Could not delete file from disk: ${fileUrl}`, err.message);
  }
}

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
      include: [{
        model: TaskFile,
        attributes: ['id', 'filename', 'filetype', 'filesize', 'fileurl']
      }],
      order: [['createdAt', 'DESC']],
    });

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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(dueDate);

    if (selectedDate < today) {
      return res.status(400).json({ error: 'Due date cannot be in the past' });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || '',
      status: normalizeStatus(status),
      dueDate: selectedDate,
      userId: req.user.userId,
    });

    if (req.file) {
      await TaskFile.create({
        taskId: task.id,
        filename: req.file.originalname,
        filetype: req.file.mimetype,
        filesize: req.file.size,
        fileurl: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      });
    }

    const newTask = await Task.findByPk(task.id, {
      include: [{ model: TaskFile }]
    });

    return res.status(201).json({ message: 'Task created successfully', task: newTask });
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

    if (dueDate) {
      if (isNaN(Date.parse(dueDate))) {
        return res.status(400).json({ error: 'Valid due date is required' });
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(dueDate);
      const originalDateStr = task.dueDate?.toISOString().split('T')[0];
      if (dueDate !== originalDateStr && selectedDate < today) {
        return res.status(400).json({ error: 'Due date cannot be set to a past date' });
      }
    }

    await task.update({
      title: title ? title.trim() : task.title,
      description: description?.trim() ?? task.description,
      status: normalizeStatus(status) || task.status,
      dueDate: dueDate || task.dueDate,
    });

    if (req.file) {
      await TaskFile.create({
        taskId: task.id,
        filename: req.file.originalname,
        filetype: req.file.mimetype,
        filesize: req.file.size,
        fileurl: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      });
    }

    const updatedTask = await Task.findByPk(task.id, {
      include: [{ model: TaskFile }]
    });

    res.json({ message: 'Task updated successfully', task: updatedTask });
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
    const task = await Task.findByPk(req.params.id, {
      include: [{ model: TaskFile }]
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const isOwner = task.userId === req.user.userId;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own tasks' });
    }

    if (task.TaskFiles?.length) {
      await Promise.all(task.TaskFiles.map(async (file) => {
        deleteFileFromDisk(file.fileurl);
        await file.destroy();
      }));
    }

    await task.destroy();
    res.json({ message: 'Task and associated files deleted successfully' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

exports.deleteTaskFile = async (req, res) => {
  try {
    const { taskId, fileId } = req.params;
    const task = await Task.findByPk(taskId, {
      include: [{ model: TaskFile }]
    });

    if (!task) return res.status(404).json({ error: 'Task not found' });

    const isOwner = task.userId === req.user.userId;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own files' });
    }

    const file = task.TaskFiles.find(f => f.id == fileId);
    if (!file) return res.status(404).json({ error: 'File not found' });

    deleteFileFromDisk(file.fileurl);
    await file.destroy();

    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    console.error('Error deleting task file:', err);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};
