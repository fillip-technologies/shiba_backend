import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'shibha',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

await pool.query('SELECT 1');
console.log('PostgreSQL connected');

await pool.query(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    reset_token TEXT,
    reset_token_expires BIGINT,
    created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
  )
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS quote_requests (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    service TEXT NOT NULL,
    message TEXT DEFAULT '',
    source TEXT DEFAULT 'Quote Modal',
    status TEXT DEFAULT 'new',
    created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT
  )
`);

// Seed default admin on first run
const { rows } = await pool.query(
  'SELECT id FROM admin_users WHERE email = $1',
  ['admin@shibhasolar.com']
);
if (rows.length === 0) {
  const hash = bcrypt.hashSync('Admin@123!', 10);
  await pool.query(
    'INSERT INTO admin_users (email, password, name) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
    ['admin@shibhasolar.com', hash, 'Admin']
  );
  console.log('Default admin created — email: admin@shibhasolar.com  password: Admin@123!');
}

export default pool;
