import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield, Clock, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'agent': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-background text-textMain">
      {/* Navigation */}
      <nav className="bg-surface border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/20 rounded-lg">
                <LayoutDashboard className="text-primary" size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight">SupportHub</span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋</h1>
          <p className="text-textMuted">Here is an overview of your account details.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="col-span-1 md:col-span-2 bg-surface border border-slate-700 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700">
              <div className="h-16 w-16 bg-slate-700 rounded-full flex items-center justify-center text-2xl font-bold text-slate-300">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-textMuted">{user?.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <Shield className="text-primary mt-1" size={20} />
                <div>
                  <p className="text-sm text-textMuted font-medium mb-1">Account Role</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user?.role)}`}>
                    {user?.role || 'Customer'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <Clock className="text-primary mt-1" size={20} />
                <div>
                  <p className="text-sm text-textMuted font-medium mb-1">Member Since</p>
                  <p className="font-semibold">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions / Info Card */}
          <div className="col-span-1 bg-surface border border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <User className="text-primary" size={20} />
              Account Status
            </h3>
            
            <div className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-slate-800/30 rounded-xl border border-slate-700/30 border-dashed">
              <div className="h-12 w-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                <Shield size={24} />
              </div>
              <p className="font-medium text-emerald-400">Active & Secure</p>
              <p className="text-sm text-textMuted mt-2">Your authentication token is valid and session is active.</p>
            </div>
          </div>
        </div>

        {/* Tickets Module */}
        <div className="mt-8 bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-2xl p-6">
          <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Support Tickets</h3>
              <p className="text-sm text-textMuted max-w-xl">
                Create and manage your support requests easily. View ticket status, descriptions, and submit new tickets instantly.
              </p>
            </div>
            <Link to="/tickets" className="px-6 py-2 bg-primary hover:bg-primaryHover text-white text-sm font-medium rounded-xl shadow-sm transition-colors whitespace-nowrap">
              Go to Tickets
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
