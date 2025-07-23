const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function authGuard(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('🔒 Missing or malformed Authorization header.');
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ Attach decoded user info (including role)
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    console.log(`✅ Authenticated | ID: ${req.user.userId} | Role: ${req.user.role}`);
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    return res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
  }
};
