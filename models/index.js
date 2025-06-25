// models/index.js
const initSequelize = require('../config/database');
const defineTaskModel = require('./Task');
const defineUserModel = require('./User');

let Task, User, sequelize;

async function initModels() {
  sequelize = await initSequelize(); // ✅ Await the Sequelize instance

  Task = defineTaskModel(sequelize);
  User = defineUserModel(sequelize);

  await sequelize.sync(); // Optional: { alter: true } in dev
  return { sequelize, Task, User };
}

module.exports = initModels;
