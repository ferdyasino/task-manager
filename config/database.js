const { Sequelize } = require('sequelize');

// Factory function to create Sequelize instance from given config
const createSequelizeInstance = ({
  host,
  port,
  database,
  username,
  password,
  dialect,
}) => {
  return new Sequelize(database, username, password, {
    host,
    port,
    dialect,
    logging: false,
  });
};

module.exports = async () => {
  const remoteConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    dialect: process.env.DB_DIALECT || 'mysql',
  };

  const localConfig = {
    host: process.env.LOCAL_DB_HOST || 'localhost',
    port: process.env.LOCAL_DB_PORT || 3306,
    database: process.env.LOCAL_DB_NAME,
    username: process.env.LOCAL_DB_USER,
    password: process.env.LOCAL_DB_PASS,
    dialect: process.env.LOCAL_DB_DIALECT || 'mysql',
  };

  let sequelize = createSequelizeInstance(remoteConfig);
  try {
    await sequelize.authenticate();
    console.log(`✅ Connected to remote DB at ${remoteConfig.host}`);
    return sequelize;
  } catch (error) {
    console.warn(`⚠️ Remote DB unreachable: ${error.message}`);
    console.log(`🔁 Trying local fallback DB at ${localConfig.host}`);

    sequelize = createSequelizeInstance(localConfig);
    try {
      await sequelize.authenticate();
      console.log(`✅ Connected to local fallback DB at ${localConfig.host}`);
      return sequelize;
    } catch (err) {
      console.error('❌ Both remote and local database connections failed:', err.message);
      throw err;
    }
  }
};
