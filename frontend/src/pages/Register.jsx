import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, UserCircle, AlertCircle, ArrowRight } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const regResult = await register(email, password);
    if (regResult.success) {
      // Auto login after registration
      const loginResult = await login(email, password);
      setLoading(false);
      if (loginResult.success) {
        navigate('/dashboard');
      } else {
        navigate('/login'); // Fallback to login if auto-login fails
      }
    } else {
      setLoading(false);
      setError(regResult.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl shadow-xl p-8 border border-slate-700">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-textMuted">Join our support platform today</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-500">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-3 mb-6">
            <button type="button" className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-slate-600 rounded-xl shadow-sm text-sm font-semibold text-white hover:bg-slate-800 transition-colors">
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>
            <div className="relative flex items-center my-2">
              <div className="flex-grow border-t border-slate-700"></div>
              <span className="flex-shrink-0 mx-4 text-textMuted text-xs font-medium uppercase">or continue with email</span>
              <div className="flex-grow border-t border-slate-700"></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-xl bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-textMuted mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-xl bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary hover:bg-primaryHover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-textMuted">Already have an account? </span>
            <Link to="/login" className="font-semibold text-primary hover:text-primaryHover transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
