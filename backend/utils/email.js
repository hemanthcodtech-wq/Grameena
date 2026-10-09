const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const FROM = `"Grameena Bharatham" <${process.env.EMAIL_USER}>`;
const BRAND = 'Grameena Bharatham';
const BRAND_COLOR = '#2D6A4F';
const ACCENT = '#52B788';

async function sendOTPEmail(email, otp, name) {
  await transporter.sendMail({
    from: FROM, to: email,
    subject: `Verify Your Email | ${BRAND}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;border:1px solid #d8f3dc;border-radius:12px;background:#FAFAFA;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:${BRAND_COLOR};margin:0;font-family:serif;font-size:28px;">${BRAND}</h1>
          <p style="color:#666;font-size:13px;">The Taste of Rural Andhra</p>
        </div>
        <h2 style="color:${BRAND_COLOR};text-align:center;">Verify Your Email 🌿</h2>
        <p style="color:#333;font-size:15px;">Hi <strong>${name || 'Customer'}</strong>,</p>
        <p style="color:#333;font-size:15px;">Use the code below to verify your email:</p>
        <div style="text-align:center;margin:32px 0;">
          <span style="display:inline-block;padding:12px 24px;font-size:32px;font-weight:bold;color:${BRAND_COLOR};background:#fff;border:2px dashed ${ACCENT};border-radius:8px;letter-spacing:6px;">${otp}</span>
        </div>
        <p style="color:#555;font-size:14px;text-align:center;">Expires in 10 minutes.</p>
        <div style="text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid #d8f3dc;">
          <p style="font-size:14px;font-weight:bold;color:${BRAND_COLOR};">Team ${BRAND}</p>
        </div>
      </div>
    `
  });
}

async function sendOrderEmailToAdmin(orderNumber, total, address, items) {
  if (!process.env.EMAIL_USER) return;
  const itemsList = (items || []).map(i => `<li>${i.product?.name} x${i.qty} — ₹${(i.variant?.price || i.product?.price || 0) * i.qty}</li>`).join('');
  await transporter.sendMail({
    from: FROM, to: process.env.EMAIL_USER,
    subject: `New Order #${orderNumber} | ${BRAND}`,
    html: `<h2>New Order #${orderNumber}</h2><p>Total: ₹${total}</p><p>Customer: ${address?.name}</p><ul>${itemsList}</ul>`
  });
}

async function sendOrderEmailToCustomer(orderNumber, total, address, items, customerEmail, ...rest) {
  if (!customerEmail) return;
  const itemsList = (items || []).map(i => `<li>${i.product?.name} x${i.qty} — ₹${(i.variant?.price || i.product?.price || 0) * i.qty}</li>`).join('');
  await transporter.sendMail({
    from: FROM, to: customerEmail,
    subject: `Order Confirmed #${orderNumber} | ${BRAND}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;border:1px solid #d8f3dc;border-radius:12px;">
        <h1 style="color:${BRAND_COLOR};">${BRAND}</h1>
        <h2>Order Confirmed! 🎉</h2>
        <p>Hi ${address?.name}, your order <strong>#${orderNumber}</strong> has been placed.</p>
        <ul>${itemsList}</ul>
        <p><strong>Total: ₹${total}</strong></p>
        <p>Thank you for choosing ${BRAND}!</p>
      </div>
    `
  });
}

async function sendRefundEmail({ order, refundId, refundAmount, cancelType }) {
  const email = order.user_email;
  if (!email) return;
  await transporter.sendMail({
    from: FROM, to: email,
    subject: `Order Cancelled #${order.order_number || order.id} | ${BRAND}`,
    html: `<p>Your order #${order.order_number || order.id} has been cancelled. ${cancelType === 'refund' ? `Refund of ₹${refundAmount} processed. ID: ${refundId}` : 'No refund applicable.'}</p>`
  });
}

module.exports = { transporter, sendOTPEmail, sendOrderEmailToAdmin, sendOrderEmailToCustomer, sendRefundEmail };
