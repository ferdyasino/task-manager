require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const userRoutes = require('./users/userRoutes');
const taskRoutes = require('./tasks/taskRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

sequelize.sync()
  .then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('DB sync error:', err));
