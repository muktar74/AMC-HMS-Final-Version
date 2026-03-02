import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Clock } from 'lucide-react';
import { Patient, User } from '../types';

interface AddVisitModalProps {
  patient: Patient;
  users: User[];
  onClose: () => void;
  onVisitAdded: (visit: any) => void;
}

const AddVisitModal: React.FC<AddVisitModalProps> = ({ patient, users, onClose, onVisitAdded }) => {
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [notes, setNotes] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!reason.trim()) {
      errors.reason = 'Reason for visit cannot be empty.';
    }
    if (new Date(visitDate) > new Date()) {
      errors.visitDate = 'Visit date cannot be in the future.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patient.id,
          visit_date: visitDate,
          reason,
          diagnosis: diagnosis || null,
          treatment: treatment || null,
          assigned_to_user_id: assignedTo || null,
          notes: notes || null,
          status: 'pending' // Initial status
        })
      });

      if (res.ok) {
        const newVisit = await res.json();
        onVisitAdded(newVisit);
        onClose();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to add visit');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const doctorsAndNurses = users.filter(user => user.role === 'doctor' || user.role === 'nurse');

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-slate-800 mb-6">Record New Visit for {patient.full_name}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Visit Date</label>
            <input
              type="date"
              value={visitDate}
              onChange={e => setVisitDate(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border ${validationErrors.visitDate ? 'border-rose-500' : 'border-slate-200'}`}
              required
            />
            {validationErrors.visitDate && <p className="text-rose-500 text-xs mt-1">{validationErrors.visitDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Reason for Visit</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border ${validationErrors.reason ? 'border-rose-500' : 'border-slate-200'} h-24`}
              placeholder="e.g., Fever, Routine Checkup, Injury..."
              required
            />
            {validationErrors.reason && <p className="text-rose-500 text-xs mt-1">{validationErrors.reason}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Diagnosis</label>
              <input
                type="text"
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200"
                placeholder="e.g. Hypertension"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Treatment</label>
              <input
                type="text"
                value={treatment}
                onChange={e => setTreatment(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200"
                placeholder="e.g. Lisinopril 10mg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Assign To (Doctor/Nurse)</label>
            <select
              value={assignedTo}
              onChange={e => setAssignedTo(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200"
            >
              <option value="">Unassigned</option>
              {doctorsAndNurses.map(user => (
                <option key={user.id} value={user.id}>{user.full_name} ({user.role})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 h-24"
              placeholder="Any additional notes for this visit..."
            />
          </div>
          {error && <p className="text-rose-500 text-sm font-bold p-2 bg-rose-50 rounded-lg text-center">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Clock className="animate-spin text-white" size={20} />
                <span>Recording...</span>
              </>
            ) : (
              <span>Record Visit</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddVisitModal;
