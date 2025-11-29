import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config({ path: process.env.DOTENV_PATH || '../.env' });

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Passw0rd',
  database: process.env.DB_NAME || 'demo'
});

pool.on('error', (err) => {
  console.error('Unexpected DB error', err);
  process.exit(1);
});

export const query = (text, params = []) => pool.query(text, params);
export const getClient = () => pool.connect();
