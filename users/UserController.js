const { User } = require('./User'); // ✅ FIXED: use named import
const { normalizeRole } = require('../utils/normalize');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'mysecret';
const bcrypt = require('bcrypt');

// ✅ GET all users (exclude password)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (err) {
    console.error('❌ Error fetching users:', err); // ✅ better debug info
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// ✅ POST create user
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
    console.error('❌ Error creating user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// ✅ POST register route with password hashing
exports.register = async (req, res) => {
  try {
    const { name, email, password, birthDate, role } = req.body;

    // Check if email is already registered
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,  // Password will be hashed in the model's beforeCreate hook
      birthDate,
      role: normalizeRole(role),
    });

    // Generate JWT token
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
    console.error('❌ Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// ✅ POST login route (fixed: only email and password needed)
exports. login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    console.log(user);

    // Compare password with hashed password in DB
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid email or password' });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },  
      JWT_SECRET,               
      { expiresIn: '1h' }      
    );

    res.json({ 
      message: 'Login successful', 
      token,                  // Include token in response
      userId: user.id         // Optionally include user info
    });
  } catch (error) {
    console.error('❌ Error during login:', error);
    res.status(500).json({ error: 'Failed to login user' });
  }
};

// ✅ PUT update user
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
    console.error('❌ Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// ✅ DELETE user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('❌ Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
