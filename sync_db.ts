
import pool from './server/db';
async function sync() {
    try {
        console.log('Starting DB sync...');
        // Check patients
        const pCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'patients'");
        const pNames = pCols.rows.map(r => r.column_name);
        if (!pNames.includes('assigned_staff_id')) {
            await pool.query('ALTER TABLE patients ADD COLUMN assigned_staff_id UUID REFERENCES users(id) ON DELETE SET NULL');
            console.log('Added assigned_staff_id');
        }
        // Check lab_orders
        const lCols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'lab_orders'");
        const lNames = lCols.rows.map(r => r.column_name);
        if (!lNames.includes('lab_tech_id')) {
            await pool.query('ALTER TABLE lab_orders ADD COLUMN lab_tech_id UUID REFERENCES users(id) ON DELETE SET NULL');
            console.log('Added lab_tech_id');
        }
        console.log('DB sync complete');
    } catch (err) { console.error('Sync failed:', err); }
    finally { await pool.end(); }
}
sync();
