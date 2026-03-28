import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Users, UserCheck, Armchair } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/management/dashboard').then(res => setData(res.data)).catch(() => {});
  }, []);

  if (!data) return <div className="p-8 text-center text-slate-500">Loading Dashboard...</div>;

  const { summary, quotaWiseFill, pendingDocs, pendingFees } = data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Management Dashboard</h2>
        <p className="text-slate-500 mt-1">Overview of admission progress and seating.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Intake</p>
            <h3 className="text-2xl font-bold text-slate-800">{summary.totalIntake}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Allocated</p>
            <h3 className="text-2xl font-bold text-slate-800">{summary.totalAdmitted}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
            <Armchair size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Seats Remaining</p>
            <h3 className="text-2xl font-bold text-slate-800">{summary.seatsRemaining}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Quota-wise Fill</h3>
          <div className="space-y-6">
            {quotaWiseFill.map((prog: any, i: number) => (
              <div key={i}>
                <h4 className="font-medium text-slate-700 mb-2">{prog.programName}</h4>
                <div className="space-y-3">
                  {prog.quotas.map((q: any, j: number) => {
                    const percent = q.totalSeats ? Math.round((q.allocatedSeats / q.totalSeats) * 100) : 0;
                    return (
                      <div key={j}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-slate-600">{q.quotaType}</span>
                          <span className="text-slate-500">{q.allocatedSeats} / {q.totalSeats} ({percent}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${percent >= 100 ? 'bg-red-500' : 'bg-primary-500'}`} 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Pending Documents ({pendingDocs.length})</h3>
            <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
              {pendingDocs.map((app: any) => (
                <div key={app.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center text-sm border border-slate-100">
                  <span className="font-medium text-slate-700">{app.fullName}</span>
                  <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs">{app.docStatus}</span>
                </div>
              ))}
              {pendingDocs.length === 0 && <p className="text-sm text-slate-500">No applicants with pending documents.</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Pending Fees ({pendingFees.length})</h3>
            <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
              {pendingFees.map((app: any) => (
                <div key={app.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center text-sm border border-slate-100">
                  <span className="font-medium text-slate-700">{app.fullName}</span>
                  <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs">{app.feeStatus}</span>
                </div>
              ))}
              {pendingFees.length === 0 && <p className="text-sm text-slate-500">No applicants with pending fees.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
