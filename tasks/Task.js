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
    defaultValue: 'pending',
    allowNull: false,
    validate: {
      isIn: {
        args: [['pending', 'in-progress', 'done']],
        msg: "Status must be either 'pending', 'in-progress' or 'done'."
      }
    }
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true, // or false if you want required
    validate: {
      isDate: true,
      isNotPast(value) {
        if (value) { // only check if value is provided
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const inputDate = new Date(value);
          inputDate.setHours(0, 0, 0, 0);

          if (inputDate < today) {
            throw new Error('Due date cannot be in the past.');
          }
        }
      }
    }
  }
});

module.exports = Task;
