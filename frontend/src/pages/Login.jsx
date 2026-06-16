import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Failed to login');
    }
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-[28px] font-extrabold text-white mb-2 tracking-tight">Welcome Back</h2>
        <p className="text-slate-400 text-[15px] font-medium">Sign in to your ResolveAI account.</p>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400"
        >
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-300">Email Address</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
              <Mail size={18} />
            </div>
            <input
              type="email"
              required
              className="block w-full pl-10 pr-4 py-3.5 border border-white/10 rounded-xl bg-black/20 text-white font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-300">Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
              <Lock size={18} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              className="block w-full pl-10 pr-12 py-3.5 border border-white/10 rounded-xl bg-black/20 text-white font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-inner"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input type="checkbox" className="peer sr-only" />
              <div className="w-5 h-5 border-2 border-slate-600 rounded peer-checked:bg-primary peer-checked:border-primary transition-colors"></div>
              <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span className="text-sm font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">Remember me</span>
          </label>
          <a href="#" className="text-sm font-bold text-primary hover:text-primaryHover transition-colors">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] text-[15px] font-bold text-white bg-primary hover:bg-primaryHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#121214] focus:ring-primary transition-all disabled:opacity-50 mt-4 active:scale-[0.98]"
        >
          {loading ? 'Signing in...' : 'Sign In'}
          {!loading && <ArrowRight size={18} className="ml-1" />}
        </button>
      </form>

      <div className="relative flex items-center my-8">
        <div className="flex-grow border-t border-white/10"></div>
        <span className="flex-shrink-0 mx-4 text-slate-500 text-xs font-bold uppercase tracking-wider">or</span>
        <div className="flex-grow border-t border-white/10"></div>
      </div>

      <button type="button" className="w-full flex justify-center items-center gap-3 py-3.5 px-4 border border-white/10 rounded-xl shadow-sm text-[15px] font-bold text-white bg-white/5 hover:bg-white/10 transition-all active:scale-[0.98]">
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>
      
      <div className="mt-8 text-center text-[15px] font-semibold">
        <span className="text-slate-400">Don't have an account? </span>
        <Link to="/register" className="font-bold text-primary hover:text-primaryHover transition-colors">
          Create account
        </Link>
      </div>
    </>
  );
}
