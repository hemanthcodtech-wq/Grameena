const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://grameena-7ivj.vercel.app',
    'https://grameena.vercel.app',
    'https://grameena-alpha.vercel.app',
    'https://www.grameenabharatham.com',
    'https://grameenabharatham.com',
  ],
  credentials: true,
}));
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test DB Connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to Neon Database successfully');
  release();
});

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const productRoutes = require('./routes/products');
const paymentRoutes = require('./routes/payment');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/api/public/banners', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM banners WHERE is_active=true ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/public/settings', async (req, res) => {
  try {
    const result = await pool.query("SELECT value FROM settings WHERE key='site_settings'");
    if (result.rows.length > 0 && result.rows[0].value) {
      res.json(result.rows[0].value);
    } else {
      res.json({
        siteName: 'Grameena Bharatham',
        tagline: 'The Taste of Rural Andhra',
        email: 'sudhakar.moparru@gmail.com',
        phone: '+91 81436 80630',
        address: 'JKC Road, Guntur, Andhra Pradesh - 520006',
        facebook: '',
        instagram: 'https://www.instagram.com/grameenabharatham',
        whatsapp: 'https://wa.me/+918143680630',
        youtube: '',
        twitter: ''
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('Grameena Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
