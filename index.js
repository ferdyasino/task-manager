require('dotenv').config();
const express = require('express');
const os = require('os');
const sequelize = require('./config/database');

// Import models (to ensure associations and table definitions are loaded)
require('./tasks/TaskModel');
require('./users/UserModel');

// Import routes
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware to parse JSON
app.use(express.json());

// Mount API routes
app.use('/api', apiRoutes);

// 🔥 Basic error-handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unexpected error:', err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// 🧠 Get local network IP for easier Flutter testing
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces).flat()) {
    if (iface.family === 'IPv4' && !iface.internal) {
      return iface.address;
    }
  }
  return 'localhost';
}

// 🚀 Init server
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database authenticated');

    await sequelize.sync({ alter: true }); // ⚠️ Use { force: false } or migrations in production
    console.log('✅ Models synced');

    const ip = getLocalIP();
    app.listen(PORT, () => {
      console.log(`🚀 Server running at:`);
      console.log(`   • http://localhost:${PORT}`);
      console.log(`   • http://${ip}:${PORT}  ← Use this in Flutter`);
    });
  } catch (err) {
    console.error('❌ App initialization failed:', err);
    process.exit(1);
  }
})();
