export type Role = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'pharmacist' | 'lab_tech' | 'cashier' | 'patient';

export interface User {
  id: string;
  username: string;
  role: Role;
  full_name: string;
  contact?: string;
}

export interface Patient {
  id: string;
  user_id?: string;
  full_name: string;
  dob: string;
  gender: string;
  address: string;
  contact: string;
  blood_group: string;
  current_status?: string;
  mrn?: string;
  region?: string;
  zone_subcity?: string;
  woreda?: string;
  kebele?: string;
  house_number?: string;
  payment_type?: string;
  is_new_patient?: boolean;
  disability_status?: string;
  registration_date_ec?: string;
  assigned_staff_id?: string;
  visits?: Visit[];
}

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  reason: string;
}

export interface LabOrder {
  id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  lab_tech_id?: string;
  test_type?: string; // Kept for legacy compatibility
  status: 'pending' | 'processing' | 'completed';
  results?: string; // Summary of results
  ordered_at: string;
  completed_at?: string;
  items?: LabOrderItem[];
}

export interface LabTest {
  id: string;
  category: string;
  name: string;
  unit?: string;
  reference_range?: string;
}

export interface LabOrderItem {
  id: string;
  order_id: string;
  test_id: string;
  test_name: string;
  result?: string;
  status: 'pending' | 'completed';
  completed_at?: string;
}

export interface Bed {
  id: string;
  room_number: string;
  bed_number: string;
  status: 'available' | 'occupied' | 'maintenance';
  patient_id?: string;
  patient_name?: string;
}

export interface InventoryItem {
  id: string;
  item_name: string;
  category: string;
  quantity: number;
  unit: string;
  expiry_date: string;
}

export interface Visit {
  id: string;
  patient_id: string;
  visit_date: string;
  reason: string;
  diagnosis?: string;
  treatment?: string;
  assigned_to_user_id?: string;
  assigned_to_user_name?: string;
  status: 'pending' | 'in-progress' | 'completed';
  notes?: string;
  chief_complaint?: string;
  hpi?: string;
}

export interface Vitals {
  id: string;
  patient_id: string;
  nurse_id: string;
  timestamp: string;
  temperature: number;
  blood_pressure: string;
  heart_rate: number;
  respiratory_rate: number;
  weight: number;
  height: number;
  pulse?: number;
  triage_category: string;
}

export interface BillItem {
  description: string;
  amount: number;
}

export interface Bill {
  id: string;
  patient_id: string;
  patient_name: string;
  cashier_id?: string;
  amount: number;
  items: BillItem[];
  status: 'unpaid' | 'paid';
  created_at: string;
  paid_at?: string;
}

export interface Referral {
  id: string;
  patient_id: string;
  doctor_id: string;
  doctor_name: string;
  referred_to: string;
  reason: string;
  diagnosis: string;
  clinical_summary: string;
  treatment: string;
  created_at: string;
}

export interface MedicalCertificate {
  id: string;
  patient_id: string;
  doctor_id: string;
  doctor_name: string;
  diagnosis: string;
  recommendation: string;
  rest_days: number;
  start_date: string;
  created_at: string;
}

export interface ClinicalNote {
  id: string;
  patient_id: string;
  doctor_id: string;
  doctor_name?: string;
  notes: string;
  chief_complaint?: string;
  hpi?: string;
  created_at: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  patient_name?: string;
  doctor_id: string;
  doctor_name?: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  status: 'pending' | 'dispensed' | 'cancelled';
  created_at: string;
}
