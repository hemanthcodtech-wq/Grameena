const pool = require('./db');

async function seed() {
  try {
    // Clear existing data
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM categories');

    console.log('Cleared existing data.');

    // Seed Categories
    const categoriesResult = await pool.query(`
      INSERT INTO categories (name, image_url) VALUES 
      ('Pickles', '/images/pickles.jpg'),
      ('Cold Press Oils', '/images/oils.jpg'),
      ('Traditional Snacks', '/images/snacks.jpg')
      RETURNING id, name;
    `);

    console.log('Categories seeded.');

    // Seed Products
    const products = [
      {
        name: 'Mango Pickle (Avakaya)',
        description: 'Authentic Andhra style mango pickle made with freshly ground spices and cold-pressed oil.',
        category: 'Pickles',
        image_url: '/images/pickles.jpg',
        is_active: true,
        is_bestseller: true,
        is_trending: true,
        is_offer: false,
        is_festive: false,
        sizes: JSON.stringify([
          { size: '250g', price: 149, stock: 50 },
          { size: '500g', price: 249, stock: 100 },
          { size: '1kg', price: 449, stock: 30 }
        ])
      },
      {
        name: 'Gongura Pickle',
        description: 'Tangy and spicy Gongura pickle, a staple in every Telugu household.',
        category: 'Pickles',
        image_url: '/images/pickles.jpg',
        is_active: true,
        is_bestseller: true,
        is_trending: false,
        is_offer: true,
        is_festive: true,
        sizes: JSON.stringify([
          { size: '250g', price: 139, stock: 40 },
          { size: '500g', price: 229, stock: 60 }
        ])
      },
      {
        name: 'Groundnut Oil (Cold Pressed)',
        description: '100% pure cold-pressed groundnut oil, rich in nutrients and aroma.',
        category: 'Cold Press Oils',
        image_url: '/images/oils.jpg',
        is_active: true,
        is_bestseller: true,
        is_trending: true,
        is_offer: false,
        is_festive: false,
        sizes: JSON.stringify([
          { size: '500ml', price: 199, stock: 20 },
          { size: '1L', price: 379, stock: 50 },
          { size: '5L', price: 1799, stock: 10 }
        ])
      },
      {
        name: 'Andhra Chekkalu',
        description: 'Crispy, spicy, and crunchy rice flour crackers.',
        category: 'Traditional Snacks',
        image_url: '/images/snacks.jpg',
        is_active: true,
        is_bestseller: false,
        is_trending: true,
        is_offer: true,
        is_festive: true,
        sizes: JSON.stringify([
          { size: '250g', price: 120, stock: 100 },
          { size: '500g', price: 200, stock: 80 }
        ])
      }
    ];

    for (let p of products) {
      await pool.query(`
        INSERT INTO products (
          name, description, category, image_url, 
          is_active, is_bestseller, is_trending, is_offer, is_festive, sizes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        p.name, p.description, p.category, p.image_url,
        p.is_active, p.is_bestseller, p.is_trending, p.is_offer, p.is_festive, p.sizes
      ]);
    }

    console.log('Products seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
