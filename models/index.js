const { Sequelize } = require('sequelize');
const defineTaskModel = require('./Task');
const defineUserModel = require('./User');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,
  }
);

const Task = defineTaskModel(sequelize);
const User = defineUserModel(sequelize);

module.exports = { sequelize, Task, User };