import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { ArrowLeft, CheckCircle, AlertTriangle, FileCheck, IndianRupee } from 'lucide-react';

export default function ApplicantDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      const res = await api.get(`/officer/applicants/${id}`);
      setData(res.data);
    } catch (e: any) {
      setError('Applicant not found');
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const updateDoc = async (docId: number, status: string) => {
    try {
      await api.put(`/officer/documents/${docId}`, { status });
      // update main doc status if all verified
      loadData();
    } catch (e) { setError('Failed to update doc'); }
  };

  const updateFee = async (status: string) => {
    try {
      await api.put(`/officer/applicants/${id}/fee`, { status });
      loadData();
    } catch (e) { setError('Failed to update fee'); }
  };

  const allocateSeat = async () => {
    try {
      setError('');
      setMessage('');
      await api.post(`/officer/applicants/${id}/allocate`);
      setMessage('Seat Allocated Successfully!');
      loadData();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Allocation failed');
    }
  };

  const confirmAdmission = async () => {
    try {
      setError('');
      setMessage('');
      await api.post(`/officer/applicants/${id}/confirm`);
      setMessage('Admission Confirmed Successfully!');
      loadData();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Confirmation failed');
    }
  };

  if (error && !data) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!data) return <div className="p-8 text-center">Loading...</div>;

  const app = data.applicant;
  const matrix = data.seatMatrix;

  const isDocsVerified = app.documents.every((d: any) => d.status === 'Verified');
  const seatsRemaining = matrix ? matrix.totalSeats - matrix.allocatedSeats : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link to="/applicants" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800">
        <ArrowLeft size={16} className="mr-1" /> Back to Applicants
      </Link>

      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">{app.fullName}</h2>
          <p className="text-slate-500 mt-1">{app.program.name} • {app.quotaType} Quota</p>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center px-3 py-1 bg-slate-100 rounded-full text-sm font-medium">
            Status: <span className="ml-2 font-bold text-primary-600">{app.admissionStatus}</span>
          </div>
          {app.admission?.admissionNumber && (
            <div className="mt-2 text-sm font-mono bg-green-50 text-green-700 px-3 py-1 rounded border border-green-200">
              {app.admission.admissionNumber}
            </div>
          )}
        </div>
      </div>

      {(error || message) && (
        <div className={`p-4 rounded-lg text-sm ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {error || message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">Applicant Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500 block">Email</span>{app.email}</div>
              <div><span className="text-slate-500 block">Mobile</span>{app.mobile}</div>
              <div><span className="text-slate-500 block">DOB</span>{new Date(app.dob).toLocaleDateString()}</div>
              <div><span className="text-slate-500 block">Category</span>{app.category}</div>
              <div><span className="text-slate-500 block">Qualifying Exam</span>{app.qualifyingExam}</div>
              <div><span className="text-slate-500 block">Marks</span>{app.marks}%</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FileCheck size={20} className="text-slate-400" />
                Document Checklist
              </h3>
              <span className={`text-xs px-2 py-1 rounded ${isDocsVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {isDocsVerified ? 'All Verified' : 'Pending Verification'}
              </span>
            </div>
            
            <ul className="space-y-3">
              {app.documents.map((doc: any) => (
                <li key={doc.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <span className="font-medium text-slate-700">{doc.docName}</span>
                  <select 
                    value={doc.status}
                    onChange={(e) => updateDoc(doc.id, e.target.value)}
                    className="ml-4 text-sm px-2 py-1 rounded border outline-none font-medium"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Verified">Verified</option>
                  </select>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Col: Actions */}
        <div className="space-y-6">
          {/* Seat Allocation */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">Seat Allocation</h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Program</span>
                <span className="font-medium">{app.program.name}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-500">Quota</span>
                <span className="font-medium">{app.quotaType}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-2 mt-2">
                <span className="text-slate-500">Available Seats</span>
                <span className={`font-bold ${seatsRemaining > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {matrix ? seatsRemaining : 'N/A'}
                </span>
              </div>
            </div>
            
            <button 
              onClick={allocateSeat}
              disabled={app.admissionStatus !== 'Pending' || seatsRemaining <= 0}
              className={`w-full py-2 rounded-lg font-medium transition ${
                app.admissionStatus !== 'Pending'
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : seatsRemaining <= 0
                  ? 'bg-red-100 text-red-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {app.admissionStatus === 'Pending' ? 'Allocate Seat' : 'Seat Allocated'}
            </button>
            {seatsRemaining <= 0 && app.admissionStatus === 'Pending' && (
              <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                <AlertTriangle size={12} /> Quota is full!
              </p>
            )}
          </div>

          {/* Fee & Confirmation */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold mb-4 border-b pb-2 flex items-center gap-2">
              <IndianRupee size={20} className="text-slate-400"/>
              Fee & Confirmation
            </h3>
            
            <div className="mb-6 flex items-center justify-between bg-slate-50 p-3 rounded-lg">
              <span className="font-medium text-slate-700">Fee Status</span>
              <button 
                onClick={() => updateFee(app.feeStatus === 'Paid' ? 'Pending' : 'Paid')}
                className={`py-1 px-3 rounded text-sm font-medium transition ${
                  app.feeStatus === 'Paid' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                {app.feeStatus}
              </button>
            </div>

            <button 
              onClick={confirmAdmission}
              disabled={app.admissionStatus !== 'Allocated' || app.feeStatus !== 'Paid'}
              className={`w-full py-2.5 rounded-lg font-medium transition flex justify-center items-center gap-2 ${
                app.admissionStatus === 'Confirmed' ? 'bg-green-600 text-white' :
                (app.admissionStatus === 'Allocated' && app.feeStatus === 'Paid' && isDocsVerified)
                  ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle size={18} />
              {app.admissionStatus === 'Confirmed' ? 'Admission Confirmed' : 'Confirm Admission'}
            </button>
            
            {app.admissionStatus === 'Allocated' && (app.feeStatus !== 'Paid' || !isDocsVerified) && (
              <p className="text-xs text-slate-500 mt-3 text-center">
                Fee must be Paid and Docs Verified to confirm admission.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
