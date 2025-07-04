require('dotenv').config();

const express = require('express');
const cors = require('cors');
const os = require('os');
const initSequelize = require('./config/database');
const { setSequelizeInstance } = require('./config/sequelizeInstance');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

app.use((err, req, res, next) => {
  console.error('Unexpected error:', err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces).flat()) {
    if (iface.family === 'IPv4' && !iface.internal) return iface.address;
  }
  return 'localhost';
}

(async () => {
  try {
    const sequelize = await initSequelize();
    setSequelizeInstance(sequelize);
    
    require('./users/User');
    require('./tasks/Task');
    
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced successfully');
    
    app.use('/api', require('./routes/apiRoutes'));
    
    const ip = getLocalIP();
    app.listen(PORT, () => {
      console.log('Server running at:');
      console.log(`http://localhost:${PORT}`);
      console.log(`http://${ip}:${PORT} for LAN devices`);
    });
  } catch (err) {
    console.error('App initialization failed:', err.message);
    process.exit(1);
  }
})();
