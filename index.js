require('dotenv').config();
const express = require('express');
const os = require('os');
const path = require('path');
const cookieParser = require('cookie-parser');

const initSequelize = require('./config/database');
const { setSequelizeInstance } = require('./config/sequelizeInstance');

const app = express();
const PORT = process.env.PORT || 4000;

// 📦 Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🌐 Static Files
app.use(express.static(path.join(__dirname, 'views')));
app.use('/css', express.static(path.join(__dirname, 'views/public/css')));
app.use('/js', express.static(path.join(__dirname, 'views/public/js')));

// 🛠 HTML Pages
app.get('/', (req, res) => res.redirect('/login.html'));
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'views/login.html')));
app.get('/register.html', (req, res) => res.sendFile(path.join(__dirname, 'views/register.html')));
app.get('/tasks.html', (req, res) => res.sendFile(path.join(__dirname, 'views/tasks.html')));

// 🔐 Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Unexpected error:', err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// 🌍 Local IP Utility
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces).flat()) {
    if (iface.family === 'IPv4' && !iface.internal) return iface.address;
  }
  return 'localhost';
}

// 🚀 Async Bootstrap
(async () => {
  try {
    // 🧠 Initialize DB and set global instance
    const sequelize = await initSequelize();
    setSequelizeInstance(sequelize);

    // 📦 Load models AFTER sequelize is set
    require('./users/UserModel');
    require('./tasks/TaskModel');

    // 🔁 Sync models
    await sequelize.sync();
    console.log('✅ Models synced successfully');

    // 📥 Register routes AFTER models are loaded
    app.use('/', require('./auth/authRoutes'));
    app.use('/api', require('./routes/apiRoutes'));

    // 🔊 Start server
    const ip = getLocalIP();
    app.listen(PORT, () => {
      console.log('🚀 Server running at:');
      console.log(`   • http://localhost:${PORT}`);
      console.log(`   • http://${ip}:${PORT} ← for LAN devices`);
    });
  } catch (err) {
    console.error('❌ App initialization failed:', err.message);
    process.exit(1);
  }
})();
