import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Patient, BillItem } from '../types';

interface CreateInvoiceModalProps {
  patients: Patient[];
  onClose: () => void;
  onInvoiceCreated: (bill: any) => void;
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ patients, onClose, onInvoiceCreated }) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [items, setItems] = useState<BillItem[]>([{ description: '', amount: 0 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addItem = () => {
    setItems([...items, { description: '', amount: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof BillItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + Number(item.amount), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: Number(selectedPatientId),
          items,
          amount: totalAmount,
          status: 'unpaid'
        })
      });

      if (res.ok) {
        const newBill = await res.json();
        onInvoiceCreated(newBill);
        onClose();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to create invoice');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>
        <h3 className="text-2xl font-bold text-slate-800 mb-6">Create New Invoice</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Select Patient</label>
            <select
              value={selectedPatientId}
              onChange={e => setSelectedPatientId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            >
              <option value="">Choose a patient...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.full_name} (ID: {p.id})</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-slate-700">Invoice Items</label>
              <button
                type="button"
                onClick={addItem}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-bold flex items-center gap-1"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Description (e.g. Consultation)"
                    value={item.description}
                    onChange={e => updateItem(index, 'description', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm"
                    required
                  />
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={item.amount}
                    onChange={e => updateItem(index, 'amount', Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm"
                    required
                  />
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {error && <p className="text-rose-500 text-sm font-bold py-2 text-center bg-rose-50 rounded-lg">{error}</p>}

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Amount</p>
              <p className="text-2xl font-bold text-slate-900">${totalAmount.toFixed(2)}</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateInvoiceModal;
