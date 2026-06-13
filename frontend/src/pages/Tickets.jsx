import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Ticket, ArrowLeft, MessageSquare, Clock, CheckCircle2, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Tickets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets');
      setTickets(response.data);
    } catch (error) {
      console.error("Failed to load tickets", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    try {
      await api.post('/tickets', {
        title: newTitle,
        description: newDescription,
        priority: 'Medium'
      });
      
      setNewTitle('');
      setNewDescription('');
      setShowForm(false);
      fetchTickets(); // Refresh list after creation
    } catch (error) {
      console.error("Failed to create ticket", error);
    }
  };

  const getStatusColor = (status) => {
    return status === 'Open' 
      ? 'bg-amber-500/20 text-amber-500 border-amber-500/50' 
      : 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50';
  };

  return (
    <div className="min-h-screen bg-background text-textMain pb-12">
      {/* Navigation */}
      <nav className="bg-surface border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-300 hover:text-white">
                <ArrowLeft size={20} />
              </Link>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/20 rounded-lg">
                  <Ticket className="text-primary" size={20} />
                </div>
                <span className="text-xl font-bold tracking-tight">Tickets</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-sm text-slate-300">
                {user?.email}
              </div>
              <div className="h-8 w-8 bg-slate-700 rounded-full flex items-center justify-center font-bold text-slate-300">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Support Tickets</h1>
            <p className="text-textMuted">View and manage your support requests.</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primaryHover text-white font-medium rounded-xl shadow-sm transition-colors"
          >
            {showForm ? 'Cancel' : <><Plus size={18} /> New Ticket</>}
          </button>
        </div>

        {showForm && (
          <div className="mb-8 bg-surface border border-slate-700 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-xl font-bold mb-4">Create a New Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Issue Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="block w-full px-4 py-2 border border-slate-600 rounded-xl bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="e.g. Cannot access my dashboard"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Description</label>
                <textarea
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows="4"
                  className="block w-full px-4 py-2 border border-slate-600 rounded-xl bg-slate-800/50 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Please describe your issue in detail..."
                ></textarea>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary hover:bg-primaryHover text-white font-medium rounded-xl shadow-sm transition-colors"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-surface border border-slate-700 hover:border-slate-500 transition-colors rounded-2xl p-5 shadow-sm group">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{ticket.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                      {ticket.status === 'Open' ? <Circle size={10} className="mr-1.5" /> : <CheckCircle2 size={10} className="mr-1.5" />}
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-slate-300 mb-4">{ticket.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-textMuted">
                    <div className="flex items-center gap-1.5">
                      <Clock size={16} />
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare size={16} />
                      1 message
                    </div>
                  </div>
                </div>
                
                <Link to={`/tickets/${ticket.id}`} className="self-start sm:self-center px-4 py-2 bg-slate-800 group-hover:bg-slate-700 text-sm font-medium rounded-lg border border-slate-600 transition-colors">
                  View Details
                </Link>
              </div>
            </div>
          ))}
          
          {tickets.length === 0 && (
            <div className="text-center py-12 bg-surface border border-slate-700 rounded-2xl border-dashed">
              <Ticket className="mx-auto h-12 w-12 text-slate-500 mb-3" />
              <h3 className="text-lg font-medium text-white mb-1">No tickets yet</h3>
              <p className="text-slate-400">Create a new ticket to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
