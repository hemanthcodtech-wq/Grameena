const { Pool } = require('pg');
const format = require('pg-format');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Neon's PgBouncer connection pooler in transaction mode can reject standard extended protocol parameter bindings ($1, $2, ...).
// By wrapping pool.query to safely format queries using pg-format, all parameterized queries across the application
// are securely escaped and executed as simple queries seamlessly without SQL injection risks.
const originalQuery = pool.query.bind(pool);
pool.query = function (queryTextOrConfig, values, callback) {
  if (typeof queryTextOrConfig === 'string' && Array.isArray(values) && values.length > 0) {
    try {
      const formattedSql = queryTextOrConfig.replace(/\$([0-9]+)/g, (match, n) => {
        const val = values[parseInt(n, 10) - 1];
        return format.literal(val);
      });

      if (typeof callback === 'function') {
        return originalQuery(formattedSql, callback);
      }
      return originalQuery(formattedSql);
    } catch (err) {
      console.error('Safe query formatting error:', err);
      return originalQuery(queryTextOrConfig, values, callback);
    }
  }
  return originalQuery(queryTextOrConfig, values, callback);
};

module.exports = pool;
