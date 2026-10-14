const nodemailer = require('nodemailer');
require('dotenv').config();

const emailPort = parseInt(process.env.EMAIL_PORT) || 465;
const isGmail = (process.env.EMAIL_HOST || '').includes('gmail') || (process.env.EMAIL_USER || '').includes('gmail');

const transporter = nodemailer.createTransport(
  isGmail
    ? {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      }
    : {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: emailPort,
        secure: emailPort === 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      }
);

const FROM = 'Grameena Bharatham <' + process.env.EMAIL_USER + '>';
const BRAND = 'Grameena Bharatham';
const BRAND_COLOR = '#2D6A4F';
const ACCENT = '#52B788';

const escapeHtml = (v) => String(v ?? '').replace(/[&<>'"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'})[m]);

async function sendOTPEmail(email, otp, name) {
  await transporter.sendMail({
    from: FROM, to: email,
    subject: 'Verify Your Email | ' + BRAND,
    html: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;border:1px solid #d8f3dc;border-radius:12px;background:#FAFAFA;"><div style="text-align:center;margin-bottom:24px;"><h1 style="color:' + BRAND_COLOR + ';margin:0;font-family:serif;font-size:28px;">' + BRAND + '</h1><p style="color:#666;font-size:13px;">The Taste of Rural Andhra</p></div><h2 style="color:' + BRAND_COLOR + ';text-align:center;">Verify Your Email</h2><p style="color:#333;font-size:15px;">Hi <strong>' + escapeHtml(name || 'Customer') + '</strong>,</p><p style="color:#333;font-size:15px;">Use the code below to verify your email:</p><div style="text-align:center;margin:32px 0;"><span style="display:inline-block;padding:12px 24px;font-size:32px;font-weight:bold;color:' + BRAND_COLOR + ';background:#fff;border:2px dashed ' + ACCENT + ';border-radius:8px;letter-spacing:6px;">' + otp + '</span></div><p style="color:#555;font-size:14px;text-align:center;">Expires in 10 minutes.</p><div style="text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid #d8f3dc;"><p style="font-size:14px;font-weight:bold;color:' + BRAND_COLOR + ';">Team ' + BRAND + '</p></div></div>'
  });
}

async function sendOrderEmailToAdmin(orderNumber, total, address, items) {
  try {
    const addr = address || {};
    const itemRows = (items || []).map(i =>
      '<tr><td style="padding:6px 8px;border-bottom:1px solid #d8f3dc">' + escapeHtml(i.product?.name || 'Item') + '</td><td style="padding:6px 8px;border-bottom:1px solid #d8f3dc;text-align:center">' + i.qty + '</td><td style="padding:6px 8px;border-bottom:1px solid #d8f3dc;text-align:right">Rs.' + ((i.variant?.price || i.product?.price || 0) * i.qty).toFixed(2) + '</td></tr>'
    ).join('');
    await transporter.sendMail({
      from: FROM, to: process.env.EMAIL_USER,
      subject: 'New Order Received - ' + orderNumber,
      html: '<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;border:1px solid #d8f3dc;border-radius:12px"><h2 style="color:' + BRAND_COLOR + '">New Order - ' + escapeHtml(orderNumber) + '</h2><p><strong>Total:</strong> Rs.' + total + '</p><p><strong>Customer:</strong> ' + escapeHtml(addr.name || '') + '</p><p>' + escapeHtml(addr.line1 || '') + ', ' + escapeHtml(addr.city || '') + '</p><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="background:#d8f3dc"><th style="padding:6px 8px;text-align:left">Product</th><th>Qty</th><th style="text-align:right">Price</th></tr></thead><tbody>' + itemRows + '</tbody></table></div>'
    });
  } catch(err) { console.error('Admin email error:', err); }
}

