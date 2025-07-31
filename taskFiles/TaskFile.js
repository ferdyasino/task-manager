const { DataTypes } = require('sequelize');
const { getSequelizeInstance } = require('../config/sequelizeInstance');
const sequelize = getSequelizeInstance();

const TaskFile = sequelize.define('TaskFile', {
  filename: { type: DataTypes.STRING, allowNull: false },
  filetype: { type: DataTypes.STRING, allowNull: false },
  filesize: { type: DataTypes.BIGINT, allowNull: false },
  fileurl: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: 'task_files',
  timestamps: true,
  updatedAt: false,
  paranoid: true,
  deletedAt: 'deletedAt'
});

module.exports = TaskFile;
