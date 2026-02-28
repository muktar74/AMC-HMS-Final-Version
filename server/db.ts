import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: dbUrl || 'postgresql://localhost:5432/postgres',
  ssl: dbUrl ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10000, // 10 second timeout
  idleTimeoutMillis: 30000,
  max: 5
});

if (!dbUrl) {
  console.warn("WARNING: DATABASE_URL is not set. Database operations will fail.");
}

// Test connection on startup
pool.query('SELECT 1')
  .then(() => console.log('✅ Database connected successfully'))
  .catch((err: Error) => console.error('❌ Database connection failed:', err.message));

export const query = (text: string, params?: any[]) => pool.query(text, params);
export default pool;
