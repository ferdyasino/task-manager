const { User } = require('./User');
const { Op } = require('sequelize');
const { normalizeRole } = require('../utils/normalize');
const { sendPasswordResetEmail } = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Valid email is required.' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiry = Date.now() + 60 * 60 * 1000;

      user.resetToken = token;
      user.resetTokenExpiry = expiry;
      await user.save();

      await sendPasswordResetEmail(email, token);
      console.log(`🔐 Sent password reset email to ${email}`);
    }

    return res.json({
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }

    user.password = password;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    return res.json({ message: '✅ Password reset successful. Please log in.' });
  } catch (err) {
    console.error('🔴 Reset Password Error:', err);
    return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: No user ID found in token' });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.toSafeJSON());
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error while fetching profile' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    const safeUsers = users.map((u) => u.toSafeJSON());
    res.json(safeUsers);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, birthDate, role, password } = req.body;

    const user = await User.create({
      name,
      birthDate,
      role: normalizeRole(role),
      password,
    });

    res.status(201).json(user.toSafeJSON());
  } catch (err) {
    if (
      err.name === 'SequelizeValidationError' ||
      err.name === 'SequelizeUniqueConstraintError'
    ) {
      const errors = err.errors.map((e) => e.message);
      return res.status(400).json({ errors });
    }
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, birthDate, role } = req.body;

    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      birthDate,
      role: normalizeRole(role),
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.scope('withSensitive').findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const valid = await user.isValidPassword(password);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Login successful',
      token,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Failed to login user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, birthDate, role, password } = req.body;

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.update({
      name,
      birthDate,
      role: normalizeRole(role),
      ...(password && { password }),
    });

    res.json(user.toSafeJSON());
  } catch (err) {
    if (
      err.name === 'SequelizeValidationError' ||
      err.name === 'SequelizeUniqueConstraintError'
    ) {
      const errors = err.errors.map((e) => e.message);
      return res.status(400).json({ errors });
    }
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
