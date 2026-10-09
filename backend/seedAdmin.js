const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const seedAdmin = async () => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const email = 'admin@grameena.com';
    const name = 'Admin User';
    
    // Make sure to run migrate.js first!

    // Check if admin exists
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (res.rows.length === 0) {
      await pool.query(
        'INSERT INTO users (email, password_hash, role, name, is_verified) VALUES ($1, $2, $3, $4, TRUE)',
        [email, hashedPassword, 'admin', name]
      );
      console.log('Admin user seeded successfully. Email: admin@grameena.com, Password: admin123');
    } else {
      await pool.query('UPDATE users SET is_verified = TRUE WHERE email = $1', [email]);
      console.log('Admin user updated to be verified.');
    }
  } catch (err) {
    console.error('Error seeding admin:', err);
  } finally {
    pool.end();
  }
};

seedAdmin();
