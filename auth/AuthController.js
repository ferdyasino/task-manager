const User = require('../users/UserModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
  try {
    const { name, password } = req.body;

    // Find user by name
    const user = await User.findOne({ where: { name } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT payload (you can customize)
    const payload = {
      id: user.id,
      name: user.name,
      role: user.role,
    };

    // Sign token
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', {
      expiresIn: '2h',
    });

    res.json({ token, user: payload });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};
