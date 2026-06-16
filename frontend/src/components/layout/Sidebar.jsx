import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Inbox, BookOpen, Settings, LogOut, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['Admin', 'Agent', 'Customer'] },
    { name: 'Inbox', icon: Inbox, path: '/tickets', roles: ['Admin', 'Agent', 'Customer'] },
    { name: 'Knowledge Base', icon: BookOpen, path: '/kb', roles: ['Admin'] },
  ];

  return (
    <div className="w-64 bg-surface border-r border-border h-dvh flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-7 h-7 text-white"
          >
            <path 
              d="M14 4H7C5.34315 4 4 5.34315 4 7V15C4 16.6569 5.34315 18 7 18H8L6 22L11 18H15C16.6569 18 18 16.6569 18 15V9" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            <path 
              d="M8 11.5L11 14.5L16 8.5" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            <path 
              d="M19 1.5C19 4 20.5 5.5 23 5.5C20.5 5.5 19 7 19 9.5C19 7 17.5 5.5 15 5.5C17.5 5.5 19 4 19 1.5Z" 
              fill="currentColor" 
            />
          </svg>
          <span>
            <span className="text-white">Resolve</span>
            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">AI</span>
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
        {navItems.filter(item => item.roles.includes(user?.role)).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === '/tickets' && location.pathname.startsWith('/tickets'));
          
          return (
            <NavLink 
              key={item.name} 
              to={item.path}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav-bg" 
                  className="absolute inset-0 bg-primary/10 rounded-lg border border-primary/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-primary' : ''}`} />
              <span className="relative z-10">{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-border shrink-0">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm font-medium text-white truncate">{user?.name}</span>
            <span className="text-xs text-textMuted truncate">{user?.role}</span>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-textMuted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
