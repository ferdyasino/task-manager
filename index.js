require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');

const apiRoutes = require('./routes/apiRoutes');
require('./tasks/TaskModel'); // initialize model
require('./users/UserModel'); // initialize model

const app = express();
const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database authenticated');

    await sequelize.sync();
    console.log('✅ Models synced');

    app.use(express.json());
    app.use('/api', apiRoutes);

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ App initialization failed:', err);
    process.exit(1);
  }
})();
