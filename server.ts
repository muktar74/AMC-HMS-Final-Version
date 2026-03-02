import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import bcrypt from 'bcryptjs';
import pool from './server/db';
import createNotesRouter from './server/routes/notes';
import { createClient } from '@supabase/supabase-js';
import compression from 'compression';
import helmet from 'helmet';

console.log('🚀 Server starting...');
if (process.env.VERCEL) {
  console.log('🌐 Running in VERCEL environment');
}
console.log('🔑 DATABASE_URL is ' + (process.env.DATABASE_URL ? 'PRESENT' : 'MISSING'));

// Supabase Admin Client (service role for server-side user management)
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Initialize Database Schema ---
const schemaPath = path.join(__dirname, 'supabase_schema.sql');
const schema = fs.existsSync(schemaPath) ? fs.readFileSync(schemaPath, 'utf8') : '';

const labTestsSeed = [
  { category: 'HEMATOLOGY', name: 'CBC' }, { category: 'HEMATOLOGY', name: 'WBC' }, { category: 'HEMATOLOGY', name: 'Diff N' },
  { category: 'HEMATOLOGY', name: 'Diff L' }, { category: 'HEMATOLOGY', name: 'Diff E' }, { category: 'HEMATOLOGY', name: 'Diff M' },
  { category: 'HEMATOLOGY', name: 'Diff B' }, { category: 'HEMATOLOGY', name: 'Hgb' }, { category: 'HEMATOLOGY', name: 'Hct' },
  { category: 'HEMATOLOGY', name: 'ESR' }, { category: 'HEMATOLOGY', name: 'RBC' }, { category: 'HEMATOLOGY', name: 'Platelet' },
  { category: 'HEMATOLOGY', name: 'Blood group & Rh' }, { category: 'HEMATOLOGY', name: 'Blood Film' }, { category: 'HEMATOLOGY', name: 'Peripheral Morphology' },
  { category: 'PARASITOLOGY', name: 'Consistency' }, { category: 'PARASITOLOGY', name: 'O/P' }, { category: 'PARASITOLOGY', name: 'Occult Blood' },
  { category: 'PARASITOLOGY', name: 'Urine' }, { category: 'PARASITOLOGY', name: 'H.Pylori Stool Ag' },
  { category: 'URINALYSIS', name: 'Color' }, { category: 'URINALYSIS', name: 'Appearance' }, { category: 'URINALYSIS', name: 'PH' },
  { category: 'URINALYSIS', name: 'SG' }, { category: 'URINALYSIS', name: 'Leukocyte' }, { category: 'URINALYSIS', name: 'Protein' },
  { category: 'URINALYSIS', name: 'Sugar' }, { category: 'URINALYSIS', name: 'Ketone' }, { category: 'URINALYSIS', name: 'Nitrite' },
  { category: 'URINALYSIS', name: 'Bilirubin' }, { category: 'URINALYSIS', name: 'Urobolinogen' }, { category: 'URINALYSIS', name: 'Blood' },
  { category: 'MICROSCOPY', name: 'Epith.cell' }, { category: 'MICROSCOPY', name: 'WBC' }, { category: 'MICROSCOPY', name: 'RBC' },
  { category: 'MICROSCOPY', name: 'Casts' }, { category: 'MICROSCOPY', name: 'Bacteria' },
  { category: 'HCG test', name: 'HCG test' },
  { category: 'CHEMISTRY', name: 'FBS/RBS' }, { category: 'CHEMISTRY', name: 'SGOT' }, { category: 'CHEMISTRY', name: 'SGPT' },
  { category: 'CHEMISTRY', name: 'Alk.Phos' }, { category: 'CHEMISTRY', name: 'Bilirubin(T)' }, { category: 'CHEMISTRY', name: 'Bilirubin(D)' },
  { category: 'CHEMISTRY', name: 'BUN/Urea' }, { category: 'CHEMISTRY', name: 'Creatinine' }, { category: 'CHEMISTRY', name: 'Uric acid' },
  { category: 'CHEMISTRY', name: 'T.Protein/Albumin' }, { category: 'CHEMISTRY', name: 'Cholestor' }, { category: 'CHEMISTRY', name: 'HDL' },
  { category: 'CHEMISTRY', name: 'LDL' }, { category: 'CHEMISTRY', name: 'Triglyceride' }, { category: 'CHEMISTRY', name: 'Sodium' },
  { category: 'CHEMISTRY', name: 'Potassium' }, { category: 'CHEMISTRY', name: 'Calcium' },
  { category: 'COAGUALATON PROFILE', name: 'Bleeding time' }, { category: 'COAGUALATON PROFILE', name: 'PT' },
  { category: 'COAGUALATON PROFILE', name: 'INR' }, { category: 'COAGUALATON PROFILE', name: 'PTT' },
  { category: 'SEROLOGY', name: 'VDRL/RPR' }, { category: 'SEROLOGY', name: 'Widal H' }, { category: 'SEROLOGY', name: 'Widal O' },
  { category: 'SEROLOGY', name: 'Weil Felix' }, { category: 'SEROLOGY', name: 'HBsAG' }, { category: 'SEROLOGY', name: 'HCV Antibody' },
  { category: 'SEROLOGY', name: 'ASO Titer' }, { category: 'SEROLOGY', name: 'CRP' }, { category: 'SEROLOGY', name: 'H.Pylori Ab' },
  { category: 'SEROLOGY', name: 'Rheumatoid Factor' }, { category: 'SEROLOGY', name: 'KOH' }, { category: 'SEROLOGY', name: 'KHB Test' },
  { category: 'BACTERIOLOGY', name: 'Gram\'s stain' }, { category: 'BACTERIOLOGY', name: 'Wet Film' }, { category: 'BACTERIOLOGY', name: 'AFB' },
  { category: 'HORMONES', name: 'TFT' }, { category: 'HORMONES', name: 'TSH' }, { category: 'HORMONES', name: 'LH' }, { category: 'HORMONES', name: 'Prolactin' },
];

