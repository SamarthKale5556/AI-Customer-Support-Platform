import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Ticket, CheckCircle2, Circle, Sparkles, AlertTriangle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function AgentDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [metrics, setMetrics] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    aiResolved: 0,
    escalations: 0,
    chartData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ticketsRes, metricsRes] = await Promise.all([
        api.get('/tickets'),
        api.get('/dashboard-metrics')
      ]);
      setTickets(ticketsRes.data);
      setMetrics(metricsRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const KpiCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-surface border border-border p-5 rounded-2xl flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <span className="text-textMuted text-sm font-medium">{title}</span>
        <div className={cn("p-2 rounded-lg", colorClass)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-background text-textMain overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Overview</h1>
            <p className="text-textMuted text-sm mt-1">Monitor support operations and AI performance.</p>
          </div>
          <div className="flex gap-3 items-center">
            <span className="flex items-center gap-2 text-sm text-textMuted bg-surface border border-border px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              Live Data
            </span>
          </div>
        </header>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard title="Total Tickets" value={metrics.totalTickets} icon={Ticket} colorClass="bg-blue-500/10 text-blue-500" />
          <KpiCard title="Open Tickets" value={metrics.openTickets} icon={Circle} colorClass="bg-warning/10 text-warning" />
          <KpiCard title="Resolved Tickets" value={metrics.resolvedTickets} icon={CheckCircle2} colorClass="bg-success/10 text-success" />
          <KpiCard title="AI Auto-Resolved" value={metrics.aiResolved} icon={Sparkles} colorClass="bg-primary/10 text-primary" />
          <KpiCard title="Escalations" value={metrics.escalations} icon={AlertTriangle} colorClass="bg-danger/10 text-danger" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-6">Volume vs Resolution (Last 7 Days)</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6d28d9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6d28d9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                    itemStyle={{ color: '#f4f4f5' }}
                  />
                  <Area type="monotone" dataKey="tickets" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTickets)" />
                  <Area type="monotone" dataKey="resolved" stroke="#6d28d9" fillOpacity={1} fill="url(#colorResolved)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Unassigned Queue */}
          <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-white">Recent Queue</h2>
              <Link to="/tickets" className="text-xs text-primary hover:text-primaryHover font-medium">View All</Link>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3">
              {loading ? (
                <div className="text-sm text-textMuted">Loading...</div>
              ) : tickets.slice(0, 6).map(ticket => (
                <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="block group">
                  <div className="p-3 bg-background border border-border group-hover:border-primary/50 rounded-xl transition">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-white truncate max-w-[180px]">{ticket.title}</span>
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                        ticket.status === 'Open' ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                      )}>{ticket.status}</span>
                    </div>
                    <p className="text-xs text-textMuted line-clamp-1">{ticket.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
