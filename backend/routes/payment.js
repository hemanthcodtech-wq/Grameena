const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.get('/get-key', (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
});

router.post('/create-order', async (req, res) => {
  const { amount, currency = 'INR', items, address } = req.body;
  try {
    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit
      currency,
      receipt: `receipt_order_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    
    // Create pending order in DB
    const dbOrder = await pool.query(
      'INSERT INTO orders (order_number, total, items, address, status, razorpay_order_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [`ORD-${Date.now()}`, amount, JSON.stringify(items), JSON.stringify(address), 'pending', order.id]
    );

    res.json({ ...order, db_order_id: dbOrder.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;
  try {
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment is successful, update order in db
      await pool.query(
        "UPDATE orders SET payment_method='razorpay', status='processing', razorpay_payment_id=$1, updated_at=NOW() WHERE id=$2",
        [razorpay_payment_id, order_id]
      );
      return res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid signature sent!' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