async function initDb() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ Cannot initialize database: DATABASE_URL is missing!");
    return;
  }
  console.log("🔄 Starting database initialization...");
  try {
    // Optimization: Only run full schema if users table doesn't exist or is empty
    const checkUsers = await pool.query("SELECT 1 FROM information_schema.tables WHERE table_name = 'users'").catch(() => ({ rows: [] }));
    if (checkUsers.rows.length > 0) {
      console.log("✅ Database tables already exist. Skipping full schema initialization.");
    } else {
      process.stdout.write("📦 Database empty. Initializing schema... ");
      const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
      for (const stmt of statements) {
        try { await pool.query(stmt); } catch (err: any) {
          // Silently ignore if it's "already exists" but log others
          if (!err.message.includes('already exists')) {
            console.error(`Statement failed: ${stmt.substring(0, 50)}... Error: ${err.message}`);
          }
        }
      }
      console.log("Done.");
    }
    const adminExists = await pool.query("SELECT * FROM users WHERE role = 'admin'");
    if (adminExists.rows.length === 0) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync("admin123", salt);
      await pool.query("INSERT INTO users (username, password, role, full_name) VALUES ($1, $2, $3, $4)", ["admin", hashedPassword, "admin", "System Administrator"]);
    }

    // Seed Lab Tests if table exists (it should after schema run)
    const testCount = await pool.query("SELECT COUNT(*) FROM lab_tests");
    if (parseInt(testCount.rows[0].count) === 0) {
      process.stdout.write("📦 Initializing laboratory test catalog... ");
      for (const test of labTestsSeed) {
        await pool.query("INSERT INTO lab_tests (category, name) VALUES ($1, $2)", [test.category, test.name]);
      }
      console.log("Done.");
    }

    // Migration: Populate created_at for existing patients if null
    await pool.query("UPDATE patients SET created_at = NOW() WHERE created_at IS NULL");

  } catch (err) { console.error("Db Init Error", err); }
}

const app = express();
app.use(helmet({
  contentSecurityPolicy: false, // Vite needs this disabled in dev
}));
app.use(compression());
app.use(express.json());

// Pass pool to notes router
const notesRouter = createNotesRouter(pool);
app.use('/api/notes', notesRouter);

