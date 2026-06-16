import React from 'react';
import { Search, Bell, Activity, Moon, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export default function TopNavbar() {
  const { user } = useAuth();

  return (
    <div className="h-14 border-b border-border bg-surface flex items-center justify-between px-6 shrink-0 z-20">
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
          <input 
            type="text" 
            placeholder="Search tickets, customers, or knowledge base..." 
            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-textMuted text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* AI Status */}
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
          <Activity className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">AI Systems Active</span>
        </div>

        <div className="flex items-center gap-2 border-r border-border pr-4">
          <button className="p-2 text-textMuted hover:text-white hover:bg-white/5 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border-2 border-surface"></span>
          </button>
          <button className="p-2 text-textMuted hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Moon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 pl-2">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-medium text-white leading-tight">{user?.name}</span>
            <span className="text-xs text-textMuted">{user?.role}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-sm cursor-pointer">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </div>
  );
}
