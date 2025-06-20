const express = require('express');
const urlLogger = require('./middleware/logger');
const app = express();
const PORT = 3000
const taskRoutes = require('./routes/taskRoutes');

app.use(express.json());

app.use(urlLogger);

app.get('/', (req, res) => {
    res.send('API is running');
});

app.use('/api/tasks', taskRoutes);

app.listen(PORT,() =>{
    console.log(`Server running on http://localhost:${PORT}`);
});
    