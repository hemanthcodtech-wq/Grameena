const pool = require('./db');

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(50),
      password_hash TEXT,
      country VARCHAR(100),
      avatar_url TEXT,
      role VARCHAR(20) DEFAULT 'user',
      is_verified BOOLEAN DEFAULT FALSE,
      email_verified BOOLEAN DEFAULT FALSE,
      phone_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS otps (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255),
      otp VARCHAR(10),
      type VARCHAR(20) DEFAULT 'email',
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS addresses (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255),
      line1 TEXT,
      line2 TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      pincode VARCHAR(20),
      country VARCHAR(100),
      mobile VARCHAR(50),
      is_default BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      models JSONB DEFAULT '[]',
      image_url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      stock INTEGER DEFAULT 0,
      sizes JSONB DEFAULT '[]',
      image_url TEXT,
      images JSONB DEFAULT '[]',
      color VARCHAR(100),
      category VARCHAR(255),
      model VARCHAR(255),
      is_active BOOLEAN DEFAULT TRUE,
      is_bestseller BOOLEAN DEFAULT FALSE,
      is_trending BOOLEAN DEFAULT FALSE,
      is_offer BOOLEAN DEFAULT FALSE,
      is_festive BOOLEAN DEFAULT FALSE,
      variants JSONB DEFAULT '[]',
      reviews JSONB DEFAULT '[]',
      details JSONB DEFAULT '[]',
      allow_reviews BOOLEAN DEFAULT TRUE,
      offer_id INTEGER,
      product_code VARCHAR(100),
      instagram_reel_url TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS offers (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255),
      discount_percentage NUMERIC(5,2),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS banners (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255),
      image_url TEXT,
      link_url TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id SERIAL PRIMARY KEY,
      code VARCHAR(100) UNIQUE NOT NULL,
      discount_type VARCHAR(20) DEFAULT 'percentage',
      discount_value NUMERIC(10,2),
      min_order_value NUMERIC(10,2) DEFAULT 0,
      min_qty INTEGER DEFAULT 0,
      min_type VARCHAR(20) DEFAULT 'amount',
      is_active BOOLEAN DEFAULT TRUE,
      expires_at TIMESTAMP,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      usage_type VARCHAR(20) DEFAULT 'multiple',
      used_by INTEGER[],
      applicable_categories JSONB DEFAULT '[]',
      applicable_product_codes JSONB DEFAULT '[]',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      order_number VARCHAR(50) UNIQUE,
      total NUMERIC(10,2),
      items JSONB,
      address JSONB,
      status VARCHAR(50) DEFAULT 'pending',
      payment_method VARCHAR(50),
      advance_paid NUMERIC(10,2) DEFAULT 0,
      order_type VARCHAR(20) DEFAULT 'shipping',
      razorpay_payment_id TEXT,
      razorpay_order_id TEXT,
      discount_amount NUMERIC(10,2) DEFAULT 0,
      coupon_code VARCHAR(100),
      shipping_fee NUMERIC(10,2) DEFAULT 0,
      tax_amount NUMERIC(10,2) DEFAULT 0,
      balance_due NUMERIC(10,2) DEFAULT 0,
      payment_link_url TEXT,
      refund_id TEXT,
      refund_amount NUMERIC(10,2) DEFAULT 0,
      refund_breakdown JSONB,
      refund_history JSONB DEFAULT '[]',
      cancelled_items_snapshot JSONB,
      cancel_type VARCHAR(50),
      edit_history JSONB DEFAULT '[]',
      tracking_id TEXT,
      tracking_link TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      rating INTEGER DEFAULT 5,
      review TEXT,
      image_url TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS settings (
      key VARCHAR(100) PRIMARY KEY,
      value JSONB,
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('Migration complete');
  process.exit(0);
}

migrate().catch(err => { console.error(err); process.exit(1); });
