import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

async function checkSchema() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
        console.log('--- USERS TABLE COLUMNS ---');
        res.rows.forEach(r => console.log('- ' + r.column_name));
    } catch (err) {
        console.error('Error checking schema:', err);
    } finally {
        await pool.end();
    }
}

checkSchema();
