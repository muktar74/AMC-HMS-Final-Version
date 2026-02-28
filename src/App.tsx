import React, { useState, useEffect } from 'react';
import {
  Users, UserCircle, Calendar, ClipboardList, Activity, FlaskConical, Pill, CreditCard,
  LayoutDashboard, LogOut, Plus, Search, Bed as BedIcon, Stethoscope, Package, History, CheckCircle2,
  Clock, FilePen, AlertCircle, Menu, X, ChevronRight, ChevronDown, TrendingUp, FileText, Printer, Save,
  HeartPulse, Globe, MapPin, Phone, Mail, Eye, EyeOff, Key, Trash2, Edit, UserPlus, CalendarPlus, FileBarChart,
  Facebook, Twitter, Instagram, Send, Settings, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PatientDetailView from './components/PatientDetailView';
import CreateInvoiceModal from './components/CreateInvoiceModal';
import BookAppointmentModal from './components/BookAppointmentModal';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { supabase } from './supabaseClient';
import { User, Role, Patient, Appointment, LabOrder, Bed as BedType, InventoryItem, Bill } from './types';

import { validatePhone, validateName, validateBirthDate, validateRequired } from './utils/validation';

// --- Components ---

const Card: React.FC<{ title: string, children: React.ReactNode, className?: string }> = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${className}`}>
    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
      <h3 className="font-bold text-slate-800">{title}</h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const Badge = ({ children, variant = 'info' }: { children: React.ReactNode, variant?: 'info' | 'success' | 'warning' | 'danger' }) => {
  const variants = {
    info: 'bg-slate-100 text-slate-600',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700'
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${variants[variant]}`}>
      {children}
    </span>
  );
};

const SidebarItem: React.FC<{ icon: any, label: string, active: boolean, onClick: () => void }> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
      ? 'bg-emerald-50 text-emerald-700 font-bold shadow-sm'
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-medium'
      }`}
  >
    <div className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-emerald-100 text-emerald-600' : 'bg-transparent text-slate-400 group-hover:text-slate-600'}`}>
      <Icon size={18} />
    </div>
    <span className="text-sm">{label}</span>
    {active && (
      <motion.div
        layoutId="active-indicator"
        className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"
      />
    )}
  </button>
);

