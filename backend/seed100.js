const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const ADJECTIVES = ["Authentic", "Spicy", "Homemade", "Traditional", "Premium", "Cold-Pressed", "Pure", "Organic", "Grandma's", "Royal", "Special", "Classic", "Handmade"];
const PICKLES = ["Mango Pickle", "Gongura Pickle", "Tomato Pickle", "Lemon Pickle", "Garlic Pickle", "Mixed Veg Pickle", "Amla Pickle", "Red Chilli Pickle"];
const OILS = ["Groundnut Oil", "Sesame Oil", "Coconut Oil", "Mustard Oil", "Sunflower Oil", "Castor Oil", "Almond Oil"];
const SNACKS = ["Chekkalu", "Murukulu", "Janthikalu", "Gavvalu", "Boondi", "Mixture", "Ariselu", "Sunnundalu", "Kajjikayalu"];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomPrice = (min, max) => Math.floor(Math.random() * ((max - min) / 10 + 1)) * 10 + min;

async function seed100() {
  try {
    const { rows: categories } = await pool.query('SELECT * FROM categories');
    
    if (categories.length === 0) {
      console.log('No categories found. Run main seed script first.');
      return;
    }

    const categoryMap = {
      'Pickles': categories.find(c => c.name === 'Pickles')?.id,
      'Cold Press Oils': categories.find(c => c.name === 'Cold Press Oils')?.id,
      'Snacks': categories.find(c => c.name === 'Snacks')?.id
    };

    let count = 0;
    
    // Generate ~100 products
    for (let i = 0; i < 100; i++) {
      // Randomly pick category
      const typeNum = Math.random();
      let type, name, category_id, image_url, sizes;
      
      const isPickle = typeNum < 0.4;
      const isSnack = typeNum >= 0.4 && typeNum < 0.8;
      
      if (isPickle) {
        name = `${getRandomElement(ADJECTIVES)} ${getRandomElement(PICKLES)}`;
        category_id = categoryMap['Pickles'];
        image_url = '/images/pickles.jpg';
        const basePrice = getRandomPrice(100, 300);
        sizes = [
          { size: '250g', price: basePrice },
          { size: '500g', price: Math.floor(basePrice * 1.8) },
          { size: '1kg', price: Math.floor(basePrice * 3.4) }
        ];
      } else if (isSnack) {
        name = `${getRandomElement(ADJECTIVES)} ${getRandomElement(SNACKS)}`;
        category_id = categoryMap['Snacks'];
        image_url = '/images/snacks.jpg';
        const basePrice = getRandomPrice(80, 200);
        sizes = [
          { size: '250g', price: basePrice },
          { size: '500g', price: Math.floor(basePrice * 1.9) },
          { size: '1kg', price: Math.floor(basePrice * 3.5) }
        ];
      } else {
        name = `${getRandomElement(ADJECTIVES)} ${getRandomElement(OILS)}`;
        category_id = categoryMap['Cold Press Oils'];
        image_url = '/images/oils.jpg';
        const basePrice = getRandomPrice(200, 400);
        sizes = [
          { size: '500ml', price: basePrice },
          { size: '1L', price: Math.floor(basePrice * 1.9) },
          { size: '5L', price: Math.floor(basePrice * 9) }
        ];
      }
      
      const description = `Enjoy the rich, traditional taste of our ${name}. Made with love and the finest ingredients following generations-old recipes.`;
      
      const is_active = true;
      const is_bestseller = Math.random() < 0.2; // 20% chance
      const is_festive = Math.random() < 0.15; // 15% chance
      const is_trending = Math.random() < 0.15; // 15% chance
      const is_offer = Math.random() < 0.25; // 25% chance
      
      const categoryName = isPickle ? 'Pickles' : (isSnack ? 'Snacks' : 'Cold Press Oils');

      await pool.query(
        `INSERT INTO products (name, description, stock, category, sizes, image_url, images, is_active, is_bestseller, is_festive, is_trending, is_offer)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          name, 
          description, 
          100, 
          categoryName,
          JSON.stringify(sizes),
          image_url, 
          '[]',
          is_active,
          is_bestseller,
          is_festive,
          is_trending,
          is_offer
        ]
      );
      count++;
    }
    
    console.log(`Successfully generated and seeded ${count} products!`);
    
  } catch (err) {
    console.error('Error seeding 100 products:', err);
  } finally {
    pool.end();
  }
}

seed100();
