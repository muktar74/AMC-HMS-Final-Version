import pg from 'pg';
const { Pool } = pg;
import dotenv from 'dotenv';
dotenv.config();

async function fixSchema() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Adding created_at to patients table...');
        await pool.query("ALTER TABLE patients ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()");
        console.log('✅ Success: created_at added to patients');

        // Also check and add to other tables if missing
        const tables = ['users', 'appointments', 'vitals', 'tasks', 'prescriptions', 'lab_orders', 'billing', 'clinical_notes'];
        for (const table of tables) {
            try {
                await pool.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()`);
                console.log(`✅ Success: created_at added to ${table}`);
            } catch (err) {
                console.warn(`⚠️ Warning: Could not add created_at to ${table}:`, err.message);
            }
        }

    } catch (err) {
        console.error('Error fixing schema:', err);
    } finally {
        await pool.end();
    }
}

fixSchema();
