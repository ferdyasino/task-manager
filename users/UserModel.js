const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
    },
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      isNotFuture(value) {
        if (new Date(value) > new Date()) {
          throw new Error('Birth date cannot be in the future');
        }
      },
    },
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user',
    validate: {
      isIn: {
        args: [['user', 'administrator']],
        msg: 'Role must be either "user" or "administrator"',
      },
    },
  },
});

module.exports = User;
