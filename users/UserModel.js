// users/UserModel.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { getSequelizeInstance } = require('../config/sequelizeInstance');

const sequelize = getSequelizeInstance();

const User = sequelize.define(
  'User',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Name is required' },
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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password is required' },
        len: {
          args: [6, 100],
          msg: 'Password must be at least 6 characters long',
        },
      },
    },
  },
  {
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

// Method to validate password
User.prototype.isValidPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = User;
