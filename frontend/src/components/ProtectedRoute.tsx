import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  roles?: string[];
}

export default function ProtectedRoute({ roles }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Redirect to fallback based on role
    if (user.role === 'ADMIN') return <Navigate to="/admin/setup" replace />;
    if (user.role === 'OFFICER') return <Navigate to="/applicants" replace />;
    if (user.role === 'MANAGEMENT') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
