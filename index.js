require('dotenv').config();
const express = require('express');
const cors = require('cors');

const initSequelize = require('./config/database');
const { setSequelizeInstance } = require('./config/sequelizeInstance');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());


const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

(async () => {
  try {
    const sequelize = await initSequelize();
    setSequelizeInstance(sequelize);

    // Import models
    const User = require('./users/User');
    const Task = require('./tasks/Task');
    const TaskFile = require('./taskFiles/TaskFile');

    // Define associations here
    User.hasMany(Task, { foreignKey: 'userId', onDelete: 'CASCADE' });
    Task.belongsTo(User, { foreignKey: 'userId' });

    Task.hasMany(TaskFile, { foreignKey: 'taskId', onDelete: 'CASCADE' });
    TaskFile.belongsTo(Task, { foreignKey: 'taskId' });

    // Sync DB
    await sequelize.sync();
    console.log('✅ Models synced successfully');

    // Routes
    app.use('/api', require('./routes/apiRoutes'));

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ App initialization failed:', err.message);
    process.exit(1);
  }
})();
