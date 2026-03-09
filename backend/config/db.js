const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'cineplex_db',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'yourpassword',
  max:               20,   // max connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ PostgreSQL connection error:', err.message);
  } else {
    console.log('✅ PostgreSQL connected successfully');
    release();
  }
});

// Helper — run a query
const query = (text, params) => pool.query(text, params);

// Helper — get a client for transactions
const getClient = () => pool.connect();

module.exports = { query, getClient, pool };