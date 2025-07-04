const { User } = require('./User');
const { Op } = require('sequelize');
const { normalizeRole } = require('../utils/normalize');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'User with that email does not exist.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + 60 * 60 * 1000;

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:4137';
    const resetLink = `${CLIENT_URL}/reset-password/${token}`;

    console.log(`Password reset link for ${email}: ${resetLink}`);

    res.json({ message: 'Password reset link has been sent to your email.' });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetToken = null;
    user.resetTokenExpiry = null;

    await user.save();

    return res.json({ message: 'Password reset successful. Please log in.' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};



exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
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

    const { id, name: createdName, role: createdRole } = user;
    res.status(201).json({ id, name: createdName, role: createdRole });
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      const errors = err.errors.map(e => e.message);
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

    const token = jwt.sign(
      { id: user.id },  
      JWT_SECRET,               
      { expiresIn: '1h' }      
    );

   return res.status(201).json({
      message: 'User registered successfully',
      userId: user.id,
      token,           
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

exports. login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    console.log(user);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { userId: user.id },  
      JWT_SECRET,               
      { expiresIn: '1h' }      
    );

    // localStorage.setItem('token',token);

    res.json({ 
      message: 'Login successful', 
      token,              
      userId: user.id    
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
      ...(password && { password })
    });

    const { id, name: updatedName, role: updatedRole } = user;
    res.json({ id, name: updatedName, role: updatedRole });
  } catch (err) {
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      const errors = err.errors.map(e => e.message);
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
