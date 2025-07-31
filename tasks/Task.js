const { DataTypes } = require('sequelize');
const { getSequelizeInstance } = require('../config/sequelizeInstance');

const sequelize = getSequelizeInstance();

const Task = sequelize.define('Task', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false, unique: true },
  description: { type: DataTypes.TEXT },
  status: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    defaultValue: 'pending',
    validate: { isIn: [['pending', 'in-progress', 'done']] }
  },
  dueDate: { type: DataTypes.DATE, validate: { isDate: true } },
  userId: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'tasks',
  timestamps: true,
});

module.exports = Task;
