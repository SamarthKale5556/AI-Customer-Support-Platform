import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Ticket, Users, Activity, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function AgentDashboard() {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets');
      setTickets(response.data);
    } catch (error) {
      console.error("Error fetching tickets", error);
    } finally {
      setLoading(false);
    }
  };

  const assignTicket = async (ticketId) => {
    try {
      await api.put(`/tickets/${ticketId}`, { assigned_to: user.id });
      fetchTickets();
    } catch (error) {
      console.error("Error assigning ticket", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Closed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'Pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      default: return <Circle className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center pb-6 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-bold">Agent Workspace</h1>
            <p className="text-gray-400 mt-2">Welcome back, {user?.name}</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="bg-blue-500/10 text-blue-500 px-4 py-2 rounded-xl flex items-center gap-2 font-medium">
              <Activity className="w-5 h-5" /> Active Status
            </div>
            <button onClick={logout} className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl font-medium transition-colors">
              Sign Out
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4 text-gray-400 mb-4">
              <Ticket className="w-6 h-6 text-purple-400" />
              <h2 className="font-semibold text-lg">My Queue</h2>
            </div>
            <p className="text-4xl font-bold">{tickets.filter(t => t.assigned_to === user?.id).length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4 text-gray-400 mb-4">
              <Users className="w-6 h-6 text-blue-400" />
              <h2 className="font-semibold text-lg">Unassigned</h2>
            </div>
            <p className="text-4xl font-bold">{tickets.filter(t => !t.assigned_to).length}</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">Global Ticket Queue</h2>
          {loading ? (
            <div className="text-center py-10 text-gray-400">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No tickets found.</div>
          ) : (
            <div className="space-y-4">
              {tickets.map(ticket => (
                <div key={ticket.id} className="bg-black/40 border border-white/5 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 transition hover:bg-white/5">
                  <div className="flex items-center gap-4 flex-1">
                    {getStatusIcon(ticket.status)}
                    <div>
                      <h3 className="font-semibold text-lg">{ticket.title}</h3>
                      <p className="text-gray-400 text-sm">Priority: {ticket.priority} • Ticket #{ticket.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {ticket.assigned_to === user?.id ? (
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium border border-green-500/20">My Ticket</span>
                    ) : !ticket.assigned_to ? (
                      <button onClick={() => assignTicket(ticket.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm transition">
                        Assign to Me
                      </button>
                    ) : (
                      <span className="text-gray-500 text-sm">Assigned</span>
                    )}
                    
                    <Link to={`/tickets/${ticket.id}`} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm transition font-medium">
                      View Chat
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