async function sendRefundEmail({ order, refundId, refundAmount, cancelType, cancelledItems }) {
  try {
    let address = {};
    try { address = typeof order.address === 'string' ? JSON.parse(order.address) : (order.address || {}); } catch(e) {}
    const customerEmail = order.user_email;
    const orderNum = order.order_number || order.id;
    const cancelledRows = (cancelledItems || []).map(i =>
      '<tr><td style="padding:10px;border-bottom:1px solid #d8f3dc"><strong>' + escapeHtml(i.name || 'Item') + (i.size ? ' - Size: '+i.size : '') + '</strong></td><td style="padding:10px;border-bottom:1px solid #d8f3dc;text-align:center">' + i.qty + '</td><td style="padding:10px;border-bottom:1px solid #d8f3dc;text-align:right">Rs.' + (i.price || 0).toFixed(2) + '</td></tr>'
    ).join('');
    await transporter.sendMail({
      from: FROM, to: customerEmail,
      subject: 'Order Cancelled & Refund Confirmation - #' + orderNum + ' | ' + BRAND,
      html: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;border:1px solid #d8f3dc;border-radius:12px;background:#FAFAFA;"><div style="text-align:center;margin-bottom:24px;"><h1 style="color:' + BRAND_COLOR + ';margin:0;font-family:serif;font-size:28px;">' + BRAND + '</h1><p style="color:#666;font-size:13px;">The Taste of Rural Andhra</p></div><h2 style="color:' + BRAND_COLOR + ';text-align:center;">Order Cancelled & Refund Confirmed</h2><p style="color:#333;font-size:15px;">Hi <strong>' + escapeHtml(address.name || 'Customer') + '</strong>,</p><p style="color:#333;font-size:15px;">Your order <strong>#' + escapeHtml(String(orderNum)) + '</strong> has been cancelled and your refund has been initiated.</p><table style="width:100%;border-collapse:collapse;font-size:14px;"><thead><tr style="background:#d8f3dc;"><th style="padding:10px;text-align:left">Product</th><th style="padding:10px">Qty</th><th style="padding:10px;text-align:right">Price</th></tr></thead><tbody>' + cancelledRows + '</tbody></table><div style="margin-top:20px;text-align:right;padding:16px;border:1px solid #d8f3dc;border-radius:8px;"><p style="margin:4px 0;"><strong>Refund Amount:</strong> <span style="color:#059669;font-size:16px;font-weight:bold;">Rs.' + refundAmount.toFixed(2) + '</span></p><p style="margin:4px 0;color:#555;"><strong>Transaction ID:</strong> ' + escapeHtml(refundId) + '</p></div><p style="color:#333;font-size:14px;margin-top:24px;text-align:center;">Refund will be credited within 5-7 business days.</p><div style="text-align:center;margin-top:40px;padding-top:24px;border-top:1px solid #d8f3dc;"><p style="font-size:16px;font-weight:bold;color:' + BRAND_COLOR + ';">Team ' + BRAND + '</p></div></div>'
    });
  } catch(err) { console.error('Refund email error:', err); }
}

