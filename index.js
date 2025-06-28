require('dotenv').config();
const express = require('express');
const os = require('os');
const initSequelize = require('./config/database');
const { setSequelizeInstance } = require('./config/sequelizeInstance');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

let apiRoutes; // ❗ Declare but don't require yet

app.use((err, req, res, next) => {
  console.error('❌ Unexpected error:', err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces).flat()) {
    if (iface.family === 'IPv4' && !iface.internal) {
      return iface.address;
    }
  }
  return 'localhost';
}

(async () => {
  try {
    const sequelize = await initSequelize();
    setSequelizeInstance(sequelize);

    require('./tasks/TaskModel');
    require('./users/UserModel');

    // 🔁 Load routes AFTER models
    apiRoutes = require('./routes/apiRoutes');
    app.use('/api', apiRoutes);

    await sequelize.sync({ alter: true });
    console.log('✅ Models synced');

    const ip = getLocalIP();
    app.listen(PORT, () => {
      console.log(`🚀 Server running at:`);
      console.log(`   • http://localhost:${PORT}`);
      console.log(`   • http://${ip}:${PORT}  ← Use this in Flutter`);
    });
  } catch (err) {
    console.error('❌ App initialization failed:', err.message);
    process.exit(1);
  }
})();
