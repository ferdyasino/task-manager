// config/database.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

const isRemote = process.env.DB_HOST && process.env.DB_USER;
const config = {
  host: isRemote ? process.env.DB_HOST : process.env.LOCAL_DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT),
  dialect: process.env.DB_DIALECT,
  logging: false
};

const sequelize = new Sequelize(
  isRemote ? process.env.DB_NAME : process.env.LOCAL_DB_NAME,
  isRemote ? process.env.DB_USER : process.env.LOCAL_DB_USER,
  isRemote ? process.env.DB_PASS : process.env.LOCAL_DB_PASS,
  config
);

module.exports = sequelize;
