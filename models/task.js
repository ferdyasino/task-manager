const { DataTypes } = require('sequelize'); 
const sequelize = require("../config/database");

const Task = sequelize.define('Task',{
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },    
    status: {
        type: DataTypes.STRING,
        defaultValue: 'pending',
        allowNull: false
    },
    dueDate: {
        type: DataTypes.DATEONLY
    }
}, {
        timestamps: true
});

module.exports =  Task;