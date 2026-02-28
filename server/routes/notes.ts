import express from 'express';
import { Pool } from 'pg';

const createNotesRouter = (pool: Pool) => {
  const router = express.Router();

  router.post('/', async (req, res) => {
    const { notes, patient_id, doctor_id } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO clinical_notes (notes, patient_id, doctor_id) VALUES ($1, $2, $3) RETURNING *',
        [notes, patient_id, doctor_id]
      );
      res.json(result.rows[0]);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  router.get('/:patient_id', async (req, res) => {
    const { patient_id } = req.params;
    try {
      const result = await pool.query('SELECT * FROM clinical_notes WHERE patient_id = $1 ORDER BY created_at DESC', [patient_id]);
      res.json(result.rows);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  return router;
};

export default createNotesRouter;
