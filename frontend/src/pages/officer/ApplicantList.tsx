import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Search, Plus } from 'lucide-react';

export default function ApplicantList() {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/officer/applicants').then(res => setApplicants(res.data));
  }, []);

  const filtered = applicants.filter(a => 
    a.fullName.toLowerCase().includes(search.toLowerCase()) || 
    a.admissionStatus.toLowerCase().includes(search.toLowerCase()) ||
    a.program?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Applicants</h2>
          <p className="text-slate-500 mt-1">Manage new and existing applications.</p>
        </div>
        <Link 
          to="/applicants/new" 
          className="bg-primary-600 text-white px-4 py-2 flex items-center gap-2 rounded-lg hover:bg-primary-700 transition"
        >
          <Plus size={18} />
          <span>New Applicant</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, status, or program..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-primary-500 outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Program</th>
                <th className="px-6 py-4">Quota</th>
                <th className="px-6 py-4">Docs</th>
                <th className="px-6 py-4">Fee</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(app => (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{app.fullName}</td>
                  <td className="px-6 py-4">{app.program?.name}</td>
                  <td className="px-6 py-4">{app.quotaType}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${app.docStatus === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {app.docStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${app.feeStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {app.feeStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded text-xs ${
                        app.admissionStatus === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                        app.admissionStatus === 'Allocated' ? 'bg-blue-100 text-blue-700' : 
                        'bg-slate-100 text-slate-700'
                      }`}>
                      {app.admissionStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/applicants/${app.id}`} className="text-primary-600 hover:text-primary-800 font-medium">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No applicants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
