import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

export default function NewApplicant() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [form, setForm] = useState({
    fullName: '', dob: '', gender: 'Male', mobile: '', email: '', 
    category: 'GM', entryType: 'Regular', admissionMode: 'Government', 
    quotaType: 'KCET', programId: '', academicYear: '', 
    allotmentNumber: '', qualifyingExam: '', marks: '', address: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/officer/setup-data')
      .then(res => setData(res.data))
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load setup data');
      });
  }, []);

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form, programId: Number(form.programId) };
      const res = await api.post('/officer/applicants', payload);
      navigate(`/applicants/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create applicant');
    }
  };

  const programs = data?.institution?.campuses?.flatMap((c: any) => c.departments)?.flatMap((d: any) => d.programs) || [];
  const years = data?.academicYears || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">New Applicant</h2>
        <p className="text-slate-500 mt-1">Enter applicant details to begin admission process.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        {error && <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div><label className="block text-sm font-medium mb-1">Full Name</label><input required name="fullName" value={form.fullName} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-primary-500" /></div>
          <div><label className="block text-sm font-medium mb-1">Date of Birth</label><input required type="date" name="dob" value={form.dob} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-primary-500" /></div>
          
          <div><label className="block text-sm font-medium mb-1">Gender</label><select name="gender" value={form.gender} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none"><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></div>
          <div><label className="block text-sm font-medium mb-1">Category</label><select name="category" value={form.category} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none"><option value="GM">GM</option><option value="SC">SC</option><option value="ST">ST</option><option value="OBC">OBC</option></select></div>
          
          <div><label className="block text-sm font-medium mb-1">Mobile</label><input required name="mobile" value={form.mobile} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-primary-500" /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input required type="email" name="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-primary-500" /></div>
          
          <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Address</label><input required name="address" value={form.address} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-primary-500" /></div>

          {/* Academic Info */}
          <div className="md:col-span-2 mt-4"><h3 className="text-lg font-semibold border-b pb-2">Academic & Application Details</h3></div>
          
          <div><label className="block text-sm font-medium mb-1">Qualifying Exam</label><input required name="qualifyingExam" value={form.qualifyingExam} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-primary-500" /></div>
          <div><label className="block text-sm font-medium mb-1">Marks (%)</label><input required type="number" step="0.01" name="marks" value={form.marks} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-primary-500" /></div>

          <div><label className="block text-sm font-medium mb-1">Program</label><select required name="programId" value={form.programId} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none"><option value="">Select</option>{programs.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">Academic Year</label><select required name="academicYear" value={form.academicYear} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none"><option value="">Select</option>{years.map((y: any) => <option key={y.id} value={y.year}>{y.year}</option>)}</select></div>
          
          <div><label className="block text-sm font-medium mb-1">Entry Type</label><select name="entryType" value={form.entryType} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none"><option value="Regular">Regular</option><option value="Lateral">Lateral</option></select></div>
          <div><label className="block text-sm font-medium mb-1">Admission Mode</label><select name="admissionMode" value={form.admissionMode} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none"><option value="Government">Government</option><option value="Management">Management</option></select></div>
          
          <div><label className="block text-sm font-medium mb-1">Quota Type</label><select name="quotaType" value={form.quotaType} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none"><option value="KCET">KCET</option><option value="COMEDK">COMEDK</option><option value="Management">Management</option></select></div>
          <div><label className="block text-sm font-medium mb-1">Allotment No. (if Govt)</label><input name="allotmentNumber" value={form.allotmentNumber} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-primary-500" /></div>
          
          <div className="md:col-span-2 pt-4">
            <button type="submit" className="w-full bg-primary-600 text-white font-medium py-3 rounded-lg hover:bg-primary-700 transition">Save Applicant</button>
          </div>
        </form>
      </div>
    </div>
  );
}
