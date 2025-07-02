const { User } = require('../users/UserModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

// ✅ Register Controller
exports.register = async (req, res) => {
  const { name, birthDate, email, password, role } = req.body;

  try {
    // Check if email already exists
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({ 
      name, 
      birthDate, 
      email, 
      password: hashedPassword, 
      role 
    });

    // Create token
    const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, {
      expiresIn: '1h',
    });

    // Set cookie (optional for UI)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure cookie in production
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    // Respond with token and user info
    res.status(201).json({
      message: 'User registered',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// ✅ Login Controller
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'User with this email does not exist' });
    }

    // Check password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    // Generate token
    const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, {
      expiresIn: '1h',
    });

    // Set cookie for browser
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    // Respond with token and user info
    res.status(200).json({
      message: 'Login successful',
      token, // You can choose to send the token in the response body as well
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};
