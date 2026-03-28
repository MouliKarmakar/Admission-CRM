import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const res = await api.post('/auth/login', { username, password, role });
      login(res.data.token, res.data.user);
      
      if (role === 'ADMIN') navigate('/admin/setup');
      else if (role === 'OFFICER') navigate('/applicants');
      else if (role === 'MANAGEMENT') navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
            <LogIn size={24} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">College Admission CRM</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="ADMIN">Admin</option>
              <option value="OFFICER">Admission Officer</option>
              <option value="MANAGEMENT">Management</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-primary-600 text-white font-medium py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <h3 className="text-sm font-medium text-slate-600 mb-3">Demo Credentials</h3>
          <ul className="text-xs text-slate-500 space-y-2">
            <li><strong className="text-slate-700">Admin:</strong> admin / admin123</li>
            <li><strong className="text-slate-700">Officer:</strong> officer / officer123</li>
            <li><strong className="text-slate-700">Management:</strong> management / mgmt123</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
