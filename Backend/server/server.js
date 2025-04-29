const express = require('express');
const cors = require('cors');
require('dotenv').config();

const usersRoutes = require('./routes/users');
const templatesRoutes = require('./routes/templates');
const exercisesRoutes = require('./routes/exercises');
const setsRoutes = require('./routes/sets');
const historyRoutes = require('./routes/history');
const promptRoutes = require('./routes/prompts');
const authRoutes = require('./routes/auth');
const imageRoutes = require('./routes/images');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', usersRoutes);
app.use('/api', templatesRoutes);
app.use('/api', exercisesRoutes);
app.use('/api', setsRoutes);
app.use('/api', historyRoutes);
app.use('/api', promptRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', imageRoutes);

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on http://localhost:${process.env.PORT || 5000}`);
});
