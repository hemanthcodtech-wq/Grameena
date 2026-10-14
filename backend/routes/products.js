const express = require('express');
const router = express.Router();
const pool = require('../db');

// Helper to calculate applicable offer and discounted prices for products
const attachOfferDiscounts = async (productsList) => {
  if (!productsList || productsList.length === 0) return productsList;
  try {
    const offersRes = await pool.query('SELECT * FROM offers WHERE is_active = true ORDER BY created_at DESC');
    const activeOffers = offersRes.rows;
    if (activeOffers.length === 0) return productsList;

    return productsList.map(p => {
      const pCat = String(p.category || '').toLowerCase();
      const pIdStr = String(p.id);

      let matchedOffer = null;
      let highestDiscount = 0;

      for (const offer of activeOffers) {
        let cats = [];
        if (offer.applicable_categories) {
          cats = typeof offer.applicable_categories === 'string'
            ? JSON.parse(offer.applicable_categories)
            : offer.applicable_categories;
        }
        let prods = [];
        if (offer.applicable_products) {
          prods = typeof offer.applicable_products === 'string'
            ? JSON.parse(offer.applicable_products)
            : offer.applicable_products;
        }

        const catMatches = Array.isArray(cats) && cats.length > 0
          ? cats.some(c => String(c).toLowerCase() === pCat)
          : false;

        const prodMatches = Array.isArray(prods) && prods.length > 0
          ? prods.some(prodId => String(prodId) === pIdStr)
          : false;

        const isUniversal = (!cats || cats.length === 0) && (!prods || prods.length === 0);

        if (prodMatches || catMatches || (isUniversal && p.is_offer)) {
          const disc = parseFloat(offer.discount_percentage) || 0;
          if (disc >= highestDiscount) {
            highestDiscount = disc;
            matchedOffer = offer;
          }
        }
      }

      if (matchedOffer && highestDiscount > 0) {
        const basePrice = parseFloat(p.price) || 0;
        const discountedPrice = Math.round(basePrice * (1 - highestDiscount / 100));

        // Adjust sizes / variants if they exist
        let updatedSizes = p.sizes;
        if (p.sizes) {
          const rawSizes = typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes;
          if (Array.isArray(rawSizes)) {
            updatedSizes = rawSizes.map(s => {
              const origPrice = parseFloat(s.price) || 0;
              const discPrice = Math.round(origPrice * (1 - highestDiscount / 100));
              return {
                ...s,
                original_price: s.price,
                mrp: s.mrp || s.price,
                price: discPrice > 0 ? String(discPrice) : s.price
              };
            });
          }
        }

        let updatedVariants = p.variants;
        if (p.variants) {
          const rawVariants = typeof p.variants === 'string' ? JSON.parse(p.variants) : p.variants;
          if (Array.isArray(rawVariants)) {
            updatedVariants = rawVariants.map(v => {
              const origPrice = parseFloat(v.price) || 0;
              const discPrice = Math.round(origPrice * (1 - highestDiscount / 100));
              return {
                ...v,
                original_price: v.price,
                mrp: v.mrp || v.price,
                price: discPrice > 0 ? String(discPrice) : v.price
              };
            });
          }
        }

        return {
          ...p,
          original_price: p.price,
          mrp: p.mrp || p.price,
          price: discountedPrice > 0 ? String(discountedPrice) : p.price,
          sizes: updatedSizes,
          variants: updatedVariants,
          offer: matchedOffer,
          offer_discount: highestDiscount
        };
      }

      return p;
    });
  } catch (e) {
    console.error('Error attaching offer discounts:', e);
    return productsList;
  }
};

