const express = require('express');
const sequelize = require('./config/database');
const urlLogger = require('./middleware/logger');
const app = express();
const PORT = 3000

const taskRoutes = require('./routes/taskRoutes');
const tasks = require('./routes/tasks');

app.use(express.json());

sequelize.sync() // { force: true } to reset table
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Error syncing DB', err));

app.use(urlLogger);

app.get('/', (req, res) => {
    res.send('API is running');
});

// app.use('/api/tasks', taskRoutes);
app.use('/api/tasks', tasks);

app.listen(PORT,() =>{
    console.log(`Server running on http://localhost:${PORT}`);
});
    