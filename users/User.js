const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  birthDate: { 
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isDate: true,
      isNotFuture(value) {
        if (new Date(value) > new Date()) {
          throw new Error('Birth date cannot be in the future.');
        }
      }
    }
  },
  role: { 
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "user",
    validate: {
      isIn: {
        args: [['administrator', 'user']],
        msg: "Role must be either 'Administrator' or 'user'."
      }
    }
  }
});

module.exports = User;
