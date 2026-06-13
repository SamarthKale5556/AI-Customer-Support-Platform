import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Database, Clock, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchTickets();
    fetchAnalytics();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets');
      setTickets(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const COLORS = ['#10B981', '#F59E0B', '#EF4444']; // Positive, Neutral, Negative

  let sentimentData = [];
  if (analytics) {
    sentimentData = [
      { name: 'Positive', value: analytics.sentiments.Positive || 0 },
      { name: 'Neutral', value: analytics.sentiments.Neutral || 0 },
      { name: 'Negative', value: analytics.sentiments.Negative || 0 }
    ];
  }

  const ticketStatusData = analytics ? [
    { name: 'Open', count: analytics.open },
    { name: 'Pending', count: analytics.pending },
    { name: 'Closed', count: analytics.closed }
  ] : [];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center pb-6 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="text-red-500" /> Admin Command Center
            </h1>
            <p className="text-gray-400 mt-2">System overview and analytics</p>
          </div>
          <div className="flex gap-4 items-center">
            <Link to="/kb" className="px-4 py-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 rounded-xl font-medium transition-colors">
              Manage Knowledge Base
            </Link>
            <button onClick={logout} className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl font-medium transition-colors">
              Sign Out
            </button>
          </div>
        </header>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <Database className="w-6 h-6 text-gray-400 mb-4" />
            <h2 className="font-semibold text-lg text-gray-400">Total Tickets</h2>
            <p className="text-4xl font-bold mt-2">{analytics ? analytics.total : '-'}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <AlertCircle className="w-6 h-6 text-yellow-400 mb-4" />
            <h2 className="font-semibold text-lg text-gray-400">Open Tickets</h2>
            <p className="text-4xl font-bold mt-2">{analytics ? analytics.open : '-'}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <CheckCircle className="w-6 h-6 text-green-400 mb-4" />
            <h2 className="font-semibold text-lg text-gray-400">Closed Tickets</h2>
            <p className="text-4xl font-bold mt-2">{analytics ? analytics.closed : '-'}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <Clock className="w-6 h-6 text-blue-400 mb-4" />
            <h2 className="font-semibold text-lg text-gray-400">Avg Resolution</h2>
            <p className="text-4xl font-bold mt-2">{analytics ? analytics.average_resolution_time : '-'}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6">Sentiment Distribution</h2>
            <div className="h-64">
              {analytics && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-6">Ticket Status</h2>
            <div className="h-64">
              {analytics && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ticketStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" allowDecimals={false} />
                    <Tooltip cursor={{fill: '#222'}} contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
                    <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">System Ticket Monitoring</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Assigned To</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="py-3 px-4">#{ticket.id}</td>
                    <td className="py-3 px-4 font-medium">{ticket.title}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-white/10 rounded-md text-xs">{ticket.status}</span>
                    </td>
                    <td className="py-3 px-4">{ticket.priority}</td>
                    <td className="py-3 px-4">{ticket.assigned_to ? `User ${ticket.assigned_to}` : 'Unassigned'}</td>
                    <td className="py-3 px-4">
                      <Link to={`/tickets/${ticket.id}`} className="text-blue-400 hover:text-blue-300 text-sm">Inspect</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
