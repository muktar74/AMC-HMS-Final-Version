
import pool from './server/db.ts';

async function check() {
    try {
        const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'patients' AND column_name = 'assigned_staff_id'
    `);
        if (res.rows.length === 0) {
            console.log('❌ Column assigned_staff_id MISSING in patients table');
            console.log('Adding column...');
            await pool.query('ALTER TABLE patients ADD COLUMN assigned_staff_id UUID REFERENCES users(id) ON DELETE SET NULL');
            console.log('✅ Column added successfully');
        } else {
            console.log('✅ Column assigned_staff_id exists');
        }
    } catch (err) {
        console.error('Error checking DB:', err);
    } finally {
        await pool.end();
    }
}

check();
