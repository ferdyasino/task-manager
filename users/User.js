const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { getSequelizeInstance } = require('../config/sequelizeInstance');

const sequelize = getSequelizeInstance();

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
    email: {
      type: DataTypes.STRING,
      unique: {
        args: true,
        msg: 'Email address is already in use.',
      },
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Email is required' },
        isEmail: { msg: 'Must be a valid email address' },
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
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
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
    defaultScope: {
      attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry'] },
    },
    scopes: {
      withSensitive: {
        attributes: {},
      },
    },
  }
);

User.prototype.isValidPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

User.prototype.toSafeJSON = function () {
  const { password, resetToken, resetTokenExpiry, ...safeData } = this.get({ plain: true });
  return safeData;
};

module.exports = { User };
