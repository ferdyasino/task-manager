const { User } = require('../models');
const { normalizeRole } = require('../utils/normalize');
const { UniqueConstraintError } = require('sequelize');

exports.getAllUsers = async (req, res) => {
  const users = await User.findAll();
  res.json(users);
};

exports.createUser = async (req, res) => {
  const { name, birthDate, role } = req.body;
  if (!name || !birthDate) return res.status(400).json({ error: 'Name & Birthdate required.' });

  const existing = await User.findOne({ where: { name } });
  if (existing) return res.status(400).json({ error: 'Name already taken.' });

  const normalizedRole = normalizeRole(role);
  if (role && !normalizedRole) return res.status(400).json({ error: "Invalid role." });

  try {
    const user = await User.create({ name, birthDate, role: normalizedRole || 'user' });
    res.status(201).json(user);
  } catch (err) {
    if (err instanceof UniqueConstraintError) return res.status(400).json({ error: 'Name must be unique.' });
    if (err.name === 'SequelizeValidationError') return res.status(400).json({ error: err.errors.map(e => e.message) });
    throw err;
  }
};

exports.updateUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { name, birthDate, role } = req.body;

  if (name) user.name = name;
  if (birthDate) user.birthDate = birthDate;
  if (role) {
    const normalized = normalizeRole(role);
    if (!normalized) return res.status(400).json({ error: 'Invalid role.' });
    user.role = normalized;
  }

  await user.save();
  res.json(user);
};

exports.deleteUser = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  await user.destroy();
  res.json({ message: 'User deleted', user });
};
