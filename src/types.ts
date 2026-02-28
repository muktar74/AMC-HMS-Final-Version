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
  test_type: string;
  status: 'pending' | 'processing' | 'completed';
  results?: string;
  ordered_at: string;
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
