const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Dashboard Stats
router.get('/dashboard-stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const ordersRes = await pool.query('SELECT COUNT(*) FROM orders');
    const productsRes = await pool.query('SELECT COUNT(*) FROM products');
    const usersRes = await pool.query('SELECT COUNT(*) FROM users');
    const revenueRes = await pool.query("SELECT SUM(total) FROM orders WHERE status != 'cancelled'");

    res.json({
      totalOrders: parseInt(ordersRes.rows[0].count),
      totalProducts: parseInt(productsRes.rows[0].count),
      totalUsers: parseInt(usersRes.rows[0].count),
      totalRevenue: revenueRes.rows[0].sum || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Users
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, role, name, phone, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id/role', authMiddleware, adminOnly, async (req, res) => {
  const { role } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET role=$1, updated_at=NOW() WHERE id=$2 RETURNING id, email, role',
      [role, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Categories
router.get('/categories', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/categories', authMiddleware, adminOnly, async (req, res) => {
  const { name, image_url, description, subcategories } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO categories (name, image_url, description, subcategories) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, image_url, description, JSON.stringify(subcategories || [])]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/categories/:id', authMiddleware, adminOnly, async (req, res) => {
  const { name, image_url, description, subcategories } = req.body;
  try {
    const result = await pool.query(
      'UPDATE categories SET name=$1, image_url=$2, description=$3, subcategories=$4, updated_at=NOW() WHERE id=$5 RETURNING *',
      [name, image_url, description, JSON.stringify(subcategories || []), req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/categories/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Products
router.get('/products', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/products', authMiddleware, adminOnly, async (req, res) => {
  const { category_id, name, description, price, stock, image_url, variants, subcategory, ingredients, precautions, storage } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO products (category_id, name, description, price, stock, image_url, variants, subcategory, ingredients, precautions, storage) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [category_id, name, description, price, stock, image_url, JSON.stringify(variants || []), subcategory, ingredients, precautions, storage]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/products/:id', authMiddleware, adminOnly, async (req, res) => {
  const { category_id, name, description, price, stock, image_url, variants, subcategory, ingredients, precautions, storage } = req.body;
  try {
    const result = await pool.query(
      'UPDATE products SET category_id=$1, name=$2, description=$3, price=$4, stock=$5, image_url=$6, variants=$7, subcategory=$8, ingredients=$9, precautions=$10, storage=$11, updated_at=NOW() WHERE id=$12 RETURNING *',
      [category_id, name, description, price, stock, image_url, JSON.stringify(variants || []), subcategory, ingredients, precautions, storage, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/products/:id/toggle', authMiddleware, adminOnly, async (req, res) => {
  const { field, value } = req.body;
  const allowedFields = ['is_active', 'is_bestseller', 'is_trending', 'is_offer', 'is_festive'];
  
  if (!allowedFields.includes(field)) {
    return res.status(400).json({ error: 'Invalid field for toggle' });
  }

  try {
    const result = await pool.query(
      `UPDATE products SET ${field}=$1 WHERE id=$2 RETURNING *`,
      [value, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/products/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Orders
router.get('/orders', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, u.email as user_email, u.name as user_name 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/orders/:id/status', authMiddleware, adminOnly, async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/orders/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
      await pool.query('DELETE FROM orders WHERE id=$1', [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
// Banners
router.get('/banners', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM banners ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/banners', authMiddleware, adminOnly, async (req, res) => {
  const { title, image_url, link_url, is_active, heading, sub_content } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO banners (title, image_url, link_url, is_active, heading, sub_content) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, image_url, link_url, is_active !== false, heading, sub_content]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/banners/:id', authMiddleware, adminOnly, async (req, res) => {
  const { title, image_url, link_url, is_active, heading, sub_content } = req.body;
  try {
    const result = await pool.query(
      'UPDATE banners SET title=$1, image_url=$2, link_url=$3, is_active=$4, heading=$5, sub_content=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
      [title, image_url, link_url, is_active, heading, sub_content, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/banners/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM banners WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Coupons
router.get('/coupons', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/coupons', authMiddleware, adminOnly, async (req, res) => {
  const { code, discount_percentage, min_purchase, max_discount, valid_until, is_active } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO coupons (code, discount_percentage, min_purchase, max_discount, valid_until, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [code, discount_percentage, min_purchase, max_discount, valid_until, is_active !== false]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/coupons/:id', authMiddleware, adminOnly, async (req, res) => {
  const { code, discount_percentage, min_purchase, max_discount, valid_until, is_active } = req.body;
  try {
    const result = await pool.query(
      'UPDATE coupons SET code=$1, discount_percentage=$2, min_purchase=$3, max_discount=$4, valid_until=$5, is_active=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
      [code, discount_percentage, min_purchase, max_discount, valid_until, is_active, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/coupons/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM coupons WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Offers
router.get('/offers', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM offers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/offers', authMiddleware, adminOnly, async (req, res) => {
  const { title, discount_percentage, is_active } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO offers (title, discount_percentage, is_active) VALUES ($1, $2, $3) RETURNING *',
      [title, discount_percentage, is_active !== false]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/offers/:id', authMiddleware, adminOnly, async (req, res) => {
  const { title, discount_percentage, is_active } = req.body;
  try {
    const result = await pool.query(
      'UPDATE offers SET title=$1, discount_percentage=$2, is_active=$3, created_at=NOW() WHERE id=$4 RETURNING *',
      [title, discount_percentage, is_active, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/offers/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM offers WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
