import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export default function SeatMatrix() {
  const [data, setData] = useState<any>(null);
  const [form, setForm] = useState<any>({ quotas: { KCET: 0, COMEDK: 0, Management: 0 } });
  const [message, setMessage] = useState({ text: '', type: '' });

  const loadData = async () => {
    try {
      const res = await api.get('/admin/setup-data');
      setData(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuotaChange = (type: string, val: string) => {
    setForm({
      ...form, 
      quotas: { ...form.quotas, [type]: Number(val) }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const quotasArr = Object.entries(form.quotas).map(([type, total]) => ({
        quotaType: type,
        totalSeats: total
      }));

      await api.post('/admin/seat-matrix', {
        programId: Number(form.programId),
        totalIntake: Number(form.totalIntake),
        quotas: quotasArr
      });
      setMessage({ text: 'Seat matrix saved successfully!', type: 'success' });
      setForm({ ...form, quotas: { KCET: 0, COMEDK: 0, Management: 0 }, totalIntake: 0 });
    } catch (error: any) {
      setMessage({ text: error.response?.data?.error || 'Failed to save matrix', type: 'error' });
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const campuses = data?.institution?.campuses || [];
  const depts = campuses.flatMap((c: any) => c.departments);
  const programs = data?.programs || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Seat Matrix Config</h2>
        <p className="text-slate-500 mt-1">Configure total intake and quota distributions.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-2xl">
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Program</label>
              <select 
                value={form.programId || ''} 
                onChange={(e) => setForm({ ...form, programId: e.target.value })} 
                required 
                className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">Select Program</option>
                {programs.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Total Intake</label>
              <input 
                type="number" 
                value={form.totalIntake} 
                onChange={(e) => setForm({ ...form, totalIntake: e.target.value })} 
                required 
                className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 outline-none" 
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Quota Distribution</h3>
            <div className="grid grid-cols-3 gap-4">
              {['KCET', 'COMEDK', 'Management'].map(q => (
                <div key={q}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{q}</label>
                  <input 
                    type="number" 
                    value={form.quotas[q]} 
                    onChange={(e) => handleQuotaChange(q, e.target.value)} 
                    required 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-primary-500 outline-none" 
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-slate-50 rounded-lg flex justify-between items-center text-sm">
              <span className="text-slate-600">Current Sum:</span>
              <span className={`font-bold ${form.quotas.KCET + form.quotas.COMEDK + form.quotas.Management !== Number(form.totalIntake || 0) ? 'text-red-500' : 'text-green-600'}`}>
                {form.quotas.KCET + form.quotas.COMEDK + form.quotas.Management} / {form.totalIntake || 0}
              </span>
            </div>
          </div>

          <button type="submit" className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 transition">
            Save Seat Matrix
          </button>
        </form>
      </div>
    </div>
  );
}
