require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use('/api', apiRoutes);

sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    return sequelize.sync();  // or sequelize.sync({ alter: true }) for dev
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('DB connection/sync error:', err);
  });
