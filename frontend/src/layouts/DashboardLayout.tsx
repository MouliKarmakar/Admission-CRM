import React from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Settings, LayoutDashboard, LogOut, FileText } from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { label: 'Master Setup', path: '/admin/setup', icon: Settings, roles: ['ADMIN'] },
    { label: 'Seat Matrix', path: '/admin/seat-matrix', icon: FileText, roles: ['ADMIN'] },
    { label: 'Applicants', path: '/applicants', icon: Users, roles: ['OFFICER'] },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['MANAGEMENT', 'ADMIN'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-primary-600">Admission CRM</h1>
          <p className="text-xs text-slate-500 mt-1 capitalize">{user.role.toLowerCase()} Panel</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-primary-600' : 'text-slate-400'} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-2 w-full rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header className="bg-white border-b border-slate-200 p-4 flex justify-between items-center md:hidden">
          <h1 className="text-lg font-bold text-primary-600">Admission CRM</h1>
          <button onClick={logout} className="p-2 text-slate-600 hover:text-red-600">
            <LogOut size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
