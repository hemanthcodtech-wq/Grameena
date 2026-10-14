const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'your_razorpay_key_id') {
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

router.get('/get-key', (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID || '' });
});

router.post('/validate-coupon', async (req, res) => {
  const { code, cartTotal = 0, userId = null, items = [] } = req.body;
  if (!code) {
    return res.status(400).json({ valid: false, message: 'Please provide a coupon code' });
  }

  try {
    const couponRes = await pool.query(
      'SELECT * FROM coupons WHERE UPPER(code) = UPPER($1) AND is_active = true',
      [code.trim()]
    );

    if (couponRes.rows.length === 0) {
      return res.status(400).json({ valid: false, message: 'Invalid or inactive coupon code' });
    }

    const coupon = couponRes.rows[0];

    // Check expiration if set
    const expiry = coupon.valid_until || coupon.expires_at;
    if (expiry && new Date(expiry) < new Date()) {
      return res.status(400).json({ valid: false, message: 'This coupon has expired' });
    }

    // Check customer restriction if set
    if (coupon.user_id) {
      if (!userId) {
        return res.status(400).json({
          valid: false,
          message: 'Please log in to your account to use this exclusive coupon'
        });
      }
      if (parseInt(coupon.user_id) !== parseInt(userId)) {
        return res.status(400).json({
          valid: false,
          message: 'This coupon is exclusive to another customer account'
        });
      }
    }

    // Check one_time usage
    if (coupon.usage_type === 'one_time' && userId && Array.isArray(coupon.used_by) && coupon.used_by.includes(parseInt(userId))) {
      return res.status(400).json({ valid: false, message: 'You have already used this coupon' });
    }

    // Parse applicable categories and products
    let applicableCategories = [];
    if (coupon.applicable_categories) {
      applicableCategories = typeof coupon.applicable_categories === 'string'
        ? JSON.parse(coupon.applicable_categories)
        : coupon.applicable_categories;
    }

    let applicableProducts = [];
    const rawProds = coupon.applicable_products || coupon.applicable_product_codes;
    if (rawProds) {
      applicableProducts = typeof rawProds === 'string'
        ? JSON.parse(rawProds)
        : rawProds;
    }

    // Standardize filters (strings / IDs in lowercase)
    const catFilters = (Array.isArray(applicableCategories) ? applicableCategories : [])
      .map(c => String(c).trim().toLowerCase())
      .filter(Boolean);

    const prodFilters = (Array.isArray(applicableProducts) ? applicableProducts : [])
      .map(p => String(p).trim().toLowerCase())
      .filter(Boolean);

    const hasCategoryRestriction = catFilters.length > 0;
    const hasProductRestriction = prodFilters.length > 0;

    // Filter qualifying items if restrictions exist
    let qualifyingTotal = parseFloat(cartTotal);
    let qualifyingItemsCount = items.length;

    if (hasCategoryRestriction || hasProductRestriction) {
      if (!items || items.length === 0) {
        return res.status(400).json({
          valid: false,
          message: 'No items in cart to validate coupon restrictions'
        });
      }

      const qualifyingItems = items.filter(item => {
        const itemCat = String(item.category || item.product?.category || '').trim().toLowerCase();
        const itemId = String(item.product_id || item.productId || item.id || item.product?.id || '').trim().toLowerCase();
        const itemCode = String(item.product_code || item.product?.product_code || '').trim().toLowerCase();
        const itemName = String(item.name || item.product?.name || item.title || '').trim().toLowerCase();

        let matchesCat = true;
        if (hasCategoryRestriction) {
          matchesCat = catFilters.some(cat => cat === itemCat || itemCat.includes(cat) || cat.includes(itemCat));
        }

        let matchesProd = true;
        if (hasProductRestriction) {
          matchesProd = prodFilters.some(p => p === itemId || p === itemCode || p === itemName);
        }

        return matchesCat && matchesProd;
      });

      if (qualifyingItems.length === 0) {
        let restrictionMsg = 'This coupon is not applicable to any items in your cart.';
        if (hasProductRestriction && hasCategoryRestriction) {
          restrictionMsg = 'This coupon only applies to selected products within specific categories.';
        } else if (hasProductRestriction) {
          restrictionMsg = 'This coupon only applies to specific designated products.';
        } else if (hasCategoryRestriction) {
          restrictionMsg = `This coupon is only valid for products in: ${catFilters.join(', ')}.`;
        }
        return res.status(400).json({ valid: false, message: restrictionMsg });
      }

      // Calculate total value of qualifying items only
      qualifyingTotal = qualifyingItems.reduce((sum, item) => {
        const itemPrice = parseFloat(item.price || item.selectedSize?.price || item.product?.price || 0);
        const itemQty = parseInt(item.quantity || item.qty || 1);
        return sum + (itemPrice * itemQty);
      }, 0);

      qualifyingItemsCount = qualifyingItems.length;
    }

    // Check min purchase/order value against cart total or qualifying total
    const minOrder = parseFloat(coupon.min_order_value || coupon.min_purchase || 0);
    if (parseFloat(cartTotal) < minOrder) {
      return res.status(400).json({
        valid: false,
        message: `Minimum purchase of ₹${minOrder} required for this coupon`
      });
    }

    // Calculate discount amount based on qualifying items total
    let discountAmount = 0;
    const discountVal = parseFloat(coupon.discount_value || coupon.discount_percentage || 0);
    const discType = coupon.discount_type || (coupon.discount_percentage ? 'percentage' : 'fixed');

    if (discType === 'percentage') {
      discountAmount = (qualifyingTotal * discountVal) / 100;
      if (coupon.max_discount && discountAmount > parseFloat(coupon.max_discount)) {
        discountAmount = parseFloat(coupon.max_discount);
      }
    } else {
      discountAmount = Math.min(discountVal, qualifyingTotal);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;

    let restrictionBadge = '';
    if (hasCategoryRestriction && hasProductRestriction) {
      restrictionBadge = `Applied on qualifying items`;
    } else if (hasCategoryRestriction) {
      restrictionBadge = `Applied on selected categories`;
    } else if (hasProductRestriction) {
      restrictionBadge = `Applied on selected products`;
    }

    return res.json({
      valid: true,
      code: coupon.code,
      discount_type: discType,
      discount_value: discountVal,
      discount_amount: discountAmount,
      qualifying_total: qualifyingTotal,
      message: `Coupon '${coupon.code}' applied! Saved ₹${discountAmount}${restrictionBadge ? ` (${restrictionBadge})` : ''}`
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return res.status(500).json({ valid: false, message: error.message });
  }
});

router.post('/create-order', async (req, res) => {
  const { amount, currency = 'INR', items, address, couponCode = null, discountAmount = 0, shippingFee = 0, userId = null } = req.body;
  try {
    const orderNumber = `GB-${Date.now()}`;
    let razorpayOrderId = null;

    // Attempt Razorpay order creation if keys are configured
    const rzp = getRazorpayInstance();
    if (rzp) {
      try {
        const options = {
          amount: Math.round(amount * 100), // amount in paise
          currency,
          receipt: `rcpt_${Date.now()}`,
        };
        const order = await rzp.orders.create(options);
        razorpayOrderId = order.id;
      } catch (rzpErr) {
        console.error('Razorpay order creation error:', rzpErr);
        return res.status(500).json({ error: rzpErr.error?.description || rzpErr.message || 'Razorpay order creation failed' });
      }
    }

    // Create order record in DB
    const dbOrder = await pool.query(
      `INSERT INTO orders (
        order_number, total, items, address, status, razorpay_order_id, coupon_code, discount_amount, shipping_fee, user_id, payment_method, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()) RETURNING *`,
      [
        orderNumber, 
        amount, 
        JSON.stringify(items || []), 
        JSON.stringify(address || {}), 
        'pending', 
        razorpayOrderId || `DEMO-${Date.now()}`,
        couponCode,
        discountAmount,
        shippingFee,
        userId || null,
        'razorpay'
      ]
    );

    const createdOrder = dbOrder.rows[0];

    res.json({
      id: razorpayOrderId || `order_demo_${Date.now()}`,
      order_id: razorpayOrderId,
      amount: Math.round(amount * 100),
      currency,
      db_order_id: createdOrder.id,
      order_number: createdOrder.order_number,
      is_demo_mode: !razorpayOrderId
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id, is_demo_mode } = req.body;
  try {
    let isValid = false;

    if (process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_SECRET !== 'your_razorpay_key_secret' && !is_demo_mode) {
      const sign = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(sign.toString())
        .digest('hex');

      isValid = (razorpay_signature === expectedSign);
    } else {
      // In development / demo mode without live razorpay credentials
      isValid = true;
    }

    if (isValid) {
      // Payment is successful, update order in db
      const updated = await pool.query(
        "UPDATE orders SET payment_method='razorpay', status='processing', razorpay_payment_id=$1 WHERE id=$2 RETURNING *",
        [razorpay_payment_id || `PAY_${Date.now()}`, order_id]
      );
      
      const order = updated.rows[0];
      return res.json({ 
        success: true, 
        message: 'Payment verified successfully',
        order_number: order?.order_number,
        order_id: order?.id
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
