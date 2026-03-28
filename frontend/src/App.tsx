import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

import MasterSetup from './pages/admin/MasterSetup';
import SeatMatrix from './pages/admin/SeatMatrix';

import ApplicantList from './pages/officer/ApplicantList';
import NewApplicant from './pages/officer/NewApplicant';
import ApplicantDetail from './pages/officer/ApplicantDetail';

import Dashboard from './pages/management/Dashboard';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Root redirect based on role */}
      <Route path="/" element={
        user ? (
          user.role === 'ADMIN' ? <Navigate to="/admin/setup" replace /> :
          user.role === 'OFFICER' ? <Navigate to="/applicants" replace /> :
          user.role === 'MANAGEMENT' ? <Navigate to="/dashboard" replace /> :
          <Navigate to="/login" replace />
        ) : <Navigate to="/login" replace />
      } />

      <Route element={<DashboardLayout />}>
        {/* Admin Routes */}
        <Route element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route path="/admin/setup" element={<MasterSetup />} />
          <Route path="/admin/seat-matrix" element={<SeatMatrix />} />
        </Route>

        {/* Officer Routes */}
        <Route element={<ProtectedRoute roles={['OFFICER']} />}>
          <Route path="/applicants" element={<ApplicantList />} />
          <Route path="/applicants/new" element={<NewApplicant />} />
          <Route path="/applicants/:id" element={<ApplicantDetail />} />
        </Route>

        {/* Management Routes */}
        <Route element={<ProtectedRoute roles={['MANAGEMENT', 'ADMIN']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
