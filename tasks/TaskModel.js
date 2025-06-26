const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { notEmpty: true }
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: {
        args: [['pending', 'in-progress', 'done']],
        msg: "Status must be 'pending', 'in-progress' or 'done'"
      }
    }
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true
    }
  }
});

module.exports = Task;
