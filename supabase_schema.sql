-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL, -- admin, doctor, nurse, etc.
  full_name TEXT,
  contact TEXT
);

-- Create Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  dob DATE,
  gender TEXT,
  address TEXT,
  contact TEXT,
  blood_group TEXT,
  current_status TEXT DEFAULT 'registered',
  mrn TEXT UNIQUE, -- Medical Record Number
  region TEXT,
  zone_subcity TEXT,
  woreda TEXT,
  kebele TEXT,
  house_number TEXT,
  payment_type TEXT, -- 1=CBHI, 2=Credit, 3=Cash, 4=Exempted, 5=Fee
  is_new_patient BOOLEAN DEFAULT TRUE,
  disability_status TEXT,
  registration_date_ec TEXT, -- Ethiopian Calendar Date
  assigned_staff_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT DEFAULT 'scheduled', -- scheduled, completed, cancelled
  reason TEXT
);

-- Create Vitals Table
CREATE TABLE IF NOT EXISTS vitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  nurse_id UUID REFERENCES users(id) ON DELETE SET NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  temperature REAL,
  blood_pressure TEXT,
  heart_rate INTEGER,
  respiratory_rate INTEGER,
  weight REAL,
  height REAL,
  pulse INTEGER,
  triage_category TEXT -- green, yellow, red
);

-- Create Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  medication TEXT NOT NULL,
  dosage TEXT,
  instructions TEXT,
  status TEXT DEFAULT 'pending' -- pending, dispensed
);

-- Create Lab Orders Table
CREATE TABLE IF NOT EXISTS lab_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  lab_tech_id UUID REFERENCES users(id) ON DELETE SET NULL,
  test_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, completed
  results TEXT,
  ordered_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create Beds Table
CREATE TABLE IF NOT EXISTS beds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_number TEXT NOT NULL,
  bed_number TEXT NOT NULL,
  status TEXT DEFAULT 'available', -- available, occupied, maintenance
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL
);

-- Create Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER NOT NULL,
  unit TEXT,
  expiry_date DATE
);

-- Create Billing Table
CREATE TABLE IF NOT EXISTS billing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  cashier_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount REAL NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'unpaid', -- unpaid, paid
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

-- Create Clinical Notes Table
CREATE TABLE IF NOT EXISTS clinical_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT NOT NULL,
  chief_complaint TEXT,
  hpi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Lab Test Types Table (Legacy/General)
CREATE TABLE IF NOT EXISTS lab_test_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  required_sample TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Master list of lab tests
CREATE TABLE IF NOT EXISTS lab_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL, -- Hematology, Urinalysis, etc.
  name TEXT NOT NULL,
  unit TEXT,
  reference_range TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual items in a lab order
CREATE TABLE IF NOT EXISTS lab_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES lab_orders(id) ON DELETE CASCADE,
  test_id UUID REFERENCES lab_tests(id),
  test_name TEXT, -- Denormalized for convenience
  result TEXT,
  status TEXT DEFAULT 'pending', -- pending, completed
  completed_at TIMESTAMPTZ
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_test_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users
CREATE POLICY "Allow admin to manage users" ON users FOR ALL
  USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Allow users to view their own data" ON users FOR SELECT
  USING (id = (auth.jwt()->>'sub')::uuid);

-- RLS Policies for Patients
CREATE POLICY "Allow admin and receptionist to manage patients" ON patients FOR ALL
  USING (auth.jwt()->>'role' IN ('admin', 'receptionist'));
CREATE POLICY "Allow doctors and nurses to view patients" ON patients FOR SELECT
  USING (auth.jwt()->>'role' IN ('doctor', 'nurse'));

-- RLS Policies for Appointments
CREATE POLICY "Allow admin and receptionist to manage appointments" ON appointments FOR ALL
  USING (auth.jwt()->>'role' IN ('admin', 'receptionist'));
CREATE POLICY "Allow doctors to view their appointments" ON appointments FOR SELECT
  USING (doctor_id = (auth.jwt()->>'sub')::uuid);

-- Create Visits Table
CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  visit_date DATE DEFAULT CURRENT_DATE,
  reason TEXT,
  diagnosis TEXT,
  treatment TEXT,
  notes TEXT,
  chief_complaint TEXT,
  hpi TEXT, -- History of Present Illness
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Bill Items Table
CREATE TABLE IF NOT EXISTS bill_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id UUID REFERENCES billing(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Clinic Info Table
CREATE TABLE IF NOT EXISTS clinic_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'Africa Medium Clinic',
  address TEXT,
  contact TEXT,
  email TEXT,
  logo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for new tables
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_info ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Visits
CREATE POLICY "Allow doctors and nurses to manage visits" ON visits FOR ALL
  USING (auth.jwt()->>'role' IN ('doctor', 'nurse', 'admin'));

-- RLS Policies for Bill Items
CREATE POLICY "Allow admin and cashier to manage bill items" ON bill_items FOR ALL
  USING (auth.jwt()->>'role' IN ('admin', 'cashier'));

-- RLS Policies for Clinic Info
CREATE POLICY "Allow anyone to view clinic info" ON clinic_info FOR SELECT
  USING (true);
CREATE POLICY "Allow admin to manage clinic info" ON clinic_info FOR ALL
  USING (auth.jwt()->>'role' = 'admin');

-- Create Referrals Table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  referred_to TEXT NOT NULL, -- hospital name or 'abroad'
  reason TEXT,
  diagnosis TEXT,
  clinical_summary TEXT,
  treatment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Medical Certificates Table
CREATE TABLE IF NOT EXISTS medical_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  diagnosis TEXT,
  recommendation TEXT,
  rest_days INTEGER,
  start_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for new tables
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Referrals
CREATE POLICY "Allow doctors to manage referrals" ON referrals FOR ALL
  USING (auth.jwt()->>'role' IN ('doctor', 'admin'));
CREATE POLICY "Allow anyone to view referrals" ON referrals FOR SELECT
  USING (true);

-- RLS Policies for Medical Certificates
CREATE POLICY "Allow doctors to manage medical certificates" ON medical_certificates FOR ALL
  USING (auth.jwt()->>'role' IN ('doctor', 'admin'));
CREATE POLICY "Allow anyone to view medical certificates" ON medical_certificates FOR SELECT
  USING (true);

-- RLS Policies for Lab Tests (Read-only for most, manage for admin)
CREATE POLICY "Allow authenticated to view lab tests" ON lab_tests FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin to manage lab tests" ON lab_tests FOR ALL
  USING (auth.jwt()->>'role' = 'admin');

-- RLS Policies for Lab Order Items
CREATE POLICY "Allow medical staff to manage lab items" ON lab_order_items FOR ALL
  USING (auth.jwt()->>'role' IN ('doctor', 'lab_tech', 'admin'));
CREATE POLICY "Allow authenticated to view lab items" ON lab_order_items FOR SELECT
  USING (auth.role() = 'authenticated');

-- RLS Policies for Lab Test Types
CREATE POLICY "Allow authenticated to view lab test types" ON lab_test_types FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin to manage lab test types" ON lab_test_types FOR ALL
  USING (auth.jwt()->>'role' = 'admin');
