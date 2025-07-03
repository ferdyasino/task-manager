const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function (req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided. Please log in first.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    req.user = { id: decoded.userId };

    console.log('Decoded user:', decoded);  // Ensure userId is correctly set

    next();
  } catch (err) {
    console.error('❌ Invalid token:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
};