async function sendOrderEmailToCustomer(orderNumber, total, address, items, email, grandTotal, discount, tax, shipping, fullOrderObj) {
  fullOrderObj = fullOrderObj || {};
  try {
    const orderDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    const subtotal = (items || []).reduce((sum, item) => sum + ((item.variant?.price || item.product?.price || item.price || 0) * item.qty), 0);
    const BRAND_COLOR = '#2D6A4F';
    const ACCENT = '#52B788';
    const BRAND = 'Grameena Bharatham';

    const getFullImageUrl = (url) => {
      if (!url || typeof url !== 'string' || url.startsWith('data:image')) return '';
      if (url.startsWith('http')) return url;
      if (url.startsWith('/')) return (process.env.FRONTEND_URL || 'https://grameenahbaratham.com') + url;
      return url;
    };

    // PDF invoice rows
    const rows = (items || []).map((item, idx) => {
      let imgUrl = getFullImageUrl(item.variant?.image || item.product?.images?.[0] || item.product?.image_url);
      const imgHtml = imgUrl ? '<img src="' + imgUrl + '" style="width:36px;height:36px;object-fit:cover;border-radius:4px;border:1px solid #eee;" />' : '';
      const price = Number(item.variant?.price || item.product?.price || item.price || 0);
      return '<tr style="border-bottom:1px solid #d8f3dc;">' +
        '<td style="padding:10px 12px;color:#555;font-size:9pt;text-align:center;">' + (idx+1) + '</td>' +
        '<td style="padding:10px 12px;"><div style="display:flex;align-items:center;gap:12px;">' + imgHtml +
          '<div><div style="font-weight:700;color:#1B4332;font-size:9pt;">' + escapeHtml(item.product?.name || item.name || '') + '</div>' +
          (item.variant?.size ? '<div style="font-size:8pt;color:' + ACCENT + ';margin-top:2px;">Size: ' + escapeHtml(item.variant.size) + '</div>' : '') +
          '</div></div></td>' +
        '<td style="padding:10px 12px;color:#555;font-size:9pt;text-align:center;">' + escapeHtml(item.variant?.size || '-') + '</td>' +
        '<td style="padding:10px 12px;color:#555;font-size:9pt;text-align:center;">' + item.qty + '</td>' +
        '<td style="padding:10px 12px;color:#1B4332;font-weight:600;font-size:9pt;text-align:right;">Rs.' + price.toFixed(2) + '</td>' +
        '<td style="padding:10px 12px;color:#1B4332;font-weight:700;font-size:9.5pt;text-align:right;">Rs.' + (price * item.qty).toFixed(2) + '</td>' +
      '</tr>';
    }).join('');

    const invoiceHtml = '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>Invoice #' + escapeHtml(orderNumber) + '</title>' +
      '<style>*,*::before,*::after{box-sizing:border-box;}@page{size:A4;margin:15mm 12mm 20mm 12mm;}body{font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;color:#333;margin:0;padding:20px;font-size:10pt;line-height:1.4;background:#fff;}@media print{*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;}}</style>' +
      '</head><body>' +
      '<table style="width:100%;border-collapse:collapse;border-bottom:3px solid #2D6A4F;padding-bottom:16px;margin-bottom:20px;"><tr>' +
        '<td style="vertical-align:middle;width:50%;"><div style="display:flex;align-items:center;gap:10px;">' +
          '<div style="display:flex;flex-direction:column;">' +
            '<span style="font-family:serif;font-weight:900;font-size:22px;color:' + ACCENT + ';line-height:1;letter-spacing:0.12em;text-transform:uppercase;">GRAMEENA BHARATHAM</span>' +
            '<span style="font-size:10px;font-weight:600;color:' + BRAND_COLOR + ';letter-spacing:0.2em;text-transform:uppercase;margin-top:2px;">The Taste of Rural Andhra</span>' +
          '</div></div></td>' +
        '<td style="vertical-align:top;text-align:right;">' +
          '<div style="font-size:20pt;font-weight:900;color:#1B4332;letter-spacing:-0.5px;">INVOICE</div>' +
          '<div style="font-size:9pt;color:#555;margin-top:6px;line-height:1.7;">' +
            '<strong>Invoice No:</strong> #' + escapeHtml(orderNumber) + '<br>' +
            '<strong>Date:</strong> ' + orderDate + '<br>' +
            '<strong>Status:</strong> ' + escapeHtml(fullOrderObj.status || 'paid') +
          '</div></td>' +
      '</tr></table>' +
      '<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">' +
        '<thead><tr style="background:#2D6A4F;">' +
          '<th style="padding:10px 12px;color:#fff;font-size:9pt;text-align:center;width:5%;">#</th>' +
          '<th style="padding:10px 12px;color:#fff;font-size:9pt;text-align:left;width:45%;">Item</th>' +
          '<th style="padding:10px 12px;color:#fff;font-size:9pt;text-align:center;width:15%;">Size</th>' +
          '<th style="padding:10px 12px;color:#fff;font-size:9pt;text-align:center;width:10%;">Qty</th>' +
          '<th style="padding:10px 12px;color:#fff;font-size:9pt;text-align:right;width:12%;">Unit Price</th>' +
          '<th style="padding:10px 12px;color:#fff;font-size:9pt;text-align:right;width:13%;">Total</th>' +
        '</tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
      '</table>' +
      '<table style="width:100%;border-collapse:collapse;margin-top:8px;"><tr><td style="width:55%;"></td><td style="width:45%;">' +
        '<table style="width:100%;border-collapse:collapse;">' +
          '<tr><td style="padding:7px 12px;text-align:right;color:#555;font-size:9.5pt;border-bottom:1px solid #d8f3dc;">Subtotal</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #d8f3dc;width:110px;">Rs.' + subtotal.toFixed(2) + '</td></tr>' +
          (Number(discount) > 0 ? '<tr><td style="padding:7px 12px;text-align:right;color:#059669;font-size:9.5pt;border-bottom:1px solid #d8f3dc;">Discount</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #d8f3dc;color:#059669;">-Rs.' + Number(discount).toFixed(2) + '</td></tr>' : '') +
          (Number(shipping) > 0 ? '<tr><td style="padding:7px 12px;text-align:right;color:#555;font-size:9.5pt;border-bottom:1px solid #d8f3dc;">Shipping</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #d8f3dc;">Rs.' + Number(shipping).toFixed(2) + '</td></tr>' : '') +
          (Number(tax) > 0 ? '<tr><td style="padding:7px 12px;text-align:right;color:#555;font-size:9.5pt;border-bottom:1px solid #d8f3dc;">Tax</td><td style="padding:7px 12px;text-align:right;font-weight:600;font-size:9.5pt;border-bottom:1px solid #d8f3dc;">Rs.' + Number(tax).toFixed(2) + '</td></tr>' : '') +
          '<tr style="background:#d8f3dc;"><td style="padding:10px 12px;text-align:right;font-weight:700;font-size:11pt;color:#1B4332;border-top:2px solid #2D6A4F;">TOTAL</td><td style="padding:10px 12px;text-align:right;font-weight:700;font-size:11pt;color:#2D6A4F;border-top:2px solid #2D6A4F;">Rs.' + Number(total).toFixed(2) + '</td></tr>' +
        '</table></td></tr></table>' +
      '<div style="margin-top:40px;padding-top:16px;border-top:1px solid #d8f3dc;text-align:center;font-size:9pt;color:#888;">Thank you for choosing Grameena Bharatham! | info@grameenahbaratham.com</div>' +
      '</body></html>';

    // Generate PDF
    let browser;
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      const puppeteerCore = require('puppeteer-core');
      const chromium = require('@sparticuz/chromium');
      browser = await puppeteerCore.launch({ args: chromium.args, defaultViewport: chromium.defaultViewport, executablePath: await chromium.executablePath(), headless: chromium.headless, ignoreHTTPSErrors: true });
    } else {
      const puppeteer = require('puppeteer');
      browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    }
    const page = await browser.newPage();
    await page.setContent(invoiceHtml, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // Email body rows
    const emailRowsHtml = (items || []).map(item => {
      const price = Number(item.variant?.price || item.product?.price || item.price || 0);
      let img = getFullImageUrl(item.variant?.image || item.product?.images?.[0] || item.product?.image_url);
      return '<tr><td style="padding:15px 10px;border-bottom:1px solid #eee;"><div style="display:flex;align-items:center;gap:12px;">' +
        (img ? '<img src="' + img + '" style="width:50px;height:50px;object-fit:contain;border-radius:8px;border:1px solid #eee;" />' : '') +
        '<div><div style="font-weight:600;color:#1B4332;">' + escapeHtml(item.product?.name || 'Product') + '</div>' +
        (item.variant?.size ? '<div style="font-size:11px;color:#888;margin-top:2px;">Size: ' + escapeHtml(item.variant.size) + '</div>' : '') +
        '</div></div></td>' +
        '<td style="padding:15px 10px;border-bottom:1px solid #eee;text-align:center;color:#555;">' + item.qty + '</td>' +
        '<td style="padding:15px 10px;border-bottom:1px solid #eee;text-align:right;color:#555;">Rs.' + price.toFixed(2) + '</td>' +
        '<td style="padding:15px 10px;border-bottom:1px solid #eee;text-align:right;font-weight:600;color:#1B4332;">Rs.' + (price * item.qty).toFixed(2) + '</td></tr>';
    }).join('');

    const emailBodyHtml = '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta http-equiv="Content-Type" content="text/html;charset=UTF-8"></head>' +
      '<body style="margin:0;padding:0;background-color:#F0FFF4;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;">' +
      '<div style="max-width:600px;width:100%;margin:20px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 15px 35px rgba(0,0,0,0.05);">' +
        '<div style="background-color:#2D6A4F;padding:35px 20px;text-align:center;">' +
          '<h1 style="color:#52B788;margin:0;font-family:serif;font-size:24px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Grameena Bharatham</h1>' +
          '<p style="color:#ffffff;margin:8px 0 0 0;font-size:11px;letter-spacing:1px;font-weight:300;">The Taste of Rural Andhra</p>' +
        '</div>' +
        '<div style="padding:40px 30px 20px 30px;">' +
          '<h2 style="color:#1B4332;font-family:serif;font-size:20px;margin-top:0;">Thank You for Your Order!</h2>' +
          '<p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:20px;">Hi ' + escapeHtml(address.name || 'Customer') + ',</p>' +
          '<p style="color:#555;font-size:14px;line-height:1.6;margin-bottom:25px;">Thank you for choosing Grameena Bharatham. Your order has been successfully placed and your payment has been received.</p>' +
          '<div style="background-color:#F0FFF4;border-radius:12px;padding:15px;margin-bottom:20px;">' +
            '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;"><span style="color:#555;">Order Number:</span><strong style="color:#1B4332;">#' + escapeHtml(orderNumber) + '</strong></div>' +
            '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px;"><span style="color:#555;">Order Date:</span><strong style="color:#1B4332;">' + orderDate + '</strong></div>' +
            '<div style="display:flex;justify-content:space-between;font-size:13px;"><span style="color:#555;">Payment Status:</span><strong style="color:#059669;">Paid</strong></div>' +
          '</div>' +
        '</div>' +
        '<div style="padding:0 30px 20px 30px;">' +
          '<h3 style="color:#1B4332;font-family:serif;font-size:16px;margin:0 0 15px 0;border-bottom:2px solid #d8f3dc;padding-bottom:10px;">ORDER SUMMARY</h3>' +
          '<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">' +
            '<thead><tr>' +
              '<th style="padding:10px;text-align:left;color:#888;font-size:11px;text-transform:uppercase;border-bottom:1px solid #eee;">Product</th>' +
              '<th style="padding:10px;text-align:center;color:#888;font-size:11px;text-transform:uppercase;border-bottom:1px solid #eee;">Qty</th>' +
              '<th style="padding:10px;text-align:right;color:#888;font-size:11px;text-transform:uppercase;border-bottom:1px solid #eee;">Price</th>' +
              '<th style="padding:10px;text-align:right;color:#888;font-size:11px;text-transform:uppercase;border-bottom:1px solid #eee;">Total</th>' +
            '</tr></thead>' +
            '<tbody>' + emailRowsHtml + '</tbody>' +
          '</table>' +
          '<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">' +
            '<tr><td style="width:40%;"></td><td style="width:60%;">' +
              '<table style="width:100%;border-collapse:collapse;">' +
                '<tr><td style="padding:6px 10px;color:#555;font-size:13px;text-align:right;">Subtotal:</td><td style="padding:6px 10px;color:#1B4332;font-size:13px;text-align:right;font-weight:600;">Rs.' + subtotal.toFixed(2) + '</td></tr>' +
                (Number(discount) > 0 ? '<tr><td style="padding:6px 10px;color:#555;font-size:13px;text-align:right;">Discount:</td><td style="padding:6px 10px;color:#059669;font-size:13px;text-align:right;font-weight:600;">-Rs.' + Number(discount).toFixed(2) + '</td></tr>' : '') +
                (Number(shipping) > 0 ? '<tr><td style="padding:6px 10px;color:#555;font-size:13px;text-align:right;">Shipping:</td><td style="padding:6px 10px;color:#1B4332;font-size:13px;text-align:right;font-weight:600;">Rs.' + Number(shipping).toFixed(2) + '</td></tr>' : '') +
                (Number(tax) > 0 ? '<tr><td style="padding:6px 10px;color:#555;font-size:13px;text-align:right;">Tax:</td><td style="padding:6px 10px;color:#1B4332;font-size:13px;text-align:right;font-weight:600;">Rs.' + Number(tax).toFixed(2) + '</td></tr>' : '') +
                '<tr><td style="padding:12px 10px;color:#1B4332;font-size:15px;text-align:right;font-weight:bold;border-top:2px solid #d8f3dc;">Order Total:</td><td style="padding:12px 10px;color:#2D6A4F;font-size:16px;text-align:right;font-weight:bold;border-top:2px solid #d8f3dc;">Rs.' + Number(total).toFixed(2) + '</td></tr>' +
              '</table>' +
            '</td></tr>' +
          '</table>' +
        '</div>' +
        '<div style="padding:0 30px 20px 30px;">' +
          '<div style="width:100%;background-color:#fafafa;padding:15px;border-radius:12px;margin-bottom:15px;">' +
            '<h4 style="margin:0 0 10px 0;color:#1B4332;font-size:13px;text-transform:uppercase;font-weight:bold;">Payment</h4>' +
            '<div style="font-size:12px;color:#555;line-height:1.6;">' +
              '<div>Status: <span style="color:#059669;font-weight:bold;">Paid</span></div>' +
              '<div>Method: <span style="color:#1B4332;font-weight:500;">' + escapeHtml(fullOrderObj.payment_method || 'Online') + '</span></div>' +
              (fullOrderObj.razorpay_payment_id ? '<div>Transaction ID: <span style="font-family:monospace;font-size:11px;color:#888;">' + escapeHtml(fullOrderObj.razorpay_payment_id) + '</span></div>' : '') +
            '</div>' +
          '</div>' +
          '<div style="width:100%;background-color:#fafafa;padding:15px;border-radius:12px;">' +
            '<h4 style="margin:0 0 10px 0;color:#1B4332;font-size:13px;text-transform:uppercase;font-weight:bold;">Shipping To</h4>' +
            '<div style="font-size:12px;color:#555;line-height:1.6;">' +
              '<div style="font-weight:bold;color:#1B4332;margin-bottom:4px;">' + escapeHtml(address.name || '') + '</div>' +
              '<div>' + escapeHtml(address.line1 || '') + '</div>' +
              '<div>' + [address.city, address.state, address.pincode].filter(Boolean).map(escapeHtml).join(', ') + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div style="padding:30px;background-color:#F0FFF4;text-align:center;">' +
          '<p style="color:#1B4332;font-size:13px;line-height:1.6;margin:0 0 20px 0;">Every Grameena Bharatham order is carefully packed by our team. We truly appreciate your support!</p>' +
          '<h3 style="color:#1B4332;font-family:serif;font-size:16px;margin:25px 0 0 0;">Thank you for supporting Grameena Bharatham!</h3>' +
        '</div>' +
        '<div style="background-color:#ffffff;padding:30px;text-align:center;border-top:1px solid #f0f0f0;">' +
          '<h4 style="color:#1B4332;margin:0 0 10px 0;font-size:13px;">Questions?</h4>' +
          '<p style="margin:0 0 15px 0;font-size:12px;color:#555;"><a href="mailto:info@grameenahbaratham.com" style="color:#2D6A4F;text-decoration:none;font-weight:bold;">info@grameenahbaratham.com</a></p>' +
          '<p style="margin:0 0 10px 0;font-size:13px;font-family:serif;font-weight:bold;color:#1B4332;letter-spacing:1px;">GRAMEENA BHARATHAM</p>' +
          '<p style="margin:0;font-size:10px;color:#bbb;">&copy; ' + new Date().getFullYear() + ' Grameena Bharatham. All rights reserved.</p>' +
        '</div>' +
      '</div></body></html>';

    await transporter.sendMail({
      from: FROM, to: email,
      subject: 'Invoice for Order #' + orderNumber + ' | ' + BRAND,
      html: emailBodyHtml,
      attachments: [{ filename: 'Invoice-' + orderNumber + '.pdf', content: pdfBuffer, contentType: 'application/pdf' }]
    });
    console.log('Customer invoice email sent for order', orderNumber);
  } catch(err) { console.error('Customer email error:', err); }
}

module.exports = { transporter, sendOTPEmail, sendOrderEmailToAdmin, sendOrderEmailToCustomer, sendRefundEmail };
