require('dotenv').config();
const { Sequelize } = require('sequelize');
const net = require('net');

function isHostReachable(host, port, timeout = 3000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const onError = () => {
      socket.destroy();
      resolve(false);
    };

    socket.setTimeout(timeout);
    socket.once('error', onError);
    socket.once('timeout', onError);
    socket.connect(port, host, () => {
      socket.end();
      resolve(true);
    });
  });
}

async function initializeSequelize() {
  const isRemoteAvailable = await isHostReachable(
    process.env.DB_HOST,
    parseInt(process.env.DB_PORT)
  );

  const config = {
    host: isRemoteAvailable ? process.env.DB_HOST : process.env.LOCAL_DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT),
    dialect: process.env.DB_DIALECT,
    logging: false
  };

  const sequelize = new Sequelize(
    isRemoteAvailable ? process.env.DB_NAME : process.env.LOCAL_DB_NAME,
    isRemoteAvailable ? process.env.DB_USER : process.env.LOCAL_DB_USER,
    isRemoteAvailable ? process.env.DB_PASS : process.env.LOCAL_DB_PASS,
    config
  );

  try {
    await sequelize.authenticate();
    console.log(`✅ Connected to ${isRemoteAvailable ? 'remote' : 'local'} DB (${config.host})`);
    return sequelize;
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    process.exit(1);
  }
}

module.exports = initializeSequelize;