// --- API Routes ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Africa Medium Clinic API is running" });
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = result.rows[0];

    if (user) {
      let isMatch = false;
      try {
        isMatch = bcrypt.compareSync(password, user.password);
      } catch (e) {
        // Fallback for plaintext passwords from old seed data
        isMatch = password === user.password;
      }
      if (!isMatch && password === user.password) {
        isMatch = true;
      }

      if (isMatch) {
        const { password: _, ...userWithoutPassword } = user;
        res.json({ success: true, user: userWithoutPassword });
        return;
      }
    }
    res.status(401).json({ success: false, message: "Invalid credentials" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/reset-password", async (req, res) => {
  const { username, contact, new_password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1 AND contact = $2", [username, contact]);
    const user = result.rows[0];

    if (user) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(new_password, salt);
      await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, user.id]);
      res.json({ success: true, message: "Password reset successfully" });
    } else {
      res.status(400).json({ success: false, message: "User not found or contact number incorrect" });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// User Management
app.get("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Try to find user in our Postgres DB
    let result = await pool.query("SELECT id, username, role, full_name, contact FROM users WHERE id = $1", [id]);

    if (result.rows.length > 0) {
      return res.json({ success: true, user: result.rows[0] });
    }

    // 2. If not found, check if they exist in Supabase Auth (Lazy Provisioning)
    console.log(`🔍 User ${id} not in Postgres. Checking Supabase Auth...`);
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.admin.getUserById(id);

    if (authUser && !authError) {
      console.log(`✨ Found user ${authUser.email} in Supabase Auth. Syncing to Postgres...`);

      // Check if a user with this email already exists but with a different ID (e.g. from a local test)
      const emailCheck = await pool.query("SELECT * FROM users WHERE username = $1", [authUser.email]);

      if (emailCheck.rows.length > 0) {
        // Update the existing record with the new Supabase ID
        await pool.query("UPDATE users SET id = $1 WHERE username = $2", [id, authUser.email]);
      } else {
        // Create a new record
        // Default role is doctor, except for the very first user or specific emails
        const role = authUser.email?.includes('admin') ? 'admin' : 'doctor';
        await pool.query(
          "INSERT INTO users (id, username, password, role, full_name) VALUES ($1, $2, $3, $4, $5)",
          [id, authUser.email, 'supabase_auth', role, authUser.user_metadata?.full_name || authUser.email?.split('@')[0]]
        );
      }

      // Fetch again to return the newly synced user
      const finalResult = await pool.query("SELECT id, username, role, full_name, contact FROM users WHERE id = $1", [id]);
      return res.json({ success: true, user: finalResult.rows[0] });
    }

    res.status(404).json({ success: false, message: "User not found in Auth or Database" });
  } catch (err: any) {
    console.error("Sync Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, username, role, full_name, contact FROM users");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/users", async (req, res) => {
  const { username, password, role, full_name, contact } = req.body;
  try {
    // Check if we are using the service role key
    const isServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ? true : false;

    // Step 1: Create user in Supabase Auth so they can log in
    let authData = null;
    let authError = null;

    if (!isServiceKey && !process.env.VITE_SUPABASE_ANON_KEY?.includes('service')) {
      console.warn('Backend is using ANON KEY. User creation in Supabase Auth will likely fail.');
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: username,
      password: password,
      email_confirm: true
    });
    authData = data;
    authError = error;

    let supabaseUserId: string | null = null;
    if (authError) {
      if (authError.message.includes('already been registered')) {
        // User exists in Auth, try to get their ID to sync with our DB
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = (listData?.users || []).find((u: any) => u.email === username);
        if (existingUser) {
          console.log('User already exists in Auth. Syncing with DB...');
          supabaseUserId = existingUser.id;
        } else {
          return res.status(403).json({ success: false, message: authError.message });
        }
      } else {
        // Provide a clearer error message for other errors
        let msg = authError.message;
        if (msg.includes('Tenant or user not found') || msg.includes('User not allowed')) {
          msg = "Registration Error: SUPABASE_SERVICE_ROLE_KEY is missing or invalid in .env.";
        }
        return res.status(403).json({ success: false, message: msg });
      }
    } else if (authData?.user) {
      supabaseUserId = authData.user.id;
    }

    // Step 2: Create user in our database
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    let result;
    if (supabaseUserId) {
      // Use Supabase Auth ID as the primary key so login works seamlessly
      result = await pool.query(
        "INSERT INTO users (id, username, password, role, full_name, contact) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
        [supabaseUserId, username, hashedPassword, role, full_name, contact]
      );
    } else {
      result = await pool.query(
        "INSERT INTO users (username, password, role, full_name, contact) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [username, hashedPassword, role, full_name, contact]
      );
    }
    res.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post("/api/users/:id/reset-password", async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put("/api/users/:id/profile", async (req, res) => {
  const { id } = req.params;
  const { full_name, contact, password } = req.body;
  try {
    if (password) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      await pool.query(
        "UPDATE users SET full_name = $1, contact = $2, password = $3 WHERE id = $4",
        [full_name, contact, hashedPassword, id]
      );
    } else {
      await pool.query(
        "UPDATE users SET full_name = $1, contact = $2 WHERE id = $3",
        [full_name, contact, id]
      );
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { username, password, role, full_name, contact } = req.body;
  try {
    if (password) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      await pool.query(
        "UPDATE users SET username = $1, password = $2, role = $3, full_name = $4, contact = $5 WHERE id = $6",
        [username, hashedPassword, role, full_name, contact, id]
      );
    } else {
      await pool.query(
        "UPDATE users SET username = $1, role = $2, full_name = $3, contact = $4 WHERE id = $5",
        [username, role, full_name, contact, id]
      );
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Clinical Notes (handled by router, but kept here for reference if needed)
// The router handles /api/notes

// Tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/tasks", async (req, res) => {
  const { assigned_to, description, due_date } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO tasks (assigned_to, description, due_date) VALUES ($1, $2, $3) RETURNING id",
      [assigned_to, description, due_date]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { status, description, assigned_to, due_date } = req.body;
  try {
    if (status !== undefined && description !== undefined && assigned_to !== undefined && due_date !== undefined) {
      await pool.query("UPDATE tasks SET status = $1, description = $2, assigned_to = $3, due_date = $4 WHERE id = $5", [status, description, assigned_to, due_date, id]);
    } else if (status !== undefined) {
      await pool.query("UPDATE tasks SET status = $1 WHERE id = $2", [status, id]);
    } else if (assigned_to !== undefined) {
      await pool.query("UPDATE tasks SET assigned_to = $1 WHERE id = $2", [assigned_to, id]);
    } else if (due_date !== undefined) {
      await pool.query("UPDATE tasks SET due_date = $1 WHERE id = $2", [due_date, id]);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Visits
app.get("/api/visits/patient/:patientId", async (req, res) => {
  const { patientId } = req.params;
  try {
    const result = await pool.query(`
        SELECT v.*, u.full_name as doctor_name 
        FROM visits v
        LEFT JOIN users u ON v.doctor_id = u.id
        WHERE v.patient_id = $1
        ORDER BY v.visit_date DESC, v.created_at DESC
      `, [patientId]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/visits", async (req, res) => {
  const { patient_id, visit_date, reason, diagnosis, treatment, doctor_id, notes, status, chief_complaint, hpi } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO visits (patient_id, visit_date, reason, diagnosis, treatment, doctor_id, notes, status, chief_complaint, hpi) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id",
      [patient_id, visit_date, reason, diagnosis, treatment, doctor_id, notes, status || 'completed', chief_complaint, hpi]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Clinic Info
app.get("/api/clinic-info", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM clinic_info LIMIT 1");
    if (result.rows.length === 0) {
      // Return default if none exists
      return res.json({ name: 'Africa Medium Clinic', address: '', contact: '', email: '' });
    }
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/clinic-info", async (req, res) => {
  const { name, address, contact, email, logo_url } = req.body;
  try {
    const check = await pool.query("SELECT id FROM clinic_info LIMIT 1");
    if (check.rows.length > 0) {
      await pool.query(
        "UPDATE clinic_info SET name = $1, address = $2, contact = $3, email = $4, logo_url = $5, updated_at = NOW() WHERE id = $6",
        [name, address, contact, email, logo_url, check.rows[0].id]
      );
    } else {
      await pool.query(
        "INSERT INTO clinic_info (name, address, contact, email, logo_url) VALUES ($1, $2, $3, $4, $5)",
        [name, address, contact, email, logo_url]
      );
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Vitals & Triage
app.get("/api/vitals/:patientId", async (req, res) => {
  const { patientId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM vitals WHERE patient_id = $1 ORDER BY timestamp DESC", [patientId]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/vitals", async (req, res) => {
  const { patient_id, nurse_id, temperature, blood_pressure, heart_rate, respiratory_rate, weight, height, pulse, triage_category } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO vitals (patient_id, nurse_id, temperature, blood_pressure, heart_rate, respiratory_rate, weight, height, pulse, triage_category)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      [patient_id, nurse_id, temperature, blood_pressure, heart_rate, respiratory_rate, weight, height, pulse, triage_category]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Prescriptions
app.get("/api/prescriptions", async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT pr.*, p.full_name as patient_name, u.full_name as doctor_name 
        FROM prescriptions pr
        JOIN patients p ON pr.patient_id = p.id
        JOIN users u ON pr.doctor_id = u.id
      `);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get prescriptions pending dispensing (linked to paid bills)
app.get("/api/prescriptions/pending", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, pt.full_name as patient_name 
      FROM prescriptions p
      JOIN patients pt ON p.patient_id = pt.id
      JOIN billing b ON b.patient_id = pt.id
      WHERE b.status = 'paid' AND p.status = 'prescribed'
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/prescriptions/:id/dispense", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE prescriptions SET status = 'dispensed' WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.post("/api/prescriptions", async (req, res) => {
  const { patient_id, doctor_id, medication, dosage, instructions } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO prescriptions (patient_id, doctor_id, medication, dosage, instructions, date)
         VALUES ($1, $2, $3, $4, $5, CURRENT_DATE) RETURNING id`,
      [patient_id, doctor_id, medication, dosage, instructions]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.put("/api/prescriptions/:id/dispense", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE prescriptions SET status = 'dispensed' WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.delete("/api/prescriptions/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM prescriptions WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Inventory Management
app.post("/api/inventory", async (req, res) => {
  const { item_name, category, quantity, unit, expiry_date } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO inventory (item_name, category, quantity, unit, expiry_date) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [item_name, category, quantity, unit, expiry_date]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.put("/api/inventory/:id", async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  try {
    await pool.query("UPDATE inventory SET quantity = $1 WHERE id = $2", [quantity, id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Reports
app.get("/api/reports/summary", async (req, res) => {
  try {
    const patientCount = await pool.query("SELECT COUNT(*) as count FROM patients");
    const appointmentCount = await pool.query("SELECT COUNT(*) as count FROM appointments WHERE date = CURRENT_DATE::text");
    const revenue = await pool.query("SELECT SUM(amount) as total FROM billing WHERE status = 'paid'");
    const labOrders = await pool.query("SELECT COUNT(*) as count FROM lab_orders WHERE status = 'pending'");

    // Monthly revenue for chart
    const monthlyRevenue = await pool.query(`
        SELECT to_char(paid_at, 'YYYY-MM') as month, SUM(amount) as total 
        FROM billing 
        WHERE status = 'paid' AND paid_at IS NOT NULL
        GROUP BY month 
        ORDER BY month DESC 
        LIMIT 6
      `);

    res.json({
      stats: {
        patients: parseInt(patientCount.rows[0].count),
        todayAppointments: parseInt(appointmentCount.rows[0].count),
        totalRevenue: parseFloat(revenue.rows[0].total) || 0,
        pendingLabs: parseInt(labOrders.rows[0].count)
      },
      monthlyRevenue: monthlyRevenue.rows
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/reports/beds", async (req, res) => {
  try {
    const summary = await pool.query(`
        SELECT status, COUNT(*) as count 
        FROM beds 
        GROUP BY status
      `);

    const byRoom = await pool.query(`
        SELECT room_number, 
               SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied,
               SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
               SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
               COUNT(*) as total
        FROM beds 
        GROUP BY room_number
        ORDER BY room_number
      `);

    res.json({ success: true, summary: summary.rows, byRoom: byRoom.rows });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post("/api/patients", async (req, res) => {
  const {
    full_name, dob, gender, address, contact, blood_group, current_status,
    region, zone_subcity, woreda, kebele, house_number, payment_type,
    is_new_patient, disability_status, registration_date_ec
  } = req.body;

  try {
    // Basic MRN generation: AMC-YEAR-RANDOM
    const year = new Date().getFullYear();
    const randomPart = Math.floor(100000 + Math.random() * 900000); // 6-digit
    const mrn = `AMC-${year}-${randomPart}`;

    const result = await pool.query(
      `INSERT INTO patients (
        full_name, dob, gender, address, contact, blood_group, current_status,
        mrn, region, zone_subcity, woreda, kebele, house_number, payment_type,
        is_new_patient, disability_status, registration_date_ec
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING id, mrn`,
      [
        full_name, dob, gender, address, contact, blood_group, current_status || 'triage',
        mrn, region, zone_subcity, woreda, kebele, house_number, payment_type,
        is_new_patient ?? true, disability_status, registration_date_ec
      ]
    );
    res.json({ success: true, id: result.rows[0].id, mrn: result.rows[0].mrn });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.put("/api/patients/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query("UPDATE patients SET current_status = $1 WHERE id = $2", [status, id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.put("/api/patients/:id", async (req, res) => {
  const { id } = req.params;
  const {
    full_name, dob, gender, address, contact, blood_group,
    region, zone_subcity, woreda, kebele, house_number, payment_type,
    is_new_patient, disability_status, registration_date_ec
  } = req.body;
  try {
    await pool.query(
      `UPDATE patients SET 
        full_name = $1, dob = $2, gender = $3, address = $4, contact = $5, blood_group = $6,
        region = $8, zone_subcity = $9, woreda = $10, kebele = $11, house_number = $12, 
        payment_type = $13, is_new_patient = $14, disability_status = $15, registration_date_ec = $16
      WHERE id = $7`,
      [
        full_name, dob, gender, address, contact, blood_group, id,
        region, zone_subcity, woreda, kebele, house_number, payment_type,
        is_new_patient, disability_status, registration_date_ec
      ]
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});


app.put("/api/patients/:id/route", async (req, res) => {
  const { id } = req.params;
  const { assigned_staff_id, status } = req.body;
  console.log(`[ROUTE] Routing patient ${id} to staff ${assigned_staff_id} with status ${status}`);
  try {
    const result = await pool.query(
      "UPDATE patients SET assigned_staff_id = $1, current_status = $2 WHERE id = $3 RETURNING *",
      [assigned_staff_id, status || 'triage', id]
    );
    if (result.rows.length === 0) {
      console.warn(`[ROUTE] Patient ${id} not found`);
      return res.status(404).json({ success: false, message: "Patient not found" });
    }
    console.log(`[ROUTE] Successfully routed patient ${id}`);
    res.json({ success: true, patient: result.rows[0] });
  } catch (error: any) {
    console.error(`[ROUTE] Error routing patient ${id}:`, error.message);
    res.status(400).json({ success: false, message: error.message });
  }
});

app.get("/api/patients", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM patients ORDER BY created_at DESC, id DESC");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Appointments
app.get("/api/appointments", async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT a.*, p.full_name as patient_name, u.full_name as doctor_name 
        FROM appointments a
        JOIN patients p ON a.patient_id = p.id
        JOIN users u ON a.doctor_id = u.id
      `);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/appointments/patient/:patientId", async (req, res) => {
  const { patientId } = req.params;
  try {
    const result = await pool.query(`
        SELECT a.*, u.full_name as doctor_name 
        FROM appointments a
        JOIN users u ON a.doctor_id = u.id
        WHERE a.patient_id = $1
        ORDER BY date DESC, time DESC
      `, [patientId]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/appointments", async (req, res) => {
  const { patient_id, doctor_id, date, time, reason, status } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO appointments (patient_id, doctor_id, date, time, reason, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [patient_id, doctor_id, date, time, reason, status || 'scheduled']
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.put("/api/appointments/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query("UPDATE appointments SET status = $1 WHERE id = $2", [status, id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/public/book-appointment", async (req, res) => {
  const { full_name, contact, date, time, reason } = req.body;
  try {
    // 1. Find or create patient
    const patientResult = await pool.query("SELECT id FROM patients WHERE contact = $1", [contact]);
    let patientId;

    if (patientResult.rows.length === 0) {
      const newPatient = await pool.query(
        "INSERT INTO patients (full_name, contact, current_status) VALUES ($1, $2, 'triage') RETURNING id",
        [full_name, contact]
      );
      patientId = newPatient.rows[0].id;
    } else {
      patientId = patientResult.rows[0].id;
      await pool.query("UPDATE patients SET current_status = 'triage' WHERE id = $1", [patientId]);
    }

    // 2. Find a doctor
    const doctorResult = await pool.query("SELECT id FROM users WHERE role = 'doctor' LIMIT 1");
    if (doctorResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: "No doctors available" });
    }
    const doctor = doctorResult.rows[0];

    // 3. Create appointment
    const result = await pool.query(
      "INSERT INTO appointments (patient_id, doctor_id, date, time, reason) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [patientId, doctor.id, date, time, reason]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Lab Orders (Enhanced)
app.get("/api/lab-orders", async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT l.*, p.full_name as patient_name, u.full_name as doctor_name 
        FROM lab_orders l
        JOIN patients p ON l.patient_id = p.id
        JOIN users u ON l.doctor_id = u.id
        ORDER BY l.ordered_at DESC
      `);

    // Fetch items for each order
    const orders = result.rows;
    for (const order of orders) {
      const itemsResult = await pool.query("SELECT * FROM lab_order_items WHERE order_id = $1", [order.id]);
      order.items = itemsResult.rows;
    }

    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/lab-orders/pending", async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT l.*, p.full_name as patient_name, u.full_name as doctor_name 
        FROM lab_orders l
        JOIN patients p ON l.patient_id = p.id
        JOIN users u ON l.doctor_id = u.id
        WHERE l.status != 'completed'
        ORDER BY l.ordered_at ASC
      `);

    const orders = result.rows;
    for (const order of orders) {
      const itemsResult = await pool.query("SELECT * FROM lab_order_items WHERE order_id = $1", [order.id]);
      order.items = itemsResult.rows;
    }

    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/lab-orders/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
        SELECT l.*, p.full_name as patient_name, u.full_name as doctor_name 
        FROM lab_orders l
        JOIN patients p ON l.patient_id = p.id
        JOIN users u ON l.doctor_id = u.id
        WHERE l.id = $1
      `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const order = result.rows[0];
    const itemsResult = await pool.query("SELECT * FROM lab_order_items WHERE order_id = $1", [order.id]);
    order.items = itemsResult.rows;

    res.json(order);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Lab Tests Master List
app.get("/api/lab-tests", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM lab_tests ORDER BY category ASC, name ASC");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/lab-orders", async (req, res) => {
  const { patient_id, doctor_id, test_ids, test_type } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create the master order
    const orderResult = await client.query(
      "INSERT INTO lab_orders (patient_id, doctor_id, test_type, status) VALUES ($1, $2, $3, 'pending') RETURNING id",
      [patient_id, doctor_id, test_type || 'Multiple Tests']
    );
    const orderId = orderResult.rows[0].id;

    // Create order items
    if (test_ids && Array.isArray(test_ids)) {
      for (const testId of test_ids) {
        // Fetch test name for denormalization
        const testInfo = await client.query("SELECT name FROM lab_tests WHERE id = $1", [testId]);
        if (testInfo.rows.length > 0) {
          await client.query(
            "INSERT INTO lab_order_items (order_id, test_id, test_name, status) VALUES ($1, $2, $3, 'pending')",
            [orderId, testId, testInfo.rows[0].name]
          );
        }
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, id: orderId });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(400).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
});

app.put("/api/lab-orders/:id/results", async (req, res) => {
  const { id } = req.params;
  const { items, lab_tech_id, status } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Update individual items
    if (items && Array.isArray(items)) {
      for (const item of items) {
        await client.query(
          "UPDATE lab_order_items SET result = $1, status = 'completed', completed_at = NOW() WHERE id = $2",
          [item.result, item.id]
        );
      }
    }

    // Update master order status
    await client.query(
      "UPDATE lab_orders SET status = $1, lab_tech_id = $2, completed_at = NOW() WHERE id = $3",
      [status || 'completed', lab_tech_id, id]
    );

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(400).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
});

// Legacy Lab Test Types
app.get("/api/lab-test-types", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM lab_test_types ORDER BY name ASC");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/lab-orders/patient/:patientId", async (req, res) => {
  const { patientId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM lab_orders WHERE patient_id = $1 ORDER BY ordered_at DESC", [patientId]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Bed Management
app.get("/api/beds", async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT b.*, p.full_name as patient_name 
        FROM beds b
        LEFT JOIN patients p ON b.patient_id = p.id
      `);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/beds/:id", async (req, res) => {
  const { id } = req.params;
  const { status, patient_id } = req.body;
  try {
    await pool.query("UPDATE beds SET status = $1, patient_id = $2 WHERE id = $3", [status, patient_id, id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post("/api/beds", async (req, res) => {
  const { room_number, bed_number } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO beds (room_number, bed_number) VALUES ($1, $2) RETURNING id",
      [room_number, bed_number]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Inventory
app.get("/api/inventory", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM inventory");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Billing
app.get("/api/billing", async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT b.*, p.full_name as patient_name 
        FROM billing b
        JOIN patients p ON b.patient_id = p.id
        ORDER BY b.created_at DESC
      `);

    // Fetch items for each bill
    const bills = result.rows;
    for (const bill of bills) {
      const itemsResult = await pool.query("SELECT * FROM bill_items WHERE bill_id = $1", [bill.id]);
      bill.items = itemsResult.rows;
    }

    res.json(bills);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/billing", async (req, res) => {
  const { patient_id, amount, description, items } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const billResult = await client.query(
      "INSERT INTO billing (patient_id, amount, description) VALUES ($1, $2, $3) RETURNING id",
      [patient_id, amount, description]
    );
    const billId = billResult.rows[0].id;

    if (items && Array.isArray(items)) {
      for (const item of items) {
        await client.query(
          "INSERT INTO bill_items (bill_id, description, amount) VALUES ($1, $2, $3)",
          [billId, item.description, item.amount]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, id: billId });
  } catch (error: any) {
    await client.query('ROLLBACK');
    res.status(400).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
});

// Referrals
app.get("/api/referrals/patient/:patientId", async (req, res) => {
  const { patientId } = req.params;
  try {
    const result = await pool.query(`
      SELECT r.*, u.full_name as doctor_name 
      FROM referrals r
      LEFT JOIN users u ON r.doctor_id = u.id
      WHERE r.patient_id = $1
      ORDER BY r.created_at DESC
    `, [patientId]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/referrals", async (req, res) => {
  const { patient_id, doctor_id, referred_to, reason, diagnosis, clinical_summary, treatment } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO referrals (patient_id, doctor_id, referred_to, reason, diagnosis, clinical_summary, treatment) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
      [patient_id, doctor_id, referred_to, reason, diagnosis, clinical_summary, treatment || '']
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Medical Certificates
app.get("/api/medical-certificates/patient/:patientId", async (req, res) => {
  const { patientId } = req.params;
  try {
    const result = await pool.query(`
      SELECT m.*, u.full_name as doctor_name 
      FROM medical_certificates m
      LEFT JOIN users u ON m.doctor_id = u.id
      WHERE m.patient_id = $1
      ORDER BY m.created_at DESC
    `, [patientId]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/medical-certificates", async (req, res) => {
  const { patient_id, doctor_id, diagnosis, recommendation, rest_days, start_date } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO medical_certificates (patient_id, doctor_id, diagnosis, recommendation, rest_days, start_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [patient_id, doctor_id, diagnosis, recommendation, rest_days, start_date]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.put("/api/billing/:id/pay", async (req, res) => {
  const { id } = req.params;
  const { cashier_id } = req.body;
  try {
    await pool.query("UPDATE billing SET status = 'paid', cashier_id = $1, paid_at = NOW() WHERE id = $2", [cashier_id, id]);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Dashboard Statistics
app.get("/api/stats", async (req, res) => {
  try {
    const [patients, appointments, labOrders, lowStock, revenue] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM patients"),
      pool.query("SELECT COUNT(*) FROM appointments WHERE date = CURRENT_DATE"),
      pool.query("SELECT COUNT(*) FROM lab_orders WHERE status != 'completed'"),
      pool.query("SELECT COUNT(*) FROM inventory WHERE quantity < 20"),
      pool.query("SELECT SUM(total_amount) FROM billing WHERE status = 'paid'")
    ]);

    res.json({
      totalPatients: parseInt(patients.rows[0].count),
      todayAppointments: parseInt(appointments.rows[0].count),
      pendingLabOrders: parseInt(labOrders.rows[0].count),
      lowStockItems: parseInt(lowStock.rows[0].count),
      totalRevenue: parseFloat(revenue.rows[0].sum || 0)
    });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Medical Certificates
app.get("/api/medical-certificates/patient/:patientId", async (req, res) => {
  const { patientId } = req.params;
  try {
    const result = await pool.query(`
        SELECT m.*, u.full_name as doctor_name 
        FROM medical_certificates m
        JOIN users u ON m.doctor_id = u.id
        WHERE m.patient_id = $1
        ORDER BY m.created_at DESC
      `, [patientId]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/medical-certificates", async (req, res) => {
  const { patient_id, doctor_id, diagnosis, recommendation, rest_days, start_date } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO medical_certificates (patient_id, doctor_id, diagnosis, recommendation, rest_days, start_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
      [patient_id, doctor_id, diagnosis, recommendation, rest_days, start_date]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Referrals
app.get("/api/referrals/patient/:patientId", async (req, res) => {
  const { patientId } = req.params;
  try {
    const result = await pool.query(`
        SELECT r.*, u.full_name as doctor_name 
        FROM referrals r
        JOIN users u ON r.doctor_id = u.id
        WHERE r.patient_id = $1
        ORDER BY r.created_at DESC
      `, [patientId]);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/referrals", async (req, res) => {
  const { patient_id, doctor_id, referred_to, reason, diagnosis, clinical_summary, treatment } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO referrals (patient_id, doctor_id, referred_to, reason, diagnosis, clinical_summary, treatment) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
      [patient_id, doctor_id, referred_to, reason, diagnosis, clinical_summary, treatment]
    );
    res.json({ success: true, id: result.rows[0].id });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

async function startServer() {
  // Serve Static Files for SPA (dist folder after build)
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  } else {
    // Vite middleware for development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  const PORT = parseInt(process.env.PORT || '3000');
  const server = app.listen(PORT, "0.0.0.0", async () => {
    await initDb();
    console.log(`Server running on http://localhost:${PORT}`);
  });
  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${PORT} is in use, trying port ${PORT + 1}...`);
      app.listen(PORT + 1, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT + 1}`);
      });
    } else {
      console.error('Server error:', err);
    }
  });
}

if (process.env.VERCEL) {
  // On Vercel, we don't call app.listen but we still need to init the DB
  console.log("⚡ VITE_SUPABASE_URL: " + (process.env.VITE_SUPABASE_URL ? 'SET' : 'NOT SET'));
  initDb().then(() => console.log("✅ Vercel DB Init Complete")).catch(err => console.error("❌ Vercel DB Init Error:", err));
}

if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  startServer();
}

export default app;
