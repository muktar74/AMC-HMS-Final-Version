# PostgreSQL Database Setup Guide

This guide provides step-by-step instructions to set up the PostgreSQL database for the Africa Medium Clinic HMS.

## Prerequisites
- PostgreSQL installed on your computer.
- `psql` command-line tool or a GUI like pgAdmin.

## Step 1: Create the Database

Open your PostgreSQL terminal (`psql`) and run:

```sql
CREATE DATABASE clinic_hms;
\c clinic_hms;
```

## Step 2: Create Tables

Run the following SQL queries to create the necessary tables.

### 1. Users Table
Stores all system users (admin, doctors, nurses, etc.)

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    contact VARCHAR(255)
);
```

### 2. Patients Table
Stores patient records.

```sql
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    full_name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(50) NOT NULL,
    address TEXT,
    contact VARCHAR(255),
    blood_group VARCHAR(10),
    current_status VARCHAR(50) DEFAULT 'registered'
);
```

### 3. Appointments Table
Stores patient appointments with doctors.

```sql
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    doctor_id INTEGER REFERENCES users(id),
    date DATE NOT NULL,
    time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    reason TEXT
);
```

### 4. Vitals Table
Stores patient vitals taken during triage.

```sql
CREATE TABLE vitals (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    nurse_id INTEGER REFERENCES users(id),
    temperature VARCHAR(50),
    blood_pressure VARCHAR(50),
    heart_rate VARCHAR(50),
    respiratory_rate VARCHAR(50),
    weight VARCHAR(50),
    height VARCHAR(50),
    triage_category VARCHAR(50),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Prescriptions Table
Stores prescriptions given by doctors.

```sql
CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    doctor_id INTEGER REFERENCES users(id),
    medication VARCHAR(255) NOT NULL,
    dosage VARCHAR(255) NOT NULL,
    instructions TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. Lab Orders Table
Stores laboratory test orders and results.

```sql
CREATE TABLE lab_orders (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    doctor_id INTEGER REFERENCES users(id),
    lab_tech_id INTEGER REFERENCES users(id),
    test_type VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    results TEXT,
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);
```

### 7. Beds Table
Stores hospital bed allocations.

```sql
CREATE TABLE beds (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(50) NOT NULL,
    bed_number VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'available',
    patient_id INTEGER REFERENCES patients(id)
);
```

### 8. Billing Table
Stores patient invoices and payments.

```sql
CREATE TABLE billing (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id),
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Step 3: Seed Initial Admin User

To log into the system for the first time, you need an admin account. Note: In a real application, passwords should be hashed (e.g., using bcrypt). For this setup, ensure your backend hashes the password before inserting, or use a pre-hashed password.

```sql
-- Replace 'hashed_password_here' with an actual bcrypt hash of 'admin123'
INSERT INTO users (username, password, role, full_name) 
VALUES ('admin', 'hashed_password_here', 'admin', 'System Administrator');
```
