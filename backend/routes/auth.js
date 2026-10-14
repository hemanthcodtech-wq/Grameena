const router = require('express').Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { transporter, sendOTPEmail, sendOrderEmailToAdmin, sendOrderEmailToCustomer } = require('../utils/email');
const { authMiddleware } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, phone, password, country } = req.body;
  if (!name || !email || !phone || !password)
    return res.status(400).json({ error: 'All fields are required' });
  try {
    const existing = await pool.query('SELECT id, is_verified FROM users WHERE email=$1', [email]);
    if (existing.rows.length && existing.rows[0].is_verified)
      return res.status(409).json({ error: 'Email already registered' });
    const phoneExists = await pool.query('SELECT id FROM users WHERE phone=$1 AND is_verified=true AND email!=$2', [phone, email]);
    if (phoneExists.rows.length)
      return res.status(409).json({ error: 'Phone number already registered' });
    const hash = await bcrypt.hash(password, 10);
    if (existing.rows.length) {
      await pool.query('UPDATE users SET name=$1, phone=$2, password_hash=$3, country=$5, phone_verified=FALSE, email_verified=FALSE WHERE email=$4', [name, phone, hash, email, country || null]);
    } else {
      await pool.query('INSERT INTO users (name, email, phone, password_hash, country, phone_verified, email_verified) VALUES ($1,$2,$3,$4,$5,FALSE,FALSE)', [name, email, phone, hash, country || null]);
    }
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await pool.query('DELETE FROM otps WHERE email=$1 AND type=$2', [email, 'email']);
    await pool.query('INSERT INTO otps (email, otp, expires_at, type) VALUES ($1,$2,$3,$4)', [email, otp, expiresAt, 'email']);
    await sendOTPEmail(email, otp, name);
    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });
  try {
    const result = await pool.query(
      "SELECT * FROM otps WHERE email=$1 AND otp=$2 AND type='email' AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [email, otp]
    );
    if (!result.rows.length) return res.status(400).json({ error: 'Invalid or expired OTP' });
    await pool.query('UPDATE users SET is_verified=TRUE, email_verified=TRUE WHERE email=$1', [email]);
    await pool.query('DELETE FROM otps WHERE email=$1', [email]);
    const user = await pool.query('SELECT id, name, email, phone, role FROM users WHERE email=$1', [email]);
    const u = user.rows[0];
    const token = jwt.sign({ id: u.id, email, role: u.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: u });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  try {
    const user = await pool.query('SELECT name FROM users WHERE email=$1', [email]);
    if (!user.rows.length) return res.status(404).json({ error: 'Account not found' });
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await pool.query('DELETE FROM otps WHERE email=$1 AND type=$2', [email, 'email']);
    await pool.query('INSERT INTO otps (email, otp, expires_at, type) VALUES ($1,$2,$3,$4)', [email, otp, expiresAt, 'email']);
    await sendOTPEmail(email, otp, user.rows[0].name);
    res.json({ message: 'OTP resent' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/send-login-otp
router.post('/send-login-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email address is required' });
  const cleanEmail = email.toLowerCase().trim();

  try {
    const userRes = await pool.query('SELECT id, name, is_blocked FROM users WHERE LOWER(email)=$1', [cleanEmail]);
    if (!userRes.rows.length) {
      return res.status(404).json({ 
        error: 'No account found with this email. Please sign up first.',
        notRegistered: true 
      });
    }

    const user = userRes.rows[0];
    if (user.is_blocked) {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await pool.query("DELETE FROM otps WHERE LOWER(email)=$1 AND type='email'", [cleanEmail]);
    await pool.query("INSERT INTO otps (email, otp, expires_at, type) VALUES ($1, $2, $3, 'email')", [cleanEmail, otp, expiresAt]);
    
    await sendOTPEmail(cleanEmail, otp, user.name);
    res.json({ success: true, message: 'OTP sent to ' + cleanEmail });
  } catch (err) {
    console.error('Send login OTP error:', err);
    res.status(500).json({ error: 'Failed to send OTP. Please check your email and try again.' });
  }
});

// POST /api/auth/verify-login-otp
router.post('/verify-login-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });
  const cleanEmail = email.toLowerCase().trim();

  try {
    const result = await pool.query(
      "SELECT * FROM otps WHERE LOWER(email)=$1 AND otp=$2 AND type='email' AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
      [cleanEmail, otp.trim()]
    );

    if (!result.rows.length) {
      return res.status(400).json({ error: 'Invalid or expired OTP. Please request a new code.' });
    }

    const userRes = await pool.query('SELECT * FROM users WHERE LOWER(email)=$1', [cleanEmail]);
    if (!userRes.rows.length) {
      return res.status(404).json({ error: 'Account not found. Please sign up first.' });
    }

    const user = userRes.rows[0];
    if (user.is_blocked) {
      return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    }

    // Verify user and clean up used OTP
    await pool.query("UPDATE users SET is_verified=TRUE, email_verified=TRUE WHERE id=$1", [user.id]);
    await pool.query("DELETE FROM otps WHERE LOWER(email)=$1", [cleanEmail]);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        avatar_url: user.avatar_url,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Verify login OTP error:', err);
    res.status(500).json({ error: 'Failed to verify OTP. Server error.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (!result.rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    if (user.is_blocked) return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
    if (!user.is_verified) return res.status(403).json({ error: 'Please verify your email to continue' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/google
// mode: 'signup' -> directly continues (creates if not existing, or logs in)
// mode: 'login'  -> checks if existing user is there or not; returns error if not registered
router.post('/google', async (req, res) => {
  const { credential, mode = 'login' } = req.body;
  if (!credential) return res.status(400).json({ error: 'Google credential token is required' });

  try {
    let googleData = null;

    // 1. Try decoding JWT payload using base64url format
    try {
      const parts = credential.split('.');
      if (parts.length >= 2) {
        // Replace URL-safe chars and add proper padding
        let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        const decodedStr = Buffer.from(base64, 'base64').toString('utf8');
        googleData = JSON.parse(decodedStr);
      }
    } catch (e) {
      console.warn('JWT base64url parse error, falling back to Google tokeninfo:', e.message);
    }

    // 2. If token payload parse failed or missing email, verify via Google tokeninfo API
    if (!googleData || !googleData.email) {
      try {
        const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
        const gResponse = await fetch(verifyUrl);
        if (gResponse.ok) {
          googleData = await gResponse.json();
        } else {
          // If id_token fails, try access_token endpoint
          const accessVerifyUrl = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${encodeURIComponent(credential)}`;
          const accessResponse = await fetch(accessVerifyUrl);
          if (accessResponse.ok) {
            googleData = await accessResponse.json();
          }
        }
      } catch (fetchErr) {
        console.error('Google tokeninfo fetch error:', fetchErr.message);
      }
    }

    if (!googleData || !googleData.email) {
      return res.status(400).json({ error: 'Failed to verify Google account details. Please try again.' });
    }

    const email = (googleData.email || '').toLowerCase().trim();
    const name = googleData.name || googleData.given_name || email.split('@')[0] || 'Customer';
    const avatar = googleData.picture || null;

    if (!email) {
      return res.status(400).json({ error: 'Google account has no associated email address' });
    }

    // Check if user already exists
    const userRes = await pool.query('SELECT * FROM users WHERE LOWER(email)=$1', [email]);
    let user = userRes.rows[0];

    if (mode === 'login') {
      // In login: must check if existing account is there
      if (!user) {
        return res.status(404).json({ 
          error: 'No account found with this Google email. Please sign up first.',
          notRegistered: true
        });
      }
      if (user.is_blocked) {
        return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
      }
    } else {
      // In signup: directly continue!
      if (!user) {
        const insertRes = await pool.query(
          'INSERT INTO users (name, email, avatar_url, role, is_verified, email_verified) VALUES ($1, $2, $3, $4, TRUE, TRUE) RETURNING *',
          [name, email, avatar, 'user']
        );
        user = insertRes.rows[0];
      } else {
        if (user.is_blocked) {
          return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
        }
        // Ensure verified status if logging in via Google
        if (!user.is_verified) {
          await pool.query('UPDATE users SET is_verified=TRUE, email_verified=TRUE WHERE id=$1', [user.id]);
          user.is_verified = true;
        }
      }
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        avatar_url: user.avatar_url,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ error: 'Google authentication failed: ' + (err.message || 'Server error') });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await pool.query('SELECT id, name, email, phone, country, avatar_url, role FROM users WHERE id=$1', [req.user.id]);
    if (!user.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ user: user.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await pool.query('SELECT id, name, email, phone, country, avatar_url, created_at FROM users WHERE id=$1', [req.user.id]);
    const addresses = await pool.query('SELECT * FROM addresses WHERE user_id=$1 ORDER BY is_default DESC', [req.user.id]);
    const orders = await pool.query('SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]);
    res.json({ user: user.rows[0], addresses: addresses.rows, orders: orders.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, phone, country } = req.body;
  try {
    if (phone) {
      const phoneExists = await pool.query('SELECT id FROM users WHERE phone=$1 AND is_verified=true AND id!=$2', [phone, req.user.id]);
      if (phoneExists.rows.length) return res.status(409).json({ error: 'Phone number already registered to another account' });
    }
    const result = await pool.query(
      'UPDATE users SET name=$1, phone=$2, country=$4 WHERE id=$3 RETURNING id, name, email, phone, country',
      [name, phone, req.user.id, country || null]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const result = await pool.query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, req.user.id]);
    res.json({ message: 'Password changed' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/address
router.post('/address', authMiddleware, async (req, res) => {
  const { name, line1, line2, city, state, pincode, country, mobile, is_default } = req.body;
  try {
    if (is_default) await pool.query('UPDATE addresses SET is_default=FALSE WHERE user_id=$1', [req.user.id]);
    const result = await pool.query(
      'INSERT INTO addresses (user_id, name, line1, line2, city, state, pincode, country, mobile, is_default) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *',
      [req.user.id, name, line1, line2 || null, city, state, pincode, country || null, mobile, is_default || false]
    );
    res.json({ address: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/auth/address/:id
router.put('/address/:id', authMiddleware, async (req, res) => {
  const { name, line1, line2, city, state, pincode, country, mobile, is_default } = req.body;
  try {
    if (is_default) await pool.query('UPDATE addresses SET is_default=FALSE WHERE user_id=$1', [req.user.id]);
    const result = await pool.query(
      'UPDATE addresses SET name=$1, line1=$2, line2=$3, city=$4, state=$5, pincode=$6, country=$7, mobile=$8, is_default=$9 WHERE id=$10 AND user_id=$11 RETURNING *',
      [name, line1, line2 || null, city, state, pincode, country || null, mobile, is_default || false, req.params.id, req.user.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Address not found' });
    res.json({ address: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/auth/address/:id
router.delete('/address/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM addresses WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/orders — place order (Razorpay verified)
router.post('/orders', authMiddleware, async (req, res) => {
  const { items, address, total, coupon_code, payment_method, razorpay_payment_id, razorpay_order_id, discount_amount, shipping_fee, tax_amount } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ error: 'Cart is empty' });
  try {
    for (const item of items) {
      if (!item.product?.id) continue;
      const prodRes = await pool.query('SELECT name, variants FROM products WHERE id=$1', [item.product.id]);
      if (!prodRes.rows.length) return res.status(400).json({ error: 'Product not found' });
      let variants = [];
      try { variants = typeof prodRes.rows[0].variants === 'string' ? JSON.parse(prodRes.rows[0].variants) : (prodRes.rows[0].variants || []); } catch(e) {}
      const itemSize = (item.variant?.size || '').toString().trim();
      for (const v of variants) {
        for (const s of (v.sizes || [])) {
          if (!itemSize || s.size?.toString().trim() === itemSize) {
            if (parseInt(s.stock || 0) < parseInt(item.qty || 1))
              return res.status(400).json({ error: `"${prodRes.rows[0].name}" is out of stock.`, outOfStock: true });
          }
        }
      }
    }

    const countRes = await pool.query('SELECT COUNT(*) FROM orders');
    const nextNum = parseInt(countRes.rows[0].count) + 1;
    const orderNumber = `GB-${String(nextNum).padStart(6, '0')}`;
    const pMethod = payment_method || 'prepaid';
    const advancePaid = pMethod === 'cod' ? 0 : (parseFloat(total) || 0);

    const result = await pool.query(
      `INSERT INTO orders (user_id, order_number, total, items, address, status, payment_method, advance_paid, razorpay_payment_id, razorpay_order_id, discount_amount, coupon_code, shipping_fee, tax_amount)
       VALUES ($1,$2,$3,$4,$5,'pending',$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [req.user.id, orderNumber, total, JSON.stringify(items), JSON.stringify(address || {}), pMethod, advancePaid, razorpay_payment_id || null, razorpay_order_id || null, discount_amount || 0, coupon_code || null, shipping_fee || 0, tax_amount || 0]
    );

    for (const item of items) {
      if (!item.product?.id) continue;
      const prodRes = await pool.query('SELECT variants FROM products WHERE id=$1', [item.product.id]);
      let variants = [];
      try { variants = typeof prodRes.rows[0]?.variants === 'string' ? JSON.parse(prodRes.rows[0].variants) : (prodRes.rows[0]?.variants || []); } catch(e) {}
      const itemSize = (item.variant?.size || '').toString().trim();
      for (let v of variants) {
        for (let s of (v.sizes || [])) {
          if (!itemSize || s.size?.toString().trim() === itemSize)
            s.stock = Math.max(0, parseInt(s.stock || 0) - parseInt(item.qty || 1));
        }
      }
      if (variants.length) await pool.query('UPDATE products SET variants=$1 WHERE id=$2', [JSON.stringify(variants), item.product.id]);
    }

    if (coupon_code && req.user?.id) {
      const couponRes = await pool.query('SELECT * FROM coupons WHERE code=$1', [coupon_code]);
      const coupon = couponRes.rows[0];
      if (coupon && coupon.usage_type === 'one_time') {
        await pool.query("UPDATE coupons SET used_by = array_append(COALESCE(used_by, '{}'), $1::int) WHERE id=$2", [req.user.id, coupon.id]);
      }
    }

    try {
      await sendOrderEmailToAdmin(orderNumber, total, address, items);
      await sendOrderEmailToCustomer(orderNumber, total, address, items, req.user?.email || address?.email);
    } catch(e) { console.error('Email error:', e); }

    res.json({ success: true, order: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// GET /api/auth/orders — customer's orders
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const orders = await pool.query(
      'SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ orders: orders.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/auth/orders/:id — customer order details
router.get('/orders/:id', authMiddleware, async (req, res) => {
  try {
    const order = await pool.query(
      'SELECT * FROM orders WHERE (id=$1 OR order_number=$1) AND user_id=$2',
      [req.params.id, req.user.id]
    );
    if (!order.rows.length) return res.status(404).json({ error: 'Order not found' });
    res.json({ order: order.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// GET /api/auth/my-coupons
router.get('/my-coupons', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM coupons WHERE is_active=true AND (user_id IS NULL OR user_id=$1)
       AND (expires_at IS NULL OR expires_at > NOW())
       AND (usage_type != 'one_time' OR NOT ($1::int = ANY(COALESCE(used_by, '{}'))))
       ORDER BY user_id NULLS LAST, created_at DESC`,
      [req.user.id]
    );
    res.json({ coupons: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });
  try {
    const result = await pool.query('SELECT id, name FROM users WHERE email=$1', [email]);
    if (!result.rows[0]) return res.status(404).json({ error: 'No account found with this email' });
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await pool.query('DELETE FROM otps WHERE email=$1', [email]);
    await pool.query('INSERT INTO otps (email, otp, expires_at) VALUES ($1,$2,$3)', [email, otp, expiresAt]);
    await sendOTPEmail(email, otp, result.rows[0].name);
    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ error: 'All fields required' });
  try {
    const otpRes = await pool.query('SELECT * FROM otps WHERE email=$1 AND otp=$2', [email, otp]);
    const record = otpRes.rows[0];
    if (!record) return res.status(400).json({ error: 'Invalid OTP' });
    if (new Date() > new Date(record.expires_at)) return res.status(400).json({ error: 'OTP expired' });
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash=$1 WHERE email=$2', [hash, email]);
    await pool.query('DELETE FROM otps WHERE email=$1', [email]);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;
