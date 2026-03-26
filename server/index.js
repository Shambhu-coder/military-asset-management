const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

connectDB();

app.use(cors({
  origin: '*',
  credentials: false,
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Military Asset Management API is running!' });
});

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/assets',     require('./routes/assets'));
app.use('/api/transfers',  require('./routes/transfers'));
app.use('/api/assignment', require('./routes/assignment'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});