const User = require('./UserModel');
const { normalizeRole } = require('../utils/normalize');

// GET all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// POST create user
exports.createUser = async (req, res) => {
  try {
    const { name, birthDate, role, password } = req.body;

    const user = await User.create({
      name,
      birthDate,
      role: normalizeRole(role),
      password,
    });

    const { id, name: createdName, role: createdRole } = user;
    res.status(201).json({ id, name: createdName, role: createdRole });
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      const errors = err.errors.map(e => e.message);
      return res.status(400).json({ errors });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// PUT update user
exports.updateUser = async (req, res) => {
  try {
    const { name, birthDate, role, password } = req.body;

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.update({
      name,
      birthDate,
      role: normalizeRole(role),
      ...(password && { password }) // Optional password update
    });

    const { id, name: updatedName, role: updatedRole } = user;
    res.json({ id, name: updatedName, role: updatedRole });
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      const errors = err.errors.map(e => e.message);
      return res.status(400).json({ errors });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// DELETE user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