// Get all products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    const enriched = await attachOfferDiscounts(result.rows);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single product
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id=$1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    const enriched = await attachOfferDiscounts(result.rows);
    res.json(enriched[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get categories
router.get('/categories/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get products by category
router.get('/category/:categoryId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE category_id=$1 ORDER BY created_at DESC', [req.params.categoryId]);
    const enriched = await attachOfferDiscounts(result.rows);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get active offers and all offered products
router.get('/offers/active', async (req, res) => {
  try {
    const offersRes = await pool.query(
      'SELECT * FROM offers WHERE is_active = true ORDER BY created_at DESC'
    );
    const activeOffers = offersRes.rows;

    const productsRes = await pool.query(
      'SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC'
    );
    const allProducts = productsRes.rows;

    // Only include products that admin has marked as offer (p.is_offer === true) OR specifically targeted in an active offer
    const offeredProducts = allProducts.map(p => {
      const pCat = String(p.category || '').toLowerCase();
      const pIdStr = String(p.id);

      let matchedOffer = null;
      let highestDiscount = 0;

      for (const offer of activeOffers) {
        let cats = [];
        if (offer.applicable_categories) {
          cats = typeof offer.applicable_categories === 'string'
            ? JSON.parse(offer.applicable_categories)
            : offer.applicable_categories;
        }
        let prods = [];
        if (offer.applicable_products) {
          prods = typeof offer.applicable_products === 'string'
            ? JSON.parse(offer.applicable_products)
            : offer.applicable_products;
        }

        const catMatches = Array.isArray(cats) && cats.length > 0
          ? cats.some(c => String(c).toLowerCase() === pCat)
          : false;

        const prodMatches = Array.isArray(prods) && prods.length > 0
          ? prods.some(prodId => String(prodId) === pIdStr)
          : false;

        const isUniversal = (!cats || cats.length === 0) && (!prods || prods.length === 0);

        // If offer is specifically targeted to this product or category:
        // OR if offer is universal AND product is flagged by admin as is_offer
        if (prodMatches || catMatches || (isUniversal && p.is_offer)) {
          const disc = parseFloat(offer.discount_percentage) || 0;
          if (disc >= highestDiscount) {
            highestDiscount = disc;
            matchedOffer = offer;
          }
        }
      }

      // Strictly only products that have is_offer=true OR were matched to an offer
      if (p.is_offer || matchedOffer) {
        return {
          ...p,
          offer: matchedOffer,
          offer_discount: highestDiscount > 0 ? highestDiscount : (p.offer_discount || 10)
        };
      }
      return null;
    }).filter(Boolean);

    const enrichedOfferedProducts = await attachOfferDiscounts(offeredProducts);

    res.json({
      offers: activeOffers,
      products: enrichedOfferedProducts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a review to a product (Login required)
const { authMiddleware } = require('../middleware/auth');

router.post('/:id/reviews', authMiddleware, async (req, res) => {
  try {
    const productId = req.params.id;
    const { rating, comment, title } = req.body;
    const userId = req.user.id;

    if (!rating || !comment) {
      return res.status(400).json({ error: 'Rating and review comment are required' });
    }

    const numericRating = Math.min(5, Math.max(1, parseInt(rating) || 5));

    // Get user details
    const userRes = await pool.query('SELECT id, name, email FROM users WHERE id=$1', [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userRes.rows[0];

    // Get product
    const prodRes = await pool.query('SELECT id, name, reviews, allow_reviews FROM products WHERE id=$1', [productId]);
    if (prodRes.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const product = prodRes.rows[0];

    if (product.allow_reviews === false) {
      return res.status(403).json({ error: 'Reviews are currently disabled for this product' });
    }

    let existingReviews = [];
    try {
      existingReviews = typeof product.reviews === 'string' ? JSON.parse(product.reviews) : (product.reviews || []);
    } catch {}

    const newReview = {
      id: Date.now(),
      user_id: user.id,
      user_name: user.name || user.email.split('@')[0],
      user_email: user.email,
      rating: numericRating,
      title: title || '',
      comment: comment.trim(),
      created_at: new Date().toISOString()
    };

    const updatedReviews = [newReview, ...existingReviews];

    const updateRes = await pool.query(
      'UPDATE products SET reviews=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
      [JSON.stringify(updatedReviews), productId]
    );

    res.json({
      message: 'Review added successfully',
      review: newReview,
      product: updateRes.rows[0]
    });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
