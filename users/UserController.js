const { UniqueConstraintError } = require('sequelize');
const User = require('./User');

// GET all
exports.getAllUsers = async (req, res) => {
  const users = await User.findAll();
  res.json(users);
};

// CREATE
exports.createUser = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username & password required' });
 
const existing = await User.findOne({ where: { username } });
    if (existing) {
        return res.status(400).json({ error: 'Username already taken.' });
    }

    try {
        const user = await User.create({ username, password });
        res.status(201).json({ id: user.id, username: user.username });
    } catch (err) {
        if (err instanceof UniqueConstraintError) {
        return res.status(400).json({ error: 'Username already taken.' });
        }
        throw err;
    }

  const user = await User.create({ username, password });
  res.status(201).json(user);
};

// UPDATE
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;

  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (username !== undefined) user.username = username;
  if (password !== undefined) user.password = password;
  await user.save();

  res.json(user);
};

// DELETE
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByPk(id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  await user.destroy();
  res.json({ message: 'User deleted', user });
};
