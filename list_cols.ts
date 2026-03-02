
import pool from './server/db';
async function list() {
    try {
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'patients'");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) { console.error(err); }
    finally { await pool.end(); }
}
list();
