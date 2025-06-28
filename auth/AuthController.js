const { User } = require('../users/UserModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// ✅ REGISTER CONTROLLER
exports.register = async (req, res) => {
  try {
    const { name, password, birthDate, role } = req.body;

    if (!name || !password || !birthDate) {
      return res.status(400).json({ error: 'Name, password, and birthDate are required' });
    }

    const existingUser = await User.findOne({ where: { name } });
    if (existingUser) {
      return res.status(409).json({ error: 'Name already registered' });
    }

    const newUser = await User.create({
      name,
      birthDate,
      password, // ✅ Let model hash it
      role: role || 'user',
    });

    const payload = {
      id: newUser.id,
      name: newUser.name,
      role: newUser.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', {
      expiresIn: '2h',
    });

    return res.status(201).json({
      message: 'Registered successfully',
      user: payload,
      token,
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
};



// ✅ LOGIN CONTROLLER
exports.login = async (req, res) => {
  try {
    const { name, password } = req.body;

    const user = await User.findOne({ where: { name } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = {
      id: user.id,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', {
      expiresIn: '2h',
    });

    return res.json({
      message: 'Login successful',
      user: payload,
      token,
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
};
