import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { Toaster, toast } from 'react-hot-toast';
import { useEffect } from 'react';

import Workspace from './pages/Workspace';
import AgentDashboard from './pages/AgentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import KnowledgeBase from './pages/KnowledgeBase';
import Layout from './components/layout/Layout';
import AuthLayout from './components/layout/AuthLayout';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <Layout>{children}</Layout>;
};

const GlobalNotificationListener = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/notifications`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW_TICKET' && user.role !== 'Customer') {
        toast.success(data.message, { icon: '🎫' });
      } else if (data.type === 'TICKET_ASSIGNED' && user.role !== 'Customer') {
        toast(data.message, { icon: '👤' });
      } else if (data.type === 'TICKET_CLOSED') {
        toast(data.message, { icon: '✅' });
      } else if (data.type === 'NEGATIVE_SENTIMENT' && user.role !== 'Customer') {
        toast.error(data.message, { icon: '🚨' });
      }
    };

    return () => {
      ws.close();
    };
  }, [user]);

  return <Toaster position="top-right" 
    toastOptions={{
      style: {
        background: '#18181b', // zinc-900
        color: '#f4f4f5',
        border: '1px solid #27272a'
      }
    }}
  />;
};

function App() {
  return (
    <AuthProvider>
      <GlobalNotificationListener />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <RoleBasedDashboard />
            </ProtectedRoute>
          } />
          <Route path="/tickets" element={
            <ProtectedRoute>
              <Workspace />
            </ProtectedRoute>
          } />
          <Route path="/tickets/:id" element={
            <ProtectedRoute>
              <Workspace />
            </ProtectedRoute>
          } />
          <Route path="/kb" element={
            <ProtectedRoute>
              <KnowledgeBase />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

const RoleBasedDashboard = () => {
  const { user } = useAuth();
  if (user?.role === 'Admin') return <AdminDashboard />;
  if (user?.role === 'Agent') return <AgentDashboard />;
  return <Dashboard />;
};

export default App;
