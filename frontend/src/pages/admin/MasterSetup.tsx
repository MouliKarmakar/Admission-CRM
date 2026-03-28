import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Building2, School, Blocks, GraduationCap } from 'lucide-react';

export default function MasterSetup() {
  const [activeTab, setActiveTab] = useState('institution');
  const [data, setData] = useState<any>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      const res = await api.get('/admin/setup-data');
      setData(res.data);
      if (res.data.institutions && res.data.institutions.length > 0 && !selectedInstitution) {
        setSelectedInstitution(res.data.institutions[0]);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent, endpoint: string) => {
    e.preventDefault();
    try {
      await api.post(`/admin/${endpoint}`, form);
      setMessage(`${endpoint} created successfully!`);
      setForm({});
      loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(error.response?.data?.error || `Failed to create ${endpoint}`);
    }
  };

  const tabs = [
    { id: 'institution', label: 'Institution', icon: Building2 },
    { id: 'campus', label: 'Campus', icon: School },
    { id: 'department', label: 'Department', icon: Blocks },
    { id: 'program', label: 'Program', icon: GraduationCap },
  ];

  const renderInstitutionTab = () => (
    <form onSubmit={(e) => handleSubmit(e, 'institution')} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Institution Name</label>
        <input name="name" value={form.name || ''} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
      </div>
      <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg">Create Institution</button>
    </form>
  );

  const renderCampusTab = () => (
    <form onSubmit={(e) => handleSubmit(e, 'campus')} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Institution</label>
        <select name="institutionId" value={form.institutionId || selectedInstitution?.id || ''} onChange={(e) => {
          setForm({ ...form, institutionId: e.target.value, name: '' });
          const inst = data.institutions.find((i: any) => i.id === parseInt(e.target.value));
          setSelectedInstitution(inst);
        }} required className="w-full px-4 py-2 border rounded-lg">
          <option value="">Select Institution</option>
          {data?.institutions?.map((inst: any) => (
            <option key={inst.id} value={inst.id}>{inst.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Existing Campuses</label>
        <div className="p-3 border rounded-lg bg-slate-50 text-sm text-slate-600">
          {selectedInstitution?.campuses && selectedInstitution.campuses.length > 0 ? (
            <ul className="space-y-1">
              {selectedInstitution.campuses.map((c: any) => (
                <li key={c.id}>{c.name}</li>
              ))}
            </ul>
          ) : (
            <p>No campuses yet</p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">New Campus Name</label>
        <input name="name" value={form.name || ''} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
      </div>
      <button type="submit" disabled={!form.institutionId} className="bg-primary-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">Create Campus</button>
    </form>
  );

  const renderDepartmentTab = () => {
    const campuses = selectedInstitution?.campuses || [];
    const selectedCampus = campuses.find((c: any) => c.id === parseInt(form.campusId || '0'));
    const departments = selectedCampus?.departments || [];
    
    return (
      <form onSubmit={(e) => handleSubmit(e, 'department')} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Institution</label>
          <select value={selectedInstitution?.id || ''} onChange={(e) => {
            const inst = data.institutions.find((i: any) => i.id === parseInt(e.target.value));
            setSelectedInstitution(inst);
            setForm({ ...form, campusId: '', name: '' });
          }} className="w-full px-4 py-2 border rounded-lg mb-4">
            {data?.institutions?.map((inst: any) => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Campus</label>
          <select name="campusId" value={form.campusId || ''} onChange={(e) => {
            setForm({ ...form, campusId: e.target.value, name: '' });
          }} required className="w-full px-4 py-2 border rounded-lg">
            <option value="">Select Campus</option>
            {campuses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
          <div className="p-3 border rounded-lg bg-slate-50 text-sm text-slate-600">
            {departments.length > 0 ? (
              <ul className="space-y-1">
                {departments.map((d: any) => (
                  <li key={d.id}>{d.name}</li>
                ))}
              </ul>
            ) : (
              <p>No departments in this campus</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">New Department Name</label>
          <input name="name" value={form.name || ''} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <button type="submit" disabled={!form.campusId} className="bg-primary-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">Create Department</button>
      </form>
    );
  };

  const renderProgramTab = () => {
    const campuses = selectedInstitution?.campuses || [];
    const selectedCampus = campuses.find((c: any) => c.id === parseInt(form.campusId || '0'));
    const departments = selectedCampus?.departments || [];
    
    return (
      <form onSubmit={(e) => handleSubmit(e, 'program')} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Institution</label>
          <select value={selectedInstitution?.id || ''} onChange={(e) => {
            const inst = data.institutions.find((i: any) => i.id === parseInt(e.target.value));
            setSelectedInstitution(inst);
            setForm({ ...form, campusId: '', departmentId: '' });
          }} className="w-full px-4 py-2 border rounded-lg mb-4">
            {data?.institutions?.map((inst: any) => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Campus</label>
          <select name="campusId" value={form.campusId || ''} onChange={(e) => {
            setForm({ ...form, campusId: e.target.value, departmentId: '' });
          }} required className="w-full px-4 py-2 border rounded-lg">
            <option value="">Select Campus</option>
            {campuses.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
          <select name="departmentId" value={form.departmentId || ''} onChange={handleChange} required disabled={!form.campusId} className="w-full px-4 py-2 border rounded-lg disabled:opacity-50">
            <option value="">Select Department</option>
            {departments.map((d: any) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Program Name</label>
          <input name="name" value={form.name || ''} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Course Type</label>
            <select name="courseType" value={form.courseType || ''} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg">
              <option value="">Select</option>
              <option value="UG">UG</option>
              <option value="PG">PG</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Entry Type</label>
            <select name="entryType" value={form.entryType || ''} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg">
              <option value="">Select</option>
              <option value="Regular">Regular</option>
              <option value="Lateral">Lateral</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Admission Mode</label>
          <select name="admissionMode" value={form.admissionMode || ''} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg">
            <option value="">Select</option>
            <option value="Government">Government</option>
            <option value="Management">Management</option>
          </select>
        </div>
        <button type="submit" disabled={!form.departmentId} className="bg-primary-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">Create Program</button>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Master Setup</h2>
        <p className="text-slate-500 mt-1">Configure institutional infrastructure.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-b-2 border-primary-600 text-primary-600 bg-primary-50/50' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        
        <div className="p-6">
          {message && (
            <div className="mb-6 p-4 rounded-lg bg-blue-50 text-blue-700 text-sm">
              {message}
            </div>
          )}

          {activeTab === 'institution' && renderInstitutionTab()}
          {activeTab === 'campus' && renderCampusTab()}
          {activeTab === 'department' && renderDepartmentTab()}
          {activeTab === 'program' && renderProgramTab()}
        </div>
      </div>
    </div>
  );
}
