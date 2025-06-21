const { UniqueConstraintError } = require('sequelize');
const User = require('./User');
const { normalizeRole } = require('../utils/normalize');

// GET all
exports.getAllUsers = async (req, res) => {
  const users = await User.findAll();
  res.json(users);
};

// CREATE
exports.createUser = async (req, res) => {
  const { name, birthDate, role } = req.body;
  if (!name || !birthDate) {
    return res.status(400).json({ error: 'Name & Birthdate required.' });
  }

  const existing = await User.findOne({ where: { name } });
  if (existing) {
    return res.status(400).json({ error: 'Name already taken.' });
  }

  const normalizedRole = normalizeRole(role);
  if (role && !normalizedRole) {
    return res.status(400).json({ error: "Invalid role. Allowed: 'administrator', 'user'." });
  }

  try {
    const user = await User.create({ 
      name, 
      birthDate,
      role: normalizedRole || 'user' // default role is 'user'
    });
    res.status(201).json({ id: user.id, name: user.name, role: user.role });
  } catch (err) {
    if (err instanceof UniqueConstraintError) {
      return res.status(400).json({ error: 'Name already taken.' });
    }
    throw err;
  }
};

// UPDATE
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, birthDate, role } = req.body;

  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (name !== undefined) user.name = name;
  if (birthDate !== undefined) user.birthDate = birthDate;

  if (role !== undefined) {
    const normalizedRole = normalizeRole(role);
    if (!normalizedRole) {
      return res.status(400).json({ error: "Invalid role. Allowed: 'administrator', 'user'." });
    }
    user.role = normalizedRole;
  }

  await user.save();
  res.json({ id: user.id, name: user.name, role: user.role });
};

// DELETE
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  await user.destroy();
  res.json({ message: 'User deleted', user: { id: user.id, name: user.name, role: user.role } });
};