const LandingPage = ({ onLoginClick, clinicInfo }: { onLoginClick: () => void, clinicInfo: any }) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    full_name: '',
    contact: '',
    date: '',
    time: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!validateRequired(bookingData.full_name)) newErrors.full_name = 'Full name is required';
    else if (!validateName(bookingData.full_name)) newErrors.full_name = 'Name should only contain letters';

    if (!validateRequired(bookingData.contact)) newErrors.contact = 'Contact number is required';
    else if (!validatePhone(bookingData.contact)) newErrors.contact = 'Invalid Ethiopian phone number (e.g. 0912345678)';

    if (!validateRequired(bookingData.date)) newErrors.date = 'Date is required';
    if (!validateRequired(bookingData.time)) newErrors.time = 'Time is required';
    if (!validateRequired(bookingData.reason)) newErrors.reason = 'Reason is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/public/book-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Appointment booked successfully!');
        setIsBookingModalOpen(false);
        setBookingData({ full_name: '', contact: '', date: '', time: '', reason: '' });
      } else {
        alert(data.message || 'Error booking appointment');
      }
    } catch (err) {
      alert('Error booking appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 text-emerald-600">
            <Stethoscope size={32} />
            <span className="text-xl font-bold tracking-tight text-slate-900">{clinicInfo?.name || 'Africa Medium Clinic'}</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#services" className="hover:text-emerald-600 transition-colors">Services</a>
            <a href="#about" className="hover:text-emerald-600 transition-colors">About</a>
            <a href="#doctors" className="hover:text-emerald-600 transition-colors">Doctors</a>
            <a href="#contact" className="hover:text-emerald-600 transition-colors">Contact</a>
            <button
              onClick={onLoginClick}
              className="px-6 py-2.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      <section className="pt-40 pb-20 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <Badge variant="success">Trusted Healthcare in Hasasa, West Arsi</Badge>
            <h1 className="text-6xl lg:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight">
              Advanced Medical <br />
              <span className="text-emerald-600 text-glow">Diagnostic Services</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
              Africa Medium Clinic provides specialized laboratory investigations and comprehensive patient care.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => setIsBookingModalOpen(true)} className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center gap-2">
                Book Appointment <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative">
            <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl rotate-3">
              <img src="/clinic.png" alt="Clinic" className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>
      </section>

      <section id="services" className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="info">Our Expertise</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mt-4 mb-4">Comprehensive Medical Services</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">We offer a wide range of diagnostic and therapeutic services to ensure your health and well-being.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: FlaskConical, title: 'Laboratory', desc: 'Advanced diagnostic testing with state-of-the-art equipment.' },
              { icon: Stethoscope, title: 'General Medicine', desc: 'Comprehensive primary care for all ages.' },
              { icon: Pill, title: 'Pharmacy', desc: 'Fully stocked pharmacy with prescription and OTC medications.' },
              { icon: BedIcon, title: 'Inpatient Care', desc: 'Comfortable wards for patients requiring overnight observation.' },
              { icon: Activity, title: 'Emergency', desc: '24/7 emergency response for critical medical situations.' },
              { icon: HeartPulse, title: 'Specialist Care', desc: 'Access to specialized medical professionals.' }
            ].map((service, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-all border border-slate-100 group">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                  <service.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                <p className="text-slate-500 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden">
              <img src="/doctor.png" alt="Doctor" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-3xl shadow-xl max-w-xs border border-slate-100">
              <p className="text-4xl font-bold text-emerald-600 mb-2">15+</p>
              <p className="font-medium text-slate-900">Years of medical excellence in the community</p>
            </div>
          </div>
          <div className="space-y-8">
            <Badge variant="warning">About Us</Badge>
            <h2 className="text-4xl font-bold text-slate-900">Dedicated to Your Health Journey</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Founded with a mission to provide accessible, high-quality healthcare, Africa Medium Clinic has grown into a leading medical facility in Hasasa, West Arsi. Our team of experienced professionals is committed to patient-centered care.
            </p>
            <ul className="space-y-4">
              {['Experienced Medical Team', 'Modern Laboratory Facilities', 'Patient-Centered Approach', 'Affordable Healthcare'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                  <CheckCircle2 className="text-emerald-500" size={20} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="doctors" className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="info">Our Team</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mt-4 mb-4">Meet Our Specialists</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Dedicated professionals providing the highest standard of care.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Dr. Ukasha', role: 'Chief Medical Officer', spec: 'General Medicine', img: '/doctor.png' },
              { name: 'Dr. Sarah Ahmed', role: 'Senior Consultant', spec: 'Pediatrics', img: '/doctor.png' },
              { name: 'Dr. Michael Bekele', role: 'Specialist', spec: 'Cardiology', img: '/doctor.png' },
              { name: 'Dr. Almaz Tadesse', role: 'Head of Lab', spec: 'Pathology', img: '/doctor.png' }
            ].map((doc, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100 group">
                <div className="aspect-square overflow-hidden bg-slate-100">
                  <img src={doc.img} alt={doc.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{doc.name}</h3>
                  <p className="text-emerald-600 font-medium text-sm mb-3">{doc.role}</p>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Stethoscope size={16} />
                    <span>{doc.spec}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="warning">Get In Touch</Badge>
            <h2 className="text-4xl font-bold text-slate-900 mt-4 mb-4">Contact Information</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">We are here to help you. Reach out to us for any medical inquiries or to book your visit.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                <MapPin size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Location</h3>
              <p className="text-slate-600 leading-relaxed">Hasasa, West Arsi<br />Ethiopia</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                <Phone size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Phone & Email</h3>
              <p className="text-slate-600 mb-1">+251 123 456 789</p>
              <p className="text-slate-600">info@africaclinic.com</p>
              <div className="mt-4 pt-4 border-t border-slate-100 w-full">
                <p className="text-sm font-medium text-slate-500 flex items-center justify-center gap-2">
                  <UserCircle size={16} /> Dr. Ukasha
                </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-6">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Working Hours</h3>
              <p className="text-slate-600 mb-1"><span className="font-semibold">Mon - Sat:</span> 8:00 AM - 8:00 PM</p>
              <p className="text-amber-600 font-medium">Sunday: Emergency Only</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 text-white mb-6">
              <Stethoscope size={32} />
              <span className="text-2xl font-bold">Africa Medium Clinic</span>
            </div>
            <p className="leading-relaxed mb-8 text-sm">
              Providing top-tier medical diagnostics and treatment with care and compassion. Your health is our priority.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all">
                <span className="sr-only">Facebook</span>
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all">
                <span className="sr-only">Instagram</span>
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all">
                <span className="sr-only">Telegram</span>
                <Send size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all">
                <span className="sr-only">Twitter</span>
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-emerald-500 transition-colors">About Us</a></li>
              <li><a href="#doctors" className="hover:text-emerald-500 transition-colors">Our Doctors</a></li>
              <li><a href="#contact" className="hover:text-emerald-500 transition-colors">Contact</a></li>
              <li><button onClick={onLoginClick} className="hover:text-emerald-500 transition-colors text-left">Staff Login</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Our Services</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#services" className="hover:text-emerald-500 transition-colors">Laboratory Diagnostics</a></li>
              <li><a href="#services" className="hover:text-emerald-500 transition-colors">General Medicine</a></li>
              <li><a href="#services" className="hover:text-emerald-500 transition-colors">Pharmacy</a></li>
              <li><a href="#services" className="hover:text-emerald-500 transition-colors">Inpatient Care</a></li>
              <li><a href="#services" className="hover:text-emerald-500 transition-colors">Specialist Consultations</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Emergency & Hours</h4>
            <div className="space-y-4 text-sm">
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <p className="text-rose-400 font-bold mb-1 flex items-center gap-2">
                  <Activity size={16} /> 24/7 Emergency
                </p>
                <p className="text-white text-lg font-medium">+251 123 456 789</p>
              </div>
              <div>
                <p className="font-semibold text-slate-300">Regular Hours:</p>
                <p>Monday - Saturday</p>
                <p className="text-emerald-400">8:00 AM - 8:00 PM</p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} Africa Medium Clinic. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {isBookingModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBookingModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8">
              <button onClick={() => setIsBookingModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Book Appointment</h3>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={bookingData.full_name}
                    onChange={e => setBookingData({ ...bookingData, full_name: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.full_name ? 'border-rose-500' : 'border-slate-200'}`}
                  />
                  {errors.full_name && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.full_name}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Contact"
                    value={bookingData.contact}
                    onChange={e => setBookingData({ ...bookingData, contact: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.contact ? 'border-rose-500' : 'border-slate-200'}`}
                  />
                  {errors.contact && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.contact}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="date"
                      value={bookingData.date}
                      onChange={e => setBookingData({ ...bookingData, date: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.date ? 'border-rose-500' : 'border-slate-200'}`}
                    />
                    {errors.date && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.date}</p>}
                  </div>
                  <div>
                    <input
                      type="time"
                      value={bookingData.time}
                      onChange={e => setBookingData({ ...bookingData, time: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.time ? 'border-rose-500' : 'border-slate-200'}`}
                    />
                    {errors.time && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.time}</p>}
                  </div>
                </div>
                <div>
                  <textarea
                    placeholder="Reason"
                    value={bookingData.reason}
                    onChange={e => setBookingData({ ...bookingData, reason: e.target.value })}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.reason ? 'border-rose-500' : 'border-slate-200'} h-32`}
                  />
                  {errors.reason && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.reason}</p>}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {isSubmitting ? (
                    <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  ) : null}
                  {isSubmitting ? 'Booking...' : 'Book Now'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PatientDetailsModal = ({ patient, onClose, user }: { patient: Patient, onClose: () => void, user: User | null }) => {
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [vitals, setVitals] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState('info');

  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedLabOrder, setSelectedLabOrder] = useState<LabOrder | null>(null);
  const [labResults, setLabResults] = useState('');

  const fetchData = () => {
    fetch(`/api/lab-orders/patient/${patient.id}`).then(res => res.json()).then(data => setLabOrders(Array.isArray(data) ? data : [])).catch(() => { });
    fetch(`/api/vitals/${patient.id}`).then(res => res.json()).then(data => setVitals(Array.isArray(data) ? data : [])).catch(() => { });
    fetch(`/api/appointments/patient/${patient.id}`).then(res => res.json()).then(data => setAppointments(Array.isArray(data) ? data : [])).catch(() => { });
    fetch(`/api/prescriptions/patient/${patient.id}`).then(res => res.json()).then(data => setPrescriptions(Array.isArray(data) ? data : [])).catch(() => { });
    fetch(`/api/notes/patient/${patient.id}`).then(res => res.json()).then(data => setNotes(Array.isArray(data) ? data : [])).catch(() => { });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const recentVitals = vitals[0] || {};
    const appointmentList = appointments.map(a => `<li>${a.date} at ${a.time} - ${a.status} (${a.reason})</li>`).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Patient Summary - ${patient.full_name}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #334155; }
            h1 { color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
            h2 { color: #334155; margin-top: 30px; border-bottom: 1px solid #f1f5f9; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
            .label { font-weight: bold; color: #64748b; font-size: 0.85rem; text-transform: uppercase; }
            .value { font-size: 1.1rem; margin-bottom: 10px; }
            ul { padding-left: 20px; }
            li { margin-bottom: 5px; }
            .footer { margin-top: 50px; font-size: 0.8rem; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Africa Medium Clinic - Patient Summary</h1>
          <div class="grid">
            <div>
              <div class="label">Full Name</div>
              <div class="value">${patient.full_name}</div>
              <div class="label">Patient ID</div>
              <div class="value">${patient.id}</div>
              <div class="label">Date of Birth</div>
              <div class="value">${patient.dob}</div>
            </div>
            <div>
              <div class="label">Gender</div>
              <div class="value">${patient.gender}</div>
              <div class="label">Contact</div>
              <div class="value">${patient.contact}</div>
              <div class="label">Blood Group</div>
              <div class="value">${patient.blood_group || 'N/A'}</div>
            </div>
          </div>

          <h2>Recent Vitals</h2>
          ${vitals.length > 0 ? `
            <div class="grid">
              <div>
                <div class="label">Blood Pressure</div>
                <div class="value">${recentVitals.blood_pressure || 'N/A'}</div>
                <div class="label">Heart Rate</div>
                <div class="value">${recentVitals.heart_rate || 'N/A'} bpm</div>
              </div>
              <div>
                <div class="label">Temperature</div>
                <div class="value">${recentVitals.temperature || 'N/A'} °C</div>
                <div class="label">Triage Category</div>
                <div class="value">${recentVitals.triage_category || 'N/A'}</div>
              </div>
            </div>
          ` : '<p>No vitals recorded.</p>'}

          <h2>Recent Appointments</h2>
          ${appointments.length > 0 ? `<ul>${appointmentList}</ul>` : '<p>No appointments found.</p>'}

          <div class="footer">
            Generated on ${new Date().toLocaleString()}<br>
            Africa Medium Clinic - Quality Healthcare for Everyone
          </div>
          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  useEffect(() => {
    fetchData();
  }, [patient.id]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{patient.full_name}</h3>
            <p className="text-sm text-slate-500">ID: {patient.id} • {patient.gender} • {patient.dob}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Print Summary">
              <Printer size={20} />
            </button>
            {user?.role === 'doctor' && (
              <>
                <button onClick={() => setIsLabModalOpen(true)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1">
                  <Plus size={14} /> Lab Order
                </button>
                <button onClick={() => setIsPrescriptionModalOpen(true)} className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1">
                  <Plus size={14} /> Prescription
                </button>
                <button onClick={() => setIsNoteModalOpen(true)} className="px-3 py-1.5 bg-slate-600 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1">
                  <Plus size={14} /> Note
                </button>
              </>
            )}
            {user?.role === 'nurse' && (
              <button onClick={() => setIsVitalsModalOpen(true)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1">
                <Plus size={14} /> Record Vitals
              </button>
            )}
            {user?.role === 'receptionist' && (
              <button onClick={() => setIsBillModalOpen(true)} className="px-3 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-1">
                <Plus size={14} /> Create Bill
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors ml-2">
              <X size={20} className="text-slate-500" />
            </button>
          </div>
        </div>

        <div className="flex border-b border-slate-100 overflow-x-auto">
          {['info', 'lab', 'vitals', 'prescriptions', 'notes', 'appointments'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 text-sm font-bold capitalize transition-colors whitespace-nowrap ${activeTab === tab ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {tab === 'info' ? 'Patient Info' : tab === 'lab' ? 'Lab Orders' : tab === 'vitals' ? 'Vitals' : tab === 'prescriptions' ? 'Prescriptions' : tab === 'notes' ? 'Clinical Notes' : 'Appointments'}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Contact Number</label>
                  <p className="font-medium text-slate-800">{patient.contact}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Blood Group</label>
                  <p className="font-medium text-slate-800">{patient.blood_group || 'Unknown'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Address</label>
                  <p className="font-medium text-slate-800">{patient.address}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Current Status</label>
                  <Badge variant="info">{patient.current_status || 'Registered'}</Badge>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lab' && (
            <div className="space-y-4">
              {labOrders.length > 0 ? labOrders.map(order => (
                <div key={order.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-800">{order.test_type}</span>
                    <Badge variant={order.status === 'completed' ? 'success' : order.status === 'processing' ? 'warning' : 'info'}>{order.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 mb-2">Ordered on: {new Date(order.ordered_at).toLocaleDateString()}</p>
                  {order.results ? (
                    <div className="mt-2 p-3 bg-white rounded-lg border border-slate-100 text-sm">
                      <span className="font-bold text-slate-700">Results: </span>
                      <span className="text-slate-600">{order.results}</span>
                    </div>
                  ) : (
                    (order.status === 'processing' || order.status === 'pending') && (
                      <button
                        onClick={() => setSelectedLabOrder(order)}
                        className="mt-2 text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                      >
                        <FilePen size={14} /> Enter Results
                      </button>
                    )
                  )}
                </div>
              )) : (
                <p className="text-center text-slate-400 italic py-8">No lab orders found.</p>
              )}
            </div>
          )}

          {activeTab === 'vitals' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setIsVitalsModalOpen(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> Record New Vitals
                </button>
              </div>
              {vitals.length > 0 ? vitals.map(vital => (
                <div key={vital.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-slate-500">{new Date(vital.timestamp).toLocaleString()}</span>
                    <Badge variant={vital.triage_category === 'red' ? 'danger' : vital.triage_category === 'yellow' ? 'warning' : 'success'}>
                      {vital.triage_category || 'Routine'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div><span className="text-slate-500">BP:</span> <span className="font-medium">{vital.blood_pressure}</span></div>
                    <div><span className="text-slate-500">HR:</span> <span className="font-medium">{vital.heart_rate} bpm</span></div>
                    <div><span className="text-slate-500">Temp:</span> <span className="font-medium">{vital.temperature}°C</span></div>
                    <div><span className="text-slate-500">Resp:</span> <span className="font-medium">{vital.respiratory_rate}</span></div>
                    <div><span className="text-slate-500">Weight:</span> <span className="font-medium">{vital.weight} kg</span></div>
                    <div><span className="text-slate-500">Height:</span> <span className="font-medium">{vital.height} cm</span></div>
                  </div>
                </div>
              )) : (
                <p className="text-center text-slate-400 italic py-8">No vitals recorded.</p>
              )}
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              {prescriptions.length > 0 ? prescriptions.map(p => (
                <div key={p.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-slate-800 text-lg">{p.medication_name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={p.status === 'dispensed' ? 'success' : 'warning'}>{p.status}</Badge>
                        <span className="text-xs text-slate-400">{new Date(p.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {p.status === 'pending' && (
                      <button
                        onClick={async () => {
                          const res = await fetch(`/api/prescriptions/${p.id}/dispense`, { method: 'PUT' });
                          if (res.ok) fetchData();
                        }}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Dispense
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="p-2 bg-white rounded-lg border border-slate-100">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Dosage</p>
                      <p className="text-sm font-medium text-slate-700">{p.dosage}</p>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-100">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Frequency</p>
                      <p className="text-sm font-medium text-slate-700">{p.frequency}</p>
                    </div>
                  </div>
                  {p.instructions && (
                    <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <p className="text-[10px] font-bold uppercase text-amber-600 mb-1">Special Instructions</p>
                      <p className="text-sm text-amber-800 italic">"{p.instructions}"</p>
                    </div>
                  )}
                </div>
              )) : (
                <p className="text-center text-slate-400 italic py-8">No prescriptions found.</p>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              {notes.length > 0 ? notes.map(n => (
                <div key={n.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Dr. {n.doctor_name || 'Medical Staff'}</span>
                    <span className="text-xs text-slate-500">{new Date(n.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{n.note_content}</p>
                </div>
              )) : (
                <p className="text-center text-slate-400 italic py-8">No clinical notes found.</p>
              )}
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-4">
              {appointments.length > 0 ? appointments.map(apt => (
                <div key={apt.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-slate-800">{apt.date} at {apt.time}</p>
                      <p className="text-sm text-slate-500">Dr. {(apt as any).doctor_name}</p>
                    </div>
                    <Badge variant={apt.status === 'completed' ? 'success' : apt.status === 'cancelled' ? 'danger' : 'warning'}>{apt.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{apt.reason}</p>
                </div>
              )) : (
                <p className="text-center text-slate-400 italic py-8">No appointments found.</p>
              )}
            </div>
          )}
        </div>

        <AnimatePresence>
          {isLabModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLabModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4">New Lab Order</h3>
                <div className="space-y-4">
                  <input id="test_type" type="text" placeholder="Test Type (e.g. Blood Count, X-Ray)" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                  <div className="flex gap-3">
                    <button onClick={() => setIsLabModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                    <button onClick={async () => {
                      const testType = (document.getElementById('test_type') as HTMLInputElement).value;
                      if (!testType) return;
                      await fetch('/api/lab-orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ patient_id: patient.id, test_type: testType, doctor_id: user?.id })
                      });
                      setIsLabModalOpen(false);
                      fetchData();
                    }} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl">Order</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {isVitalsModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsVitalsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Record Vitals</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input id="bp" type="text" placeholder="BP (e.g. 120/80)" className="px-4 py-3 rounded-xl border border-slate-200" />
                    <input id="hr" type="text" placeholder="HR (bpm)" className="px-4 py-3 rounded-xl border border-slate-200" />
                    <input id="temp" type="text" placeholder="Temp (°C)" className="px-4 py-3 rounded-xl border border-slate-200" />
                    <input id="resp" type="text" placeholder="Resp Rate" className="px-4 py-3 rounded-xl border border-slate-200" />
                    <input id="weight" type="number" placeholder="Weight (kg)" className="px-4 py-3 rounded-xl border border-slate-200" />
                    <input id="height" type="number" placeholder="Height (cm)" className="px-4 py-3 rounded-xl border border-slate-200" />
                  </div>
                  <select id="triage" className="w-full px-4 py-3 rounded-xl border border-slate-200">
                    <option value="green">Routine (Green)</option>
                    <option value="yellow">Urgent (Yellow)</option>
                    <option value="red">Emergency (Red)</option>
                  </select>
                  <div className="flex gap-3">
                    <button onClick={() => setIsVitalsModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                    <button onClick={async () => {
                      const bp = (document.getElementById('bp') as HTMLInputElement).value;
                      const hr = (document.getElementById('hr') as HTMLInputElement).value;
                      const temp = (document.getElementById('temp') as HTMLInputElement).value;
                      const resp = (document.getElementById('resp') as HTMLInputElement).value;
                      const weight = (document.getElementById('weight') as HTMLInputElement).value;
                      const height = (document.getElementById('height') as HTMLInputElement).value;
                      const triage = (document.getElementById('triage') as HTMLSelectElement).value;
                      await fetch('/api/vitals', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          patient_id: patient.id,
                          blood_pressure: bp,
                          heart_rate: hr,
                          temperature: temp,
                          respiratory_rate: resp,
                          weight: weight,
                          height: height,
                          triage_category: triage,
                          nurse_id: user?.id
                        })
                      });
                      setIsVitalsModalOpen(false);
                      fetchData();
                    }} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl">Save</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {selectedLabOrder && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLabOrder(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Enter Lab Results</h3>
                <p className="text-sm text-slate-500 mb-4">Test: {selectedLabOrder.test_type}</p>
                <textarea
                  value={labResults}
                  onChange={(e) => setLabResults(e.target.value)}
                  placeholder="Enter test results..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 h-32 mb-4"
                />
                <div className="flex gap-3">
                  <button onClick={() => setSelectedLabOrder(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                  <button onClick={async () => {
                    await fetch(`/api/lab-orders/${selectedLabOrder.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ results: labResults, status: 'completed' })
                    });
                    setSelectedLabOrder(null);
                    setLabResults('');
                    fetchData();
                  }} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl">Submit</button>
                </div>
              </motion.div>
            </div>
          )}

          {isPrescriptionModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPrescriptionModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4">New Prescription</h3>
                <div className="space-y-4">
                  <input id="med_name" type="text" placeholder="Medication Name" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                  <div className="grid grid-cols-2 gap-4">
                    <input id="dosage" type="text" placeholder="Dosage (e.g. 500mg)" className="px-4 py-3 rounded-xl border border-slate-200" />
                    <input id="freq" type="text" placeholder="Frequency (e.g. 2x daily)" className="px-4 py-3 rounded-xl border border-slate-200" />
                  </div>
                  <textarea id="instr" placeholder="Special Instructions" className="w-full px-4 py-3 rounded-xl border border-slate-200 h-24" />
                  <div className="flex gap-3">
                    <button onClick={() => setIsPrescriptionModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                    <button onClick={async () => {
                      const name = (document.getElementById('med_name') as HTMLInputElement).value;
                      const dosage = (document.getElementById('dosage') as HTMLInputElement).value;
                      const freq = (document.getElementById('freq') as HTMLInputElement).value;
                      const instr = (document.getElementById('instr') as HTMLTextAreaElement).value;
                      if (!name) return;
                      await fetch('/api/prescriptions', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ patient_id: patient.id, medication_name: name, dosage, frequency: freq, instructions: instr, doctor_id: user?.id })
                      });
                      setIsPrescriptionModalOpen(false);
                      fetchData();
                    }} className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl">Prescribe</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {isNoteModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsNoteModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Add Clinical Note</h3>
                <div className="space-y-4">
                  <textarea id="note_content" placeholder="Enter clinical observations, diagnosis, or plan..." className="w-full px-4 py-3 rounded-xl border border-slate-200 h-48 focus:ring-2 focus:ring-slate-500/20 outline-none" />
                  <div className="flex gap-3">
                    <button onClick={() => setIsNoteModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                    <button onClick={async () => {
                      const content = (document.getElementById('note_content') as HTMLTextAreaElement).value;
                      if (!content) return;
                      await fetch('/api/notes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ patient_id: patient.id, note_content: content, doctor_id: user?.id })
                      });
                      setIsNoteModalOpen(false);
                      fetchData();
                    }} className="flex-1 py-3 bg-slate-600 text-white font-bold rounded-xl">Save Note</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {isBillModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBillModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Create Bill</h3>
                <div className="space-y-4">
                  <input id="amount" type="number" placeholder="Amount ($)" className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                  <textarea id="desc" placeholder="Description (e.g. Consultation, Medication)" className="w-full px-4 py-3 rounded-xl border border-slate-200 h-24" />
                  <div className="flex gap-3">
                    <button onClick={() => setIsBillModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancel</button>
                    <button onClick={async () => {
                      const amount = (document.getElementById('amount') as HTMLInputElement).value;
                      const desc = (document.getElementById('desc') as HTMLTextAreaElement).value;
                      if (!amount) return;
                      await fetch('/api/bills', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ patient_id: patient.id, amount, description: desc })
                      });
                      setIsBillModalOpen(false);
                      fetchData();
                    }} className="flex-1 py-3 bg-amber-600 text-white font-bold rounded-xl">Create</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const ForgotPasswordModal = ({ onClose }: { onClose: () => void }) => {
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending reset request
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
            <Key size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">Forgot Password?</h3>
          <p className="text-slate-500 mt-2">Enter your username to reset your password.</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
            <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all">
              Reset Password
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm">
              If an account exists for <strong>{username}</strong>, please contact the administrator to complete the password reset process.
            </div>
            <button onClick={onClose} className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all">
              Back to Login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const ResetPasswordModal = ({ user, onClose }: { user: User, onClose: () => void }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    try {
      const res = await fetch(`/api/users/${user.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(onClose, 2000);
      } else {
        setError('Failed to reset password');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-slate-800 mb-6">Reset Password for {user.username}</h3>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200"
              required
            />
            {error && <p className="text-rose-500 text-sm font-bold">{error}</p>}
            <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all">
              Update Password
            </button>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <CheckCircle2 size={32} />
            </div>
            <p className="text-lg font-bold text-slate-800">Password Updated Successfully</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const ProfileModal = ({ user, onClose, onUpdate }: { user: User, onClose: () => void, onUpdate: (user: User) => void }) => {
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    contact: user.contact || '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const res = await fetch(`/api/users/${user.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name,
          contact: formData.contact,
          password: formData.password || undefined
        })
      });

      if (res.ok) {
        setSuccess(true);
        onUpdate({ ...user, full_name: formData.full_name, contact: formData.contact });
        setTimeout(onClose, 2000);
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-slate-800 mb-6">Edit Profile</h3>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
              <input
                type="text"
                value={formData.contact}
                onChange={e => setFormData({ ...formData, contact: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200"
              />
            </div>
            <div className="border-t border-slate-100 pt-4 mt-4">
              <p className="text-sm text-slate-500 mb-3">Change Password (Optional)</p>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-emerald-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200"
                />
              </div>
            </div>
            {error && <p className="text-rose-500 text-sm font-bold">{error}</p>}
            <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all">
              Save Changes
            </button>
          </form>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <CheckCircle2 size={32} />
            </div>
            <p className="text-lg font-bold text-slate-800">Profile Updated Successfully</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const PatientRecords = ({ user, users }: { user: User, users: User[] }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPatientDetail, setShowPatientDetail] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    full_name: '', dob: '', gender: 'male', address: '', contact: '', blood_group: 'O+'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/patients')
      .then(res => res.json())
      .then(data => {
        setPatients(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => setLoading(false));
  }, [statusFilter]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!validateRequired(formData.full_name)) newErrors.full_name = 'Full name is required';
    else if (!validateName(formData.full_name)) newErrors.full_name = 'Name should only contain letters';

    if (!validateRequired(formData.dob)) newErrors.dob = 'Date of birth is required';
    else if (!validateBirthDate(formData.dob)) newErrors.dob = 'Date of birth cannot be in the future';

    if (!validateRequired(formData.contact)) newErrors.contact = 'Contact is required';
    else if (!validatePhone(formData.contact)) newErrors.contact = 'Invalid Ethiopian phone number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ full_name: '', dob: '', gender: 'male', address: '', contact: '', blood_group: 'O+' });
        setErrors({});
        // Refresh patients
        fetch('/api/patients').then(res => res.json()).then(data => setPatients(Array.isArray(data) ? data : []));
      } else {
        const errorData = await res.json();
        alert('Error: ' + (errorData.message || 'Failed to register patient. Please check database connection.'));
      }
    } catch (err: any) {
      console.error(err);
      alert('Network Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    (statusFilter === 'all' || patient.current_status === statusFilter) &&
    (patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.contact.includes(searchTerm) ||
      patient.id.toString().includes(searchTerm) ||
      (patient.dob && patient.dob.includes(searchTerm)) ||
      (patient.blood_group && patient.blood_group.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      <Card title="Patient Records">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, ID or contact..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="registered">Registered</option>
              <option value="triage">Triage</option>
              <option value="admitted">Admitted</option>
              <option value="discharged">Discharged</option>
            </select>
          </div>
          {['admin', 'receptionist'].includes(user.role) && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Plus size={18} />
              <span>New Patient</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">DOB</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPatients.length > 0 ? filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4 font-medium text-slate-800">{patient.full_name}</td>
                  <td className="px-4 py-4 text-slate-600 capitalize">{patient.gender}</td>
                  <td className="px-4 py-4 text-slate-600">{patient.dob}</td>
                  <td className="px-4 py-4 text-slate-600">{patient.contact}</td>
                  <td className="px-4 py-4 text-right">
                    <button onClick={() => { setSelectedPatient(patient); setShowPatientDetail(true); }} className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">View</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">
                    {loading ? 'Loading patients...' : 'No patient records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6">
              <h3 className="font-bold text-slate-800 mb-4">Register New Patient</h3>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <input type="text" placeholder="Full Name" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className={`w-full px-3 py-2 rounded-lg border ${errors.full_name ? 'border-rose-500' : 'border-slate-200'}`} />
                  {errors.full_name && <p className="text-rose-500 text-xs mt-1">{errors.full_name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} className={`w-full px-3 py-2 rounded-lg border ${errors.dob ? 'border-rose-500' : 'border-slate-200'}`} />
                    {errors.dob && <p className="text-rose-500 text-xs mt-1">{errors.dob}</p>}
                  </div>
                  <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <input type="text" placeholder="Contact" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} className={`w-full px-3 py-2 rounded-lg border ${errors.contact ? 'border-rose-500' : 'border-slate-200'}`} />
                  {errors.contact && <p className="text-rose-500 text-xs mt-1">{errors.contact}</p>}
                </div>
                <textarea placeholder="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200" />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2 bg-emerald-600 text-white rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Clock className="animate-spin" size={16} />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <span>Register</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPatientDetail && selectedPatient && (
          <PatientDetailView
            patient={selectedPatient}
            users={users}
            onClose={() => setShowPatientDetail(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const AppointmentScheduling = ({ user, users }: { user: User, users: User[] }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptsRes, patientsRes] = await Promise.all([
          fetch('/api/appointments'),
          fetch('/api/patients')
        ]);
        const apptsData = await apptsRes.json();
        const patientsData = await patientsRes.json();
        setAppointments(Array.isArray(apptsData) ? apptsData : []);
        setPatients(Array.isArray(patientsData) ? patientsData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const doctors = users.filter(u => u.role === 'doctor');

  const handleAppointmentBooked = (newAppt: Appointment) => {
    setAppointments([newAppt, ...appointments]);
  };

  const handleCancelAppointment = async (apptId: number) => {
    try {
      const res = await fetch(`/api/appointments/${apptId}/cancel`, { method: 'POST' });
      if (res.ok) {
        setAppointments(appointments.map(a => a.id === apptId ? { ...a, status: 'cancelled' } : a));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Appointment Scheduling</h2>
          <p className="text-slate-500 text-sm">Manage doctor schedules and patient bookings.</p>
        </div>
        <button
          onClick={() => setIsBookModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 font-bold"
        >
          <CalendarPlus size={18} />
          <span>Book Appointment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title="Upcoming Appointments">
            <div className="space-y-4">
              {loading ? (
                <p className="text-center py-8 text-slate-400 italic">Loading appointments...</p>
              ) : appointments.length === 0 ? (
                <p className="text-center py-8 text-slate-400 italic">No appointments scheduled.</p>
              ) : appointments.map(appt => (
                <div key={appt.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/30 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                    <span className="text-[10px] font-bold uppercase">{new Date(appt.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-lg font-bold leading-none">{new Date(appt.date).getDate()}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-slate-800">{appt.patient_name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${appt.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                        appt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                        {appt.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Clock size={12} /> {appt.time}</span>
                      <span className="flex items-center gap-1"><Stethoscope size={12} /> Dr. {appt.doctor_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {appt.status === 'scheduled' && (
                      <button
                        onClick={() => handleCancelAppointment(appt.id)}
                        className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Cancel Appointment"
                      >
                        <X size={18} />
                      </button>
                    )}
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Doctor Availability">
            <div className="space-y-4">
              {doctors.map(doctor => (
                <div key={doctor.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    {doctor.full_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">Dr. {doctor.full_name}</p>
                    <p className="text-xs text-emerald-600 font-medium">Available Today</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {isBookModalOpen && (
          <BookAppointmentModal
            patients={patients}
            doctors={doctors}
            onClose={() => setIsBookModalOpen(false)}
            onAppointmentBooked={handleAppointmentBooked}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const Dashboard = ({ user, setActiveTab }: { user: User, setActiveTab: (tab: string) => void }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/summary')
      .then(res => res.json())
      .then(data => setData(data || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Patients', value: data?.stats?.patients || '0', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Appointments Today', value: data?.stats?.todayAppointments || '0', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Lab Tests Pending', value: data?.stats?.pendingLabs || '0', icon: FlaskConical, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Revenue', value: `${data?.stats?.totalRevenue?.toLocaleString() || '0'} ETB`, icon: CreditCard, color: 'text-rose-600', bg: 'bg-rose-50' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome back, {user.full_name}</h2>
          <p className="text-slate-500">Here's what's happening at the clinic today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-slate-600">System Online</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-900 mb-1">{loading ? '...' : stat.value}</p>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card title="Recent Activity">
            <div className="space-y-6">
              {loading ? (
                <p className="text-center text-slate-400 py-8 italic">Loading activity...</p>
              ) : (
                <>
                  {[
                    { type: 'registration', text: 'New patient registration system active', time: 'Live', icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { type: 'appointment', text: 'Appointment scheduling system active', time: 'Live', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { type: 'lab', text: 'Laboratory investigation module active', time: 'Live', icon: FlaskConical, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { type: 'billing', text: 'Financial management module active', time: 'Live', icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-4 group cursor-pointer">
                      <div className={`p-2 rounded-lg ${activity.bg} ${activity.color} shrink-0`}>
                        <activity.icon size={18} />
                      </div>
                      <div className="flex-1 border-b border-slate-50 pb-4 group-last:border-0">
                        <p className="text-sm font-semibold text-slate-800 mb-0.5">{activity.text}</p>
                        <p className="text-xs text-slate-400">{activity.time}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                    </div>
                  ))}
                </>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card title="Quick Actions">
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'New Appointment', icon: CalendarPlus, color: 'bg-emerald-600', tab: 'appointments' },
                { label: 'Register Patient', icon: UserPlus, color: 'bg-blue-600', tab: 'patients' },
                { label: 'Generate Report', icon: FileBarChart, color: 'bg-slate-800', tab: 'reports' },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(action.tab)}
                  className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
                >
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon size={18} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">{action.label}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card title="System Status">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Server Load</span>
                  <span className="text-xs font-bold text-emerald-600">Normal</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="w-[24%] h-full bg-emerald-500" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Storage</span>
                  <span className="text-xs font-bold text-blue-600">68%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="w-[68%] h-full bg-blue-500" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const LabTechnicianView = ({ user }: { user: User }) => {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [testTypes, setTestTypes] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [results, setResults] = useState('');
  const [isTestTypeModalOpen, setIsTestTypeModalOpen] = useState(false);
  const [newTestType, setNewTestType] = useState({ name: '', description: '', required_sample: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, typesRes] = await Promise.all([
        fetch('/api/lab-orders'),
        fetch('/api/lab-test-types')
      ]);
      const ordersData = await ordersRes.json();
      const typesData = await typesRes.json();
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setTestTypes(Array.isArray(typesData) ? typesData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddTestType = async (e: React.FormEvent) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/lab-test-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTestType)
      });
      if (res.ok) {
        setIsTestTypeModalOpen(false);
        setNewTestType({ name: '', description: '', required_sample: '' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcess = async (order: LabOrder) => {
    const res = await fetch(`/api/lab-orders/${order.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'processing', lab_tech_id: user.id })
    });
    if (res.ok) fetchData();
  };

  const handleSubmitResults = async () => {
    if (!selectedOrder) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/lab-orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results, status: 'completed', lab_tech_id: user.id })
      });
      if (res.ok) {
        setSelectedOrder(null);
        setResults('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Laboratory Dashboard</h2>
          <p className="text-slate-500 text-sm">Monitor and process diagnostic test orders.</p>
        </div>
        <button
          onClick={() => setIsTestTypeModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 font-bold"
        >
          <Plus size={18} />
          <span>Add Test Type</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card title="Active Lab Orders">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Patient</th>
                    <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Test Type</th>
                    <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">Loading orders...</td></tr>
                  ) : orders.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">No active lab orders.</td></tr>
                  ) : orders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4 font-semibold text-slate-800">{(order as any).patient_name || `Patient #${order.patient_id}`}</td>
                      <td className="px-4 py-4 text-slate-600">{order.test_type}</td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          order.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleProcess(order)}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                          >
                            Start Processing
                          </button>
                        )}
                        {order.status === 'processing' && (
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                          >
                            Enter Results
                          </button>
                        )}
                        {order.status === 'completed' && (
                          <span className="text-xs font-bold text-slate-400">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card title="Available Test Types">
            <div className="space-y-4">
              {testTypes.length > 0 ? testTypes.map(type => (
                <div key={type.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 group hover:border-emerald-200 transition-colors">
                  <h4 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{type.name}</h4>
                  <p className="text-sm text-slate-500 mt-1">{type.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Sample Required:</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-lg">{type.required_sample}</span>
                  </div>
                </div>
              )) : (
                <p className="text-center text-slate-400 italic py-4">No test types defined.</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {isTestTypeModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTestTypeModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
              <h3 className="text-xl font-bold text-slate-800 mb-6">Add New Lab Test Type</h3>
              <form onSubmit={handleAddTestType} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Test Name</label>
                  <input
                    type="text"
                    required
                    value={newTestType.name}
                    onChange={e => setNewTestType({ ...newTestType, name: e.target.value })}
                    placeholder="e.g. Complete Blood Count"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    value={newTestType.description}
                    onChange={e => setNewTestType({ ...newTestType, description: e.target.value })}
                    placeholder="What does this test measure?"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 h-24 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Required Sample</label>
                  <input
                    type="text"
                    required
                    value={newTestType.required_sample}
                    onChange={e => setNewTestType({ ...newTestType, required_sample: e.target.value })}
                    placeholder="e.g. Blood (EDTA), Urine, Swab"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setIsTestTypeModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50">
                    {submitting ? 'Adding...' : 'Add Test'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {selectedOrder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Enter Lab Results</h3>
              <p className="text-sm text-slate-500 mb-4">Test: {selectedOrder.test_type} for {(selectedOrder as any).patient_name}</p>
              <textarea
                value={results}
                onChange={e => setResults(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 h-40 mb-4 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                placeholder="Enter detailed test results here..."
              />
              <div className="flex gap-3">
                <button onClick={() => setSelectedOrder(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all">Cancel</button>
                <button onClick={handleSubmitResults} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all">Submit Results</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BedAllocation = () => {
  const [beds, setBeds] = useState<BedType[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState<BedType | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  const fetchData = () => {
    fetch('/api/beds').then(res => res.json()).then(data => setBeds(Array.isArray(data) ? data : [])).catch(() => { });
    fetch('/api/patients').then(res => res.json()).then(data => setPatients(Array.isArray(data) ? data : [])).catch(() => { });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignPatient = async () => {
    if (!selectedBed || !selectedPatientId) return;

    const res = await fetch(`/api/beds/${selectedBed.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'occupied',
        patient_id: selectedPatientId
      })
    });

    if (res.ok) {
      setIsAssignModalOpen(false);
      setSelectedBed(null);
      setSelectedPatientId('');
      fetchData();
    }
  };

  const handleReleaseBed = async (bed: BedType) => {
    const res = await fetch(`/api/beds/${bed.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'available',
        patient_id: null
      })
    });

    if (res.ok) fetchData();
  };

  return (
    <div className="space-y-6">
      <Card title="Bed Management">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {beds.map(bed => (
            <div key={bed.id} className={`p-4 rounded-xl border transition-all ${bed.status === 'occupied' ? 'bg-rose-50 border-rose-100 shadow-sm' : 'bg-emerald-50 border-emerald-100'}`}>
              <div className="flex justify-between items-start mb-2">
                <BedIcon size={20} className={bed.status === 'occupied' ? 'text-rose-500' : 'text-emerald-500'} />
                <Badge variant={bed.status === 'occupied' ? 'danger' : bed.status === 'maintenance' ? 'warning' : 'success'}>
                  {bed.status.charAt(0).toUpperCase() + bed.status.slice(1)}
                </Badge>
              </div>
              <div className="mb-3">
                <p className="font-bold text-slate-800">Room {bed.room_number}</p>
                <p className="text-sm text-slate-600 font-medium">Bed {bed.bed_number}</p>
                {bed.status === 'occupied' && (
                  <div className="mt-2 p-2 bg-white/50 rounded-lg border border-rose-100">
                    <p className="text-[10px] font-bold uppercase text-rose-400">Patient</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{bed.patient_name || 'Loading...'}</p>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-2 border-t border-slate-200/50">
                {bed.status === 'available' ? (
                  <button
                    onClick={() => { setSelectedBed(bed); setIsAssignModalOpen(true); }}
                    className="w-full py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Assign Patient
                  </button>
                ) : bed.status === 'occupied' ? (
                  <button
                    onClick={() => handleReleaseBed(bed)}
                    className="w-full py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Release Bed
                  </button>
                ) : (
                  <button className="w-full py-1.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-lg cursor-not-allowed">
                    Maintenance
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAssignModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Assign Patient to Bed</h3>
              <p className="text-sm text-slate-500 mb-6">Room {selectedBed?.room_number}, Bed {selectedBed?.bed_number}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Select Patient</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  >
                    <option value="">-- Select a Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.full_name} (ID: {p.id})</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setIsAssignModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all">Cancel</button>
                  <button
                    onClick={handleAssignPatient}
                    disabled={!selectedPatientId}
                    className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Confirm Assignment
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BillingView = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [billsRes, patientsRes] = await Promise.all([
          fetch('/api/bills'),
          fetch('/api/patients')
        ]);
        const billsData = await billsRes.json();
        const patientsData = await patientsRes.json();
        setBills(Array.isArray(billsData) ? billsData : []);
        setPatients(Array.isArray(patientsData) ? patientsData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInvoiceCreated = (newBill: Bill) => {
    setBills([newBill, ...bills]);
  };

  const handleMarkAsPaid = async (billId: number) => {
    try {
      const res = await fetch(`/api/bills/${billId}/pay`, { method: 'POST' });
      if (res.ok) {
        setBills(bills.map(b => b.id === billId ? { ...b, status: 'paid', paid_at: new Date().toISOString() } : b));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Billing & Invoices</h2>
          <p className="text-slate-500 text-sm">Manage patient payments and service charges.</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 font-bold"
        >
          <Plus size={18} />
          <span>Create Invoice</span>
        </button>
      </div>

      <Card title="Recent Invoices">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice ID</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Patient</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">Loading invoices...</td></tr>
              ) : bills.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">No invoices found.</td></tr>
              ) : bills.map(bill => (
                <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4 font-mono text-xs text-slate-500">#INV-{bill.id.toString().padStart(4, '0')}</td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-800">{bill.patient_name}</p>
                    <p className="text-xs text-slate-400">ID: {bill.patient_id}</p>
                  </td>
                  <td className="px-4 py-4 font-bold text-slate-900">${bill.amount.toFixed(2)}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${bill.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                      {bill.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {bill.status === 'unpaid' && (
                        <button
                          onClick={() => handleMarkAsPaid(bill.id)}
                          className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <Printer size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateInvoiceModal
            patients={patients}
            onClose={() => setIsCreateModalOpen(false)}
            onInvoiceCreated={handleInvoiceCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const EditUserModal = ({ user, onClose, onUpdate }: { user: User, onClose: () => void, onUpdate: () => void }) => {
  const [formData, setFormData] = useState({
    full_name: user.full_name,
    username: user.username,
    role: user.role,
    contact: user.contact || '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onUpdate();
        onClose();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update user');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-slate-800 mb-6">Edit User</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input type="text" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200">
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="receptionist">Receptionist</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="lab_tech">Lab Technician</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contact</label>
            <input type="text" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Password (Optional)</label>
            <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200" placeholder="Leave blank to keep current" />
          </div>
          {error && <p className="text-rose-500 text-sm font-bold">{error}</p>}
          <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all">Save Changes</button>
        </form>
      </motion.div>
    </div>
  );
};

const AddUserModal = ({ onClose, onAdded }: { onClose: () => void, onAdded: () => void }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    role: 'doctor' as Role,
    contact: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!validateRequired(formData.full_name)) newErrors.full_name = 'Full name is required';
    else if (!validateName(formData.full_name)) newErrors.full_name = 'Name should only contain letters';

    if (!validateRequired(formData.username)) newErrors.username = 'Username is required';
    if (!validateRequired(formData.password)) newErrors.password = 'Password is required';
    else if (formData.password.length < 4) newErrors.password = 'Password must be at least 4 characters';

    if (formData.contact && !validatePhone(formData.contact)) newErrors.contact = 'Invalid Ethiopian phone number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onAdded();
        onClose();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to add user');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-slate-800 mb-6">Add New User</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input type="text" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className={`w-full px-4 py-2 rounded-xl border ${errors.full_name ? 'border-rose-500' : 'border-slate-200'}`} />
            {errors.full_name && <p className="text-rose-500 text-xs mt-1">{errors.full_name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email (Login Username)</label>
            <input type="email" placeholder="e.g. doctor@clinic.com" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className={`w-full px-4 py-2 rounded-xl border ${errors.username ? 'border-rose-500' : 'border-slate-200'}`} />
            {errors.username && <p className="text-rose-500 text-xs mt-1">{errors.username}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as Role })} className="w-full px-4 py-2 rounded-xl border border-slate-200">
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="receptionist">Receptionist</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="lab_tech">Lab Technician</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contact</label>
            <input type="text" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} className={`w-full px-4 py-2 rounded-xl border ${errors.contact ? 'border-rose-500' : 'border-slate-200'}`} />
            {errors.contact && <p className="text-rose-500 text-xs mt-1">{errors.contact}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className={`w-full px-4 py-2 rounded-xl border ${errors.password ? 'border-rose-500' : 'border-slate-200'}`} />
            {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password}</p>}
          </div>
          {error && <p className="text-rose-500 text-sm font-bold">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Clock className="animate-spin" size={18} />
                <span>Creating...</span>
              </>
            ) : (
              <span>Create User</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchUsers = () => {
    fetch('/api/users').then(res => res.json()).then(data => setUsers(Array.isArray(data) ? data : [])).catch(() => { });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    }
  };

  return (
    <div className="space-y-6">
      <Card title="User Management">
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus size={18} />
            <span>Add User</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Name</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Role</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Username</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-50">
                  <td className="px-4 py-3 font-medium">{u.full_name}</td>
                  <td className="px-4 py-3"><Badge variant="info">{u.role}</Badge></td>
                  <td className="px-4 py-3 text-slate-500">{u.username}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingUser(u)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Reset Password"
                      >
                        <Key size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AnimatePresence>
        {isAddModalOpen && (
          <AddUserModal onClose={() => setIsAddModalOpen(false)} onAdded={fetchUsers} />
        )}
        {selectedUser && (
          <ResetPasswordModal user={selectedUser} onClose={() => setSelectedUser(null)} />
        )}
        {editingUser && (
          <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onUpdate={fetchUsers} />
        )}
      </AnimatePresence>
    </div>
  );
};

const PharmacistView = ({ user }: { user: User }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [newItemFormData, setNewItemFormData] = useState({
    item_name: '', category: 'Medication', quantity: 0, unit: 'Tablets', expiry_date: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = () => {
    setLoading(true);
    fetch('/api/inventory')
      .then(res => res.json())
      .then(data => {
        setInventory(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemFormData)
      });
      if (res.ok) {
        fetchInventory();
        setNewItemFormData({ item_name: '', category: 'Medication', quantity: 0, unit: 'Tablets', expiry_date: '' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const lowStockItems = inventory.filter(item => item.quantity < 20);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pharmacy Inventory</h2>
          <p className="text-slate-500 text-sm">Manage medication stock and expiry dates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {lowStockItems.length > 0 && (
            <Card title="Low Stock Alerts">
              <div className="space-y-3">
                {lowStockItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 border border-rose-100 group transition-all hover:bg-rose-100/50">
                    <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                      <AlertCircle size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-rose-900">{item.item_name}</p>
                      <p className="text-xs text-rose-600 font-medium">Critical Stock: {item.quantity} {item.unit} remaining</p>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider">Restock Needed</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card title="Inventory List">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Item Name</th>
                    <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Level</th>
                    <th className="px-4 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Expiry Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">Loading inventory...</td></tr>
                  ) : inventory.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">No items in inventory.</td></tr>
                  ) : inventory.map(item => (
                    <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors ${item.quantity < 20 ? 'bg-rose-50/30' : ''}`}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">{item.item_name}</span>
                          {item.quantity < 20 && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">{item.category}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${item.quantity < 20 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, (item.quantity / 100) * 100)}%` }}
                            />
                          </div>
                          <span className={`text-sm font-bold ${item.quantity < 20 ? 'text-rose-600' : 'text-slate-700'}`}>
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <Calendar size={14} className="text-slate-400" />
                          {item.expiry_date}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card title="Add New Stock">
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Paracetamol 500mg"
                  required
                  value={newItemFormData.item_name}
                  onChange={e => setNewItemFormData({ ...newItemFormData, item_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={newItemFormData.category}
                  onChange={e => setNewItemFormData({ ...newItemFormData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                >
                  <option>Medication</option>
                  <option>Surgical</option>
                  <option>Laboratory</option>
                  <option>General Supply</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={newItemFormData.quantity}
                    onChange={e => setNewItemFormData({ ...newItemFormData, quantity: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. Tabs"
                    required
                    value={newItemFormData.unit}
                    onChange={e => setNewItemFormData({ ...newItemFormData, unit: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={newItemFormData.expiry_date}
                  onChange={e => setNewItemFormData({ ...newItemFormData, expiry_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 mt-2"
              >
                Add to Inventory
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

const PatientDashboard = ({ user }: { user: User }) => (
  <div className="space-y-6">
    <Card title="My Health Record">
      <div className="p-4 text-center text-slate-500">No records found</div>
    </Card>
  </div>
);

const ReportsView = () => {
  const revenueData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
  ];

  const patientData = [
    { name: 'Mon', patients: 24 },
    { name: 'Tue', patients: 18 },
    { name: 'Wed', patients: 32 },
    { name: 'Thu', patients: 28 },
    { name: 'Fri', patients: 35 },
    { name: 'Sat', patients: 15 },
    { name: 'Sun', patients: 10 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Weekly Revenue">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Patient Visits">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={patientData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="patients" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

const AddTaskModal = ({ users, onClose, onTaskAdded }: { users: User[], onClose: () => void, onTaskAdded: (task: any) => void }) => {
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!description.trim()) {
      errors.description = 'Task description cannot be empty.';
    }
    if (dueDate && new Date(dueDate) < new Date()) {
      errors.dueDate = 'Due date cannot be in the past.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, assigned_to: assignedTo || null, due_date: dueDate || null })
    });
    if (res.ok) {
      const newTask = await res.json();
      onTaskAdded(newTask);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-slate-800 mb-6">Add New Task</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${validationErrors.description ? 'border-rose-500' : 'border-slate-200'} h-32`} placeholder="Task description" required />
            {validationErrors.description && <p className="text-rose-500 text-xs mt-1">{validationErrors.description}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Assign To</label>
              <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200">
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.full_name} ({user.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${validationErrors.dueDate ? 'border-rose-500' : 'border-slate-200'}`} />
              {validationErrors.dueDate && <p className="text-rose-500 text-xs mt-1">{validationErrors.dueDate}</p>}
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all">
            Add Task
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const statusColors: { [key: string]: string } = {
  pending: 'border-slate-300',
  'in-progress': 'border-amber-400',
  completed: 'border-emerald-500',
};

const statusProgress: { [key: string]: { width: string, color: string } } = {
  pending: { width: '0%', color: 'bg-slate-200' },
  'in-progress': { width: '50%', color: 'bg-amber-400' },
  completed: { width: '100%', color: 'bg-emerald-500' },
};

const TasksView = ({ user }: { user: User }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  useEffect(() => {
    fetch('/api/tasks').then(res => res.json()).then(data => setTasks(Array.isArray(data) ? data : []));
    fetch('/api/users').then(res => res.json()).then(data => setUsers(Array.isArray(data) ? data : []));
  }, []);

  const handleTaskUpdated = (updatedTask: any) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    setIsEditModalOpen(false);
  };

  const handleTaskAdded = (newTask: any) => {
    setTasks([newTask, ...tasks]);
    setIsAddModalOpen(false);
  };

  const handleStatusChange = async (task: any, status: string) => {
    const res = await fetch(`/api/tasks/${task.id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    if (res.ok) {
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status } : t));
    }
  };

  const handleAssigneeChange = async (task: any, assigned_to: string) => {
    const res = await fetch(`/api/tasks/${task.id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_to: assigned_to || null })
      });
    if (res.ok) {
      setTasks(tasks.map(t => t.id === task.id ? { ...t, assigned_to: assigned_to ? assigned_to : null } : t));
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesAssignee = assigneeFilter === 'all' ||
      (assigneeFilter === 'unassigned' && !task.assigned_to) ||
      (task.assigned_to === assigneeFilter);
    return matchesStatus && matchesAssignee;
  });

  return (
    <div className="space-y-6">
      <Card title="Task Management">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Assignee:</span>
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
              >
                <option value="all">All Assignees</option>
                <option value="unassigned">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.full_name}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>Add Task</span>
          </button>
        </div>
        <div className="space-y-4">
          {filteredTasks.length > 0 ? filteredTasks.map(task => (
            <div key={task.id} className={`p-4 rounded-xl border-l-4 ${statusColors[task.status]} bg-white flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{task.description}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Assignee:</span>
                      <select
                        value={task.assigned_to || ''}
                        onChange={(e) => handleAssigneeChange(task, e.target.value)}
                        className="bg-transparent border-none text-xs text-slate-600 font-bold focus:ring-0 p-0 cursor-pointer hover:text-emerald-600 transition-colors"
                      >
                        <option value="">Unassigned</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
                        ))}
                      </select>
                    </div>
                    {task.due_date && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Due:</span>
                        <span className={`text-xs font-bold ${new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'text-rose-500' : 'text-slate-600'}`}>
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button onClick={() => { setSelectedTask(task); setIsEditModalOpen(true); }} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                    <Edit size={16} />
                  </button>
                </div>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: statusProgress[task.status].width }}
                  className={`h-full ${statusProgress[task.status].color}`}
                />
              </div>
            </div>
          )) : (
            <div className="py-12 text-center">
              <ClipboardList className="mx-auto text-slate-200 mb-3" size={48} />
              <p className="text-slate-400 font-medium">No tasks found matching your filters.</p>
            </div>
          )}
        </div>
      </Card>

      <AnimatePresence>
        {isAddModalOpen && (
          <AddTaskModal
            users={users}
            onClose={() => setIsAddModalOpen(false)}
            onTaskAdded={handleTaskAdded}
          />
        )}
        {isEditModalOpen && selectedTask && (
          <EditTaskModal
            task={selectedTask}
            users={users}
            onClose={() => setIsEditModalOpen(false)}
            onTaskUpdated={handleTaskUpdated}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const EditTaskModal = ({ task, users, onClose, onTaskUpdated }: { task: any, users: User[], onClose: () => void, onTaskUpdated: (task: any) => void }) => {
  const [description, setDescription] = useState(task.description);
  const [assignedTo, setAssignedTo] = useState(task.assigned_to || '');
  const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.split('T')[0] : '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, assigned_to: assignedTo || null, due_date: dueDate || null })
    });
    if (res.ok) {
      const updatedTask = await res.json();
      onTaskUpdated(updatedTask);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-slate-800 mb-6">Edit Task</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 h-32" placeholder="Task description" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Assign To</label>
              <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200">
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.full_name} ({user.role})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all">
            Update Task
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const ClinicSettings = () => {
  const [info, setInfo] = useState({ name: '', address: '', contact: '', email: '', logo_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/clinic-info')
      .then(res => res.json())
      .then(data => {
        setInfo(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/clinic-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info)
      });
      if (res.ok) {
        alert('Clinic settings updated successfully!');
      }
    } catch (err) {
      alert('Error updating clinic settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-12 text-center text-slate-400 italic">Loading settings...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <Card title="Clinic Information">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Clinic Name</label>
              <input
                type="text"
                value={info.name}
                onChange={e => setInfo({ ...info, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Physical Address</label>
              <textarea
                value={info.address}
                onChange={e => setInfo({ ...info, address: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 h-24 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={info.contact}
                  onChange={e => setInfo({ ...info, contact: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={info.email}
                  onChange={e => setInfo({ ...info, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Logo URL</label>
              <input
                type="text"
                value={info.logo_url}
                onChange={e => setInfo({ ...info, logo_url: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
          >
            {saving ? 'Saving Changes...' : 'Save Clinic Settings'}
          </button>
        </form>
      </Card>
    </div>
  );
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]); // New state for all users
  const [session, setSession] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [clinicInfo, setClinicInfo] = useState<any>({ name: 'Africa Medium Clinic' });

  useEffect(() => {
    fetch('/api/clinic-info')
      .then(res => res.json())
      .then(data => {
        // Fallback name if API returns error or missing name
        setClinicInfo(data && data.name ? data : { name: 'Africa Medium Clinic' });
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setAppLoading(true);
        fetch(`/api/users/${session.user.id}`)
          .then(res => res.json())
          .then(data => {
            if (data.user) {
              setUser(data.user);
            } else {
              setUser({
                id: session.user.id,
                username: session.user.email || 'unknown',
                role: 'admin',
                full_name: 'System Admin (Fallback)',
                contact: ''
              } as User);
            }
          })
          .catch(err => {
            console.error('Error fetching user:', err);
            setUser({
              id: session.user.id,
              username: session.user.email || 'unknown',
              role: 'admin',
              full_name: 'System Admin (Fallback)',
              contact: ''
            } as User);
          })
          .finally(() => setAppLoading(false));

        fetch('/api/users')
          .then(res => res.json())
          .then(data => {
            setUsers(Array.isArray(data) ? data : []);
          })
          .catch(err => console.error('Error fetching all users:', err));

      } else {
        setUser(null);
        setAppLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setLoginData({ username: '', password: '' });
    setIsLogoutModalOpen(false);
    setActiveTab('dashboard');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginData.username.trim() || !loginData.password.trim()) {
      setLoginError('Please enter both username and password.');
      return;
    }

    setLoggingIn(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.username,
        password: loginData.password,
      });

      if (error) {
        setLoginError('Incorrect username or password. Please try again.');
      } else {
        setIsLoginModalOpen(false);
        setActiveTab('dashboard');
      }
    } catch (err) {
      setLoginError('An unexpected error occurred during login. Please try again later.');
    } finally {
      setLoggingIn(false);
    }
  };

  if (appLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-bold">Initializing System...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LandingPage onLoginClick={() => setIsLoginModalOpen(true)} clinicInfo={clinicInfo} />
        <AnimatePresence>
          {isLoginModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLoginModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-slate-800">{clinicInfo?.name || 'Africa Medium Clinic'}</h3>
                  <p className="text-slate-500">Portal Login</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <input type="text" placeholder="Username" value={loginData.username} onChange={e => setLoginData({ ...loginData, username: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200" />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={loginData.password}
                      onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-emerald-600 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <button type="button" onClick={() => { setIsLoginModalOpen(false); setIsForgotPasswordModalOpen(true); }} className="text-sm text-emerald-600 font-medium hover:underline">
                      Forgot Password?
                    </button>
                  </div>
                  {loginError && <p className="text-rose-500 text-sm font-bold">{loginError}</p>}
                  <button
                    type="submit"
                    disabled={loggingIn || !loginData.username.trim() || !loginData.password.trim()}
                    className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loggingIn ? (
                      <>
                        <Clock className="animate-spin" size={20} />
                        <span>Logging in...</span>
                      </>
                    ) : (
                      'Login'
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isForgotPasswordModalOpen && (
            <ForgotPasswordModal onClose={() => setIsForgotPasswordModalOpen(false)} />
          )}
        </AnimatePresence>
      </>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_tech'] },
    { id: 'patients', label: 'Patients', icon: Users, roles: ['admin', 'doctor', 'nurse', 'receptionist'] },
    { id: 'appointments', label: 'Appointments', icon: Calendar, roles: ['admin', 'doctor', 'receptionist'] },
    { id: 'lab', label: 'Lab Orders', icon: FlaskConical, roles: ['admin', 'doctor', 'lab_tech'] },
    { id: 'pharmacy', label: 'Pharmacy', icon: Pill, roles: ['admin', 'pharmacist', 'doctor'] },
    { id: 'billing', label: 'Billing', icon: CreditCard, roles: ['admin', 'receptionist', 'cashier'] },
    { id: 'beds', label: 'Bed Management', icon: BedIcon, roles: ['admin', 'nurse', 'receptionist'] },
    { id: 'reports', label: 'Reports', icon: FileText, roles: ['admin'] },
    { id: 'users', label: 'Users', icon: UserCircle, roles: ['admin'] },
    { id: 'settings', label: 'Settings', icon: Save, roles: ['admin'] },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full z-10 hidden md:block">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 text-emerald-600">
          <Stethoscope size={28} />
          <span className="font-bold text-slate-900 truncate">{clinicInfo?.name || 'Africa Medium Clinic'}</span>
        </div>
        <div className="p-4 space-y-2">
          {menuItems.filter(item => item.roles.includes(user.role)).map(item => (
            <SidebarItem key={item.id} icon={item.icon} label={item.label} active={activeTab === item.id} onClick={() => setActiveTab(item.id)} />
          ))}
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 capitalize">{activeTab.replace('_', ' ')}</h1>
          </div>
          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-3 px-3 py-2 bg-white border ${isDropdownOpen ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200'} rounded-2xl hover:bg-slate-50 transition-all text-left shadow-sm group`}
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold group-hover:scale-105 transition-transform">
                  {user.full_name.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-slate-900 leading-tight">{user.full_name}</p>
                  <p className="text-[10px] font-bold text-slate-400 capitalize flex items-center gap-1 mt-0.5">
                    <ShieldCheck size={10} className="text-emerald-500" />
                    {user.role}
                  </p>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsDropdownOpen(false)}
                      className="fixed inset-0 z-40"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-4 bg-slate-50 border-b border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account Info</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{user.username}</p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => { setIsProfileModalOpen(true); setIsDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors group"
                        >
                          <UserCircle size={18} className="text-slate-400 group-hover:text-emerald-500" />
                          <span>View Profile</span>
                        </button>
                        {user.role === 'admin' && (
                          <button
                            onClick={() => { setActiveTab('settings'); setIsDropdownOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors group"
                          >
                            <Settings size={18} className="text-slate-400 group-hover:text-blue-500" />
                            <span>Clinic Settings</span>
                          </button>
                        )}
                      </div>
                      <div className="p-2 border-t border-slate-50 bg-slate-50/50">
                        <button
                          onClick={() => { setIsLogoutModalOpen(true); setIsDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"
                        >
                          <LogOut size={18} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {activeTab === 'dashboard' && <Dashboard user={user} setActiveTab={setActiveTab} />}
          {activeTab === 'patients' && <PatientRecords user={user} users={users} />}
          {activeTab === 'appointments' && <AppointmentScheduling user={user} users={users} />}
          {activeTab === 'lab' && <LabTechnicianView user={user} />}
          {activeTab === 'pharmacy' && <PharmacistView user={user} />}
          {activeTab === 'billing' && <BillingView />}
          {activeTab === 'beds' && <BedAllocation />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'tasks' && <TasksView user={user} />}
          {activeTab === 'settings' && <ClinicSettings />}
        </motion.div>
      </main>

      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLogoutModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-2">Confirm Sign Out</h3>
              <p className="text-slate-500 mb-6">Are you sure you want to sign out of your account?</p>
              <div className="flex gap-3">
                <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={handleLogout} className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700">Sign Out</button>
              </div>
            </motion.div>
          </div>
        )}
        {isProfileModalOpen && (
          <ProfileModal user={user} onClose={() => setIsProfileModalOpen(false)} onUpdate={setUser} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;




