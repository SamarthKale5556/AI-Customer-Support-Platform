import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-primary/20 text-primary border-primary/50';
      case 'agent': return 'bg-accent/20 text-accent border-accent/50';
      default: return 'bg-success/20 text-success border-success/50';
    }
  };

  return (
    <div className="h-full bg-background text-textMain overflow-y-auto">
      <main className="max-w-5xl mx-auto p-8 space-y-8">
        
        <header>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋</h1>
          <p className="text-textMuted text-sm mt-1">Here is an overview of your account details.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="col-span-1 md:col-span-2 bg-surface border border-border rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
              <div className="h-16 w-16 bg-gradient-to-tr from-primary to-blue-500 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-glow">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                <p className="text-textMuted text-sm">{user?.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-background rounded-xl border border-border">
                <Shield className="text-primary mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-textMuted font-medium mb-1 uppercase tracking-wider">Account Role</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${getRoleBadgeColor(user?.role)}`}>
                    {user?.role || 'Customer'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-background rounded-xl border border-border">
                <Clock className="text-primary mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-textMuted font-medium mb-1 uppercase tracking-wider">Member Since</p>
                  <p className="font-semibold text-sm text-white">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Today'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions / Info Card */}
          <div className="col-span-1 bg-surface border border-border rounded-2xl p-6 flex flex-col">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <User className="text-primary" size={16} />
              Account Status
            </h3>
            
            <div className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-background rounded-xl border border-border">
              <div className="h-12 w-12 bg-success/10 text-success rounded-full flex items-center justify-center mb-3">
                <Shield size={24} />
              </div>
              <p className="font-medium text-success text-sm">Active & Secure</p>
              <p className="text-xs text-textMuted mt-2">Your authentication token is valid.</p>
            </div>
          </div>
        </div>

        {/* Tickets Module */}
        <div className="mt-8 bg-surface border border-border rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Support Tickets</h3>
              <p className="text-sm text-textMuted max-w-xl">
                Create and manage your support requests. View ticket status and chat directly with our AI assistant or support agents.
              </p>
            </div>
            <Link to="/tickets" className="px-5 py-2 bg-primary hover:bg-primaryHover text-white text-sm font-medium rounded-lg shadow-sm transition-colors whitespace-nowrap">
              Go to Inbox
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
