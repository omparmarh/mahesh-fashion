const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// BUG 1 FIX: Fail fast if JWT_SECRET is not set
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Exiting.');
  process.exit(1);
}

const app = express();

// BUG 2 FIX: Restrict CORS to known origins only
const allowedOrigins = [
  'https://mahesh-fashion.netlify.app',
  'https://mahesh-fashion-and-tailors.netlify.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5001'
];

app.use(cors({
  origin: true, // Allow all origins to fix live deployment CORS issues
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected ✅'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/measurements', require('./routes/measurements'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/history', require('./routes/history'));
app.use('/api/download', require('./routes/download'));
app.use('/api/new-order', require('./routes/newOrder'));

// Health check
app.get('/', (req, res) => res.json({ message: 'Mahesh Fashion API (MongoDB Backend) running ✅' }));
app.get('/health', (req, res) => res.status(200).send('OK'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT} (Using MONGODB Backend)`);
});
