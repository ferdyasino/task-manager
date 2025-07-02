// tasks/TaskModel.js
const { DataTypes } = require('sequelize');
const { getSequelizeInstance } = require('../config/sequelizeInstance');
const sequelize = getSequelizeInstance();

const Task = sequelize.define('Task', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { notEmpty: true },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: {
        args: [['pending', 'in-progress', 'done']],
        msg: "Status must be 'pending', 'in-progress' or 'done'",
      },
    },
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    validate: {
      isDate: true,
    },
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

// ✅ Associate with User
const { User } = require('../users/UserModel');
Task.belongsTo(User, { foreignKey: 'userId' });

module.exports = Task;
