require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     '127.0.0.1',
  port:     5433,
  database: 'cineplex_db',
  user:     'postgres',
  password: 'yourpassword', // ← what you typed during install
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis:       30000,
});

const query = async (text, params) => {
  const client = await pool.connect();
  try {
    await client.query('SET search_path TO public');
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

const getClient = async () => {
  const client = await pool.connect();
  await client.query('SET search_path TO public');
  return client;
};

pool.connect()
  .then(client => {
    client.query('SET search_path TO public');
    console.log('✅ PostgreSQL connected successfully');
    client.release();
  })
  .catch(err => console.error('❌ PostgreSQL connection error:', err.message));

module.exports = { pool, query, getClient };
pool.connect()
  .then(async client => {
    const db     = await client.query('SELECT current_database()');
    const schema = await client.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1', ['public']);
    console.log('✅ PostgreSQL connected successfully');
    console.log('📦 Connected to DB:', db.rows[0].current_database);
    console.log('📋 Tables found:', schema.rows.map(r => r.table_name));
    client.release();
  })
  .catch(err => console.error('❌ PostgreSQL connection error:', err.message));