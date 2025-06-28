require('dotenv').config();
const express = require('express');
const os = require('os');
const sequelize = require('./config/database');

require('./tasks/TaskModel');
require('./users/UserModel');

const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use('/api', apiRoutes);

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
    await sequelize.authenticate();
    console.log('✅ Database authenticated');

    await sequelize.sync({ force: true }); // Use `alter` only in development!
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
