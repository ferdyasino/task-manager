require('dotenv').config();
const express = require('express');
const initSequelize = require('./config/database');
// const initModels = require('./models');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

(async () => {
  try {
    const sequelize = await initSequelize(); // ✅ Await the instance
    await sequelize.authenticate();
    console.log('✅ Database authenticated');

    await sequelize.sync(); // Optional: sync schema
    console.log('✅ Models synced');

    app.use(express.json());

    // Wait for routes to load (they might depend on models being initialized)
    const routes = await apiRoutes;
    app.use('/api', routes);

    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('❌ App initialization failed:', err);
    process.exit(1);
  }
})();
