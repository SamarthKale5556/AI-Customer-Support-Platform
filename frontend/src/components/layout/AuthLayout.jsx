import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, GitMerge, Database, Activity } from 'lucide-react';

export default function AuthLayout() {
  const location = useLocation();

  const featureBadges = [
    { icon: Bot, text: 'AI Auto Replies' },
    { icon: GitMerge, text: 'Smart Escalation' },
    { icon: Database, text: 'Knowledge Base RAG' },
    { icon: Activity, text: 'Real-time Analytics' },
  ];

  return (
    <div className="min-h-screen flex bg-[#0a0a0b] text-textMain font-sans overflow-hidden">
      {/* Universal Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/login_bg.png" 
          alt="3D Abstract Background" 
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0b] via-[#0a0a0b]/80 to-[#0a0a0b]/40 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0b] via-transparent to-[#0a0a0b]/30" />
      </div>

      {/* Left Visual Section (60%) */}
      <div className="hidden lg:flex w-[60%] relative flex-col justify-between p-12 overflow-hidden z-10">
        
        {/* Header (Logo & Nav) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight cursor-pointer">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-primary">
              <path d="M14 4H7C5.34315 4 4 5.34315 4 7V15C4 16.6569 5.34315 18 7 18H8L6 22L11 18H15C16.6569 18 18 16.6569 18 15V9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 11.5L11 14.5L16 8.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19 1.5C19 4 20.5 5.5 23 5.5C20.5 5.5 19 7 19 9.5C19 7 17.5 5.5 15 5.5C17.5 5.5 19 4 19 1.5Z" fill="currentColor" />
            </svg>
            <span>
              <span className="text-white">Resolve</span>
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">AI</span>
            </span>
          </div>
          <nav className="flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#" className="hover:text-white transition">Home</a>
            <a href="#" className="hover:text-white transition">About Us</a>
            <a href="#" className="hover:text-white transition">Features</a>
            <a href="#" className="hover:text-white transition">Pricing</a>
            <a href="#" className="hover:text-white transition">Contact</a>
            <Link to="/login" className="text-primary hover:text-primaryHover transition relative after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-primary">
              Login
            </Link>
          </nav>
        </div>

        {/* Content */}
        <div className="max-w-xl mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 mb-6 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded-full shadow-sm shadow-primary/10 backdrop-blur-md">
              Enterprise Grade
            </span>
            <h1 className="text-5xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              Autonomous Customer Support Platform
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-10 max-w-md">
              AI-powered ticket resolution, knowledge base, analytics, and customer support automation. Built for modern SaaS.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {featureBadges.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + (i * 0.1) }}
                    className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default shadow-sm"
                  >
                    <div className="p-2 bg-primary/20 text-primary rounded-lg">
                      <Icon size={16} />
                    </div>
                    <span className="text-sm font-medium text-slate-200">{feature.text}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="text-sm text-slate-500 font-medium">
          © 2026 ResolveAI. All rights reserved.
        </div>
      </div>

      {/* Right Authentication Panel (40%) */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-6 sm:p-12 lg:p-16 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div 
            key={location.pathname}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-[480px]"
          >
            {/* The Outlet holds Login or Register */}
            <div className="bg-[#121214]/60 backdrop-blur-2xl rounded-[2rem] p-8 sm:p-10 shadow-2xl border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-blue-500 opacity-80" />
              
              {/* Mobile Logo Fallback */}
              <div className="lg:hidden flex items-center gap-2 font-bold text-2xl tracking-tight mb-8">
                <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-primary">
                  <path d="M14 4H7C5.34315 4 4 5.34315 4 7V15C4 16.6569 5.34315 18 7 18H8L6 22L11 18H15C16.6569 18 18 16.6569 18 15V9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 11.5L11 14.5L16 8.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M19 1.5C19 4 20.5 5.5 23 5.5C20.5 5.5 19 7 19 9.5C19 7 17.5 5.5 15 5.5C17.5 5.5 19 4 19 1.5Z" fill="currentColor" />
                </svg>
                <span className="text-white">ResolveAI</span>
              </div>

              <Outlet />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
