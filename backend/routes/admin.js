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
    const result = await pool.query(`
      SELECT 
        u.id, u.email, u.role, u.name, u.phone, u.created_at, 
        COALESCE(u.is_blocked, FALSE) as is_blocked,
        COUNT(o.id)::int as order_count,
        COALESCE(SUM(o.total), 0)::float as total_spent
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id AND o.status != 'cancelled'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id/role', authMiddleware, adminOnly, async (req, res) => {
  const { role } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET role=$1 WHERE id=$2 RETURNING id, email, role',
      [role, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id/block', authMiddleware, adminOnly, async (req, res) => {
  const { is_blocked } = req.body;
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'You cannot block your own account' });
  }
  try {
    const result = await pool.query(
      'UPDATE users SET is_blocked=$1 WHERE id=$2 RETURNING id, email, is_blocked',
      [is_blocked, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', authMiddleware, adminOnly, async (req, res) => {
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }
  try {
    // Check if user has orders
    const ordersRes = await pool.query('SELECT COUNT(*) FROM orders WHERE user_id=$1', [req.params.id]);
    if (parseInt(ordersRes.rows[0].count) > 0) {
      // Disassociate or keep orders record clean before user removal
      await pool.query('UPDATE orders SET user_id=NULL WHERE user_id=$1', [req.params.id]);
    }
    await pool.query('DELETE FROM addresses WHERE user_id=$1', [req.params.id]);
    await pool.query('DELETE FROM otps WHERE email=(SELECT email FROM users WHERE id=$1)', [req.params.id]);
    await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete customer error:', err);
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
  const { category_id, name, description, price, stock, image_url, images, variants, subcategory, ingredients, precautions, storage, mrp, is_trending, is_bestseller, is_festive, is_offer, allow_reviews, reviews } = req.body;
  try {
    const variantsJson = JSON.stringify(variants || []);
    const imagesJson = JSON.stringify(images || (image_url ? [image_url] : []));
    const reviewsJson = JSON.stringify(reviews || []);
    const finalImageUrl = image_url || (Array.isArray(images) && images.length > 0 ? images[0] : null);

    // Look up category name if category_id provided
    let categoryName = null;
    if (category_id) {
      const catRes = await pool.query('SELECT name FROM categories WHERE id=$1', [category_id]);
      if (catRes.rows.length > 0) categoryName = catRes.rows[0].name;
    }

    const result = await pool.query(
      'INSERT INTO products (category_id, category, name, description, price, stock, image_url, images, variants, sizes, subcategory, ingredients, precautions, storage, mrp, is_trending, is_bestseller, is_festive, is_offer, allow_reviews, reviews) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) RETURNING *',
      [category_id ? parseInt(category_id) : null, categoryName, name, description, price || 0, stock || 0, finalImageUrl, imagesJson, variantsJson, variantsJson, subcategory, ingredients, precautions, storage, mrp || null, !!is_trending, !!is_bestseller, !!is_festive, !!is_offer, allow_reviews !== undefined ? !!allow_reviews : true, reviewsJson]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/products/:id', authMiddleware, adminOnly, async (req, res) => {
  const { category_id, name, description, price, stock, image_url, images, variants, subcategory, ingredients, precautions, storage, mrp, is_trending, is_bestseller, is_festive, is_offer, allow_reviews, reviews } = req.body;
  try {
    const variantsJson = JSON.stringify(variants || []);
    const imagesJson = JSON.stringify(images || (image_url ? [image_url] : []));
    const reviewsJson = JSON.stringify(reviews || []);
    const finalImageUrl = image_url || (Array.isArray(images) && images.length > 0 ? images[0] : null);

    let categoryName = null;
    if (category_id) {
      const catRes = await pool.query('SELECT name FROM categories WHERE id=$1', [category_id]);
      if (catRes.rows.length > 0) categoryName = catRes.rows[0].name;
    }

    const result = await pool.query(
      'UPDATE products SET category_id=$1, category=COALESCE($2, category), name=$3, description=$4, price=$5, stock=$6, image_url=$7, images=$8, variants=$9, sizes=$10, subcategory=$11, ingredients=$12, precautions=$13, storage=$14, mrp=$15, is_trending=$16, is_bestseller=$17, is_festive=$18, is_offer=$19, allow_reviews=$20, reviews=$21, updated_at=NOW() WHERE id=$22 RETURNING *',
      [category_id ? parseInt(category_id) : null, categoryName, name, description, price || 0, stock || 0, finalImageUrl, imagesJson, variantsJson, variantsJson, subcategory, ingredients, precautions, storage, mrp || null, !!is_trending, !!is_bestseller, !!is_festive, !!is_offer, allow_reviews !== undefined ? !!allow_reviews : true, reviewsJson, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/products/:id/toggle', authMiddleware, adminOnly, async (req, res) => {
  const { field, value } = req.body;
  const allowedFields = ['is_active', 'is_bestseller', 'is_trending', 'is_offer', 'is_festive', 'allow_reviews'];
  
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
      'UPDATE orders SET status=$1 WHERE id=$2 RETURNING *',
      [status, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update order status error:', err);
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
    const result = await pool.query(`
      SELECT c.*, u.name as customer_name, u.email as customer_email 
      FROM coupons c 
      LEFT JOIN users u ON c.user_id = u.id 
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/coupons', authMiddleware, adminOnly, async (req, res) => {
  const {
    code,
    discount_percentage,
    min_purchase,
    max_discount,
    valid_until,
    is_active,
    user_id,
    applicable_categories,
    applicable_products
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO coupons (
        code, 
        discount_percentage, 
        discount_value,
        discount_type,
        min_purchase, 
        min_order_value,
        max_discount, 
        valid_until, 
        expires_at,
        is_active,
        user_id,
        applicable_categories,
        applicable_products,
        applicable_product_codes
      ) VALUES ($1, $2, $2, 'percentage', $3, $3, $4, $5, $5, $6, $7, $8, $9, $9) RETURNING *`,
      [
        code.toUpperCase().trim(),
        discount_percentage || 0,
        min_purchase || 0,
        max_discount || null,
        valid_until || null,
        is_active !== false,
        user_id ? parseInt(user_id) : null,
        applicable_categories && applicable_categories.length > 0 ? JSON.stringify(applicable_categories) : null,
        applicable_products && applicable_products.length > 0 ? JSON.stringify(applicable_products) : null
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/coupons/:id', authMiddleware, adminOnly, async (req, res) => {
  const {
    code,
    discount_percentage,
    min_purchase,
    max_discount,
    valid_until,
    is_active,
    user_id,
    applicable_categories,
    applicable_products
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE coupons SET 
        code = $1, 
        discount_percentage = $2, 
        discount_value = $2,
        min_purchase = $3, 
        min_order_value = $3,
        max_discount = $4, 
        valid_until = $5, 
        expires_at = $5,
        is_active = $6,
        user_id = $7,
        applicable_categories = $8,
        applicable_products = $9,
        applicable_product_codes = $9
      WHERE id = $10 RETURNING *`,
      [
        code.toUpperCase().trim(),
        discount_percentage || 0,
        min_purchase || 0,
        max_discount || null,
        valid_until || null,
        is_active !== false,
        user_id ? parseInt(user_id) : null,
        applicable_categories && applicable_categories.length > 0 ? JSON.stringify(applicable_categories) : null,
        applicable_products && applicable_products.length > 0 ? JSON.stringify(applicable_products) : null,
        req.params.id
      ]
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
  const { title, discount_percentage, is_active, applicable_categories, applicable_products, description, valid_until } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO offers (
        title, 
        discount_percentage, 
        is_active, 
        applicable_categories, 
        applicable_products, 
        description, 
        valid_until
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        title.trim(),
        discount_percentage || 0,
        is_active !== false,
        applicable_categories && applicable_categories.length > 0 ? JSON.stringify(applicable_categories) : null,
        applicable_products && applicable_products.length > 0 ? JSON.stringify(applicable_products) : null,
        description || null,
        valid_until || null
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/offers/:id', authMiddleware, adminOnly, async (req, res) => {
  const { title, discount_percentage, is_active, applicable_categories, applicable_products, description, valid_until } = req.body;
  try {
    const result = await pool.query(
      `UPDATE offers SET 
        title = $1, 
        discount_percentage = $2, 
        is_active = $3, 
        applicable_categories = $4, 
        applicable_products = $5, 
        description = $6, 
        valid_until = $7 
      WHERE id = $8 RETURNING *`,
      [
        title.trim(),
        discount_percentage || 0,
        is_active !== false,
        applicable_categories && applicable_categories.length > 0 ? JSON.stringify(applicable_categories) : null,
        applicable_products && applicable_products.length > 0 ? JSON.stringify(applicable_products) : null,
        description || null,
        valid_until || null,
        req.params.id
      ]
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

// Store Settings & Scroller Customization
router.get('/settings', authMiddleware, adminOnly, async (req, res) => {
  try {
    const result = await pool.query("SELECT value FROM settings WHERE key='site_settings'");
    if (result.rows.length > 0) {
      res.json(result.rows[0].value);
    } else {
      res.json({});
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/settings', authMiddleware, adminOnly, async (req, res) => {
  try {
    const settingsJson = JSON.stringify(req.body);
    const existing = await pool.query("SELECT key FROM settings WHERE key='site_settings'");
    if (existing.rows.length > 0) {
      await pool.query("UPDATE settings SET value=$1, updated_at=NOW() WHERE key='site_settings'", [settingsJson]);
    } else {
      await pool.query("INSERT INTO settings (key, value, updated_at) VALUES ('site_settings', $1, NOW())", [settingsJson]);
    }
    res.json({ success: true, settings: req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
