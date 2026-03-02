import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus } from 'lucide-react';
import { Patient, Visit, User } from '../types';
import AddVisitModal from './AddVisitModal';

interface PatientDetailViewProps {
  patient: Patient;
  users: User[]; // Add users prop
  onClose: () => void;
}

const PatientDetailView: React.FC<PatientDetailViewProps> = ({ patient, users, onClose }) => {
  const [patientVisits, setPatientVisits] = useState<Visit[]>(patient.visits || []);
  const [isAddVisitModalOpen, setIsAddVisitModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVisits = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/visits/patient/${patient.id}`);
        if (res.ok) {
          const data = await res.json();
          setPatientVisits(data);
        } else {
          setError('Failed to fetch patient visits');
        }
      } catch (err: any) {
        console.error('Failed to fetch patient visits:', err);
        setError('Connection error while fetching visits');
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, [patient.id]);

  const handleVisitAdded = (newVisit: Visit) => {
    setPatientVisits(prev => [...prev, newVisit]);
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-4 md:p-8 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
        <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-6">Patient Details: {patient.full_name}</h3>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-bold text-slate-700">Date of Birth:</p>
              <p className="text-slate-600">{patient.dob}</p>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">Gender:</p>
              <p className="text-slate-600">{patient.gender}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">Address:</p>
            <p className="text-slate-600">{patient.address}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">Contact:</p>
            <p className="text-slate-600">{patient.contact}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">Blood Group:</p>
            <p className="text-slate-600">{patient.blood_group}</p>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">Current Status:</p>
            <p className="text-slate-600">{patient.current_status}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-bold text-slate-800">Visits</h4>
          <button
            onClick={() => setIsAddVisitModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm text-sm"
          >
            <Plus size={16} />
            <span>Record New Visit</span>
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-bold text-center mb-6">
            {error}
          </div>
        )}

        {!loading && !error && patientVisits.length > 0 ? (
          <div className="space-y-4">
            {patientVisits.map(visit => (
              <div key={visit.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                <p className="font-medium text-slate-800">Visit Date: {visit.visit_date}</p>
                <p className="text-slate-600">Reason: {visit.reason}</p>
                {visit.diagnosis && <p className="text-slate-600 font-medium">Diagnosis: <span className="text-slate-800">{visit.diagnosis}</span></p>}
                {visit.treatment && <p className="text-slate-600 font-medium">Treatment: <span className="text-slate-800">{visit.treatment}</span></p>}
                {visit.assigned_to_user_name && <p className="text-slate-600">Assigned To: {visit.assigned_to_user_name}</p>}
                <p className="text-slate-600">Status: {visit.status}</p>
                {visit.notes && <p className="text-slate-600">Notes: {visit.notes}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No visits recorded for this patient.</p>
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors">
            Close
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isAddVisitModalOpen && (
          <AddVisitModal
            patient={patient}
            users={users}
            onClose={() => setIsAddVisitModalOpen(false)}
            onVisitAdded={handleVisitAdded}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientDetailView;
