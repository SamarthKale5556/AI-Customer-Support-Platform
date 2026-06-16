import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Search, Filter, MoreVertical, Send, User, Clock, CheckCircle2, 
  Circle, Sparkles, Activity, FileText, Settings2, ShieldAlert, Wifi, WifiOff, LayoutTemplate, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';

export default function Workspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // --- Inbox State ---
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- Active Ticket State ---
  const [activeTicket, setActiveTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  // --- Copilot State ---
  const [suggestions, setSuggestions] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAutoReplyEnabled, setAiAutoReplyEnabled] = useState(true);

  // --- New Ticket Form State ---
  const [isComposing, setIsComposing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const isAgent = user?.role === 'Agent' || user?.role === 'Admin';

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (id) {
      setIsComposing(false);
      fetchTicketAndMessages(id);
      connectWebSocket(id);
    } else {
      setActiveTicket(null);
      setMessages([]);
      if (ws.current) ws.current.close();
    }
    return () => {
      if (ws.current) ws.current.close();
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets');
      setTickets(response.data);
    } catch (error) {
      console.error("Failed to load tickets", error);
    } finally {
      setLoadingTickets(false);
    }
  };

  const fetchTicketAndMessages = async (ticketId) => {
    try {
      const ticketRes = await api.get(`/tickets/${ticketId}`);
      setActiveTicket(ticketRes.data);
      const msgRes = await api.get(`/messages/${ticketId}`);
      setMessages(msgRes.data);
      
      // Reset AI states when switching tickets
      setSuggestions(null);
      setSentiment(null);
      setSummary(null);
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };

  const connectWebSocket = (ticketId) => {
    if (ws.current) ws.current.close();
    const wsUrl = `ws://localhost:8000/ws/chat/${ticketId}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => setIsConnected(true);
    ws.current.onmessage = (event) => {
      const newMsg = JSON.parse(event.data);
      if (newMsg.type === "typing") {
        setIsTyping(true);
      } else {
        setIsTyping(false);
        setMessages(prev => [...prev, newMsg]);
      }
    };
    ws.current.onclose = () => setIsConnected(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeTicket || activeTicket.status === 'Closed') return;

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const payload = { sender_id: user?.id || 1, message: newMessage };
      ws.current.send(JSON.stringify(payload));
      setNewMessage('');
    } else {
      toast.error("WebSocket is not connected");
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    try {
      const res = await api.post('/tickets', { title: newTitle, description: newDescription, priority: 'Medium' });
      setNewTitle('');
      setNewDescription('');
      setIsComposing(false);
      await fetchTickets();
      navigate(`/tickets/${res.data.id}`);
    } catch (error) {
      console.error("Failed to create ticket", error);
      toast.error("Failed to create ticket");
    }
  };

  // --- AI Features ---
  const fetchSuggestions = async () => {
    setIsAiLoading(true);
    try {
      const res = await api.post(`/ai/reply-suggestions/${id}`);
      setSuggestions(res.data);
      toast.success('Generated suggestions');
    } catch (e) {
      toast.error('Failed to get suggestions');
    } finally {
      setIsAiLoading(false);
    }
  };

  const fetchSentiment = async () => {
    setIsAiLoading(true);
    try {
      const res = await api.post(`/ai/analyze-sentiment/${id}`);
      setSentiment(res.data.sentiment);
      toast.success('Sentiment analyzed');
    } catch (e) {
      toast.error('Failed to analyze sentiment');
    } finally {
      setIsAiLoading(false);
    }
  };

  const fetchSummary = async () => {
    setIsAiLoading(true);
    try {
      const res = await api.post(`/ai/summarize/${id}`);
      setSummary(res.data.summary);
      toast.success('Chat summarized');
    } catch (e) {
      toast.error('Failed to summarize chat');
    } finally {
      setIsAiLoading(false);
    }
  };

  const toggleAiAutoReply = async () => {
    try {
      await api.post(`/tickets/${id}/ai-settings`, { disable_ai_auto_reply: aiAutoReplyEnabled });
      setAiAutoReplyEnabled(!aiAutoReplyEnabled);
      toast.success(aiAutoReplyEnabled ? 'AI Auto-reply disabled' : 'AI Auto-reply enabled');
    } catch (e) {
      toast.error('Failed to update AI settings');
    }
  };

  const filteredTickets = tickets.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="flex h-full w-full bg-background overflow-hidden text-textMain text-sm">
      
      {/* COLUMN 2: INBOX */}
      <div className="w-80 border-r border-border bg-surface flex flex-col shrink-0">
        <div className="p-4 border-b border-border flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-white tracking-tight">Inbox</h2>
            <button 
              onClick={() => { navigate('/tickets'); setIsComposing(true); }}
              className="p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textMuted" />
            <input 
              type="text" 
              placeholder="Search tickets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-textMuted"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingTickets ? (
            <div className="p-6 text-center text-textMuted">Loading...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-6 text-center text-textMuted">No tickets found</div>
          ) : (
            filteredTickets.map(ticket => {
              const isActive = id === ticket.id.toString() && !isComposing;
              return (
                <Link 
                  key={ticket.id} 
                  to={`/tickets/${ticket.id}`}
                  className={cn(
                    "block p-4 border-b border-border transition-colors hover:bg-surfaceHover relative",
                    isActive ? "bg-surfaceHover" : ""
                  )}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />}
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <span className="font-medium text-white truncate">{ticket.title}</span>
                    <span className="text-xs text-textMuted whitespace-nowrap">
                      {new Date(ticket.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-textMuted line-clamp-2 mb-2">{ticket.description}</p>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-sm",
                      ticket.status === 'Open' ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                    )}>
                      {ticket.status}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-sm bg-border text-textMuted">
                      {ticket.priority}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* COLUMN 3: CONVERSATION */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative">
        {isComposing ? (
          <div className="flex-1 flex flex-col p-8 max-w-2xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Ticket</h2>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Issue Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="block w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:outline-none focus:border-primary transition-all"
                  placeholder="e.g. Cannot access my dashboard"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textMuted mb-1">Description</label>
                <textarea
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows="6"
                  className="block w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:outline-none focus:border-primary transition-all resize-none"
                  placeholder="Please describe your issue in detail..."
                />
              </div>
              <div className="flex justify-end pt-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="px-4 py-2 bg-surface hover:bg-surfaceHover text-white font-medium rounded-lg transition-colors border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary hover:bg-primaryHover text-white font-medium rounded-lg transition-colors"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        ) : !activeTicket ? (
          <div className="flex-1 flex items-center justify-center flex-col text-textMuted">
            <LayoutTemplate className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium text-white mb-1">No ticket selected</p>
            <p>Select a ticket from the inbox or create a new one.</p>
          </div>
        ) : (
          <>
            <div className="h-16 px-6 border-b border-border flex items-center justify-between shrink-0 bg-background/80 backdrop-blur-md z-10 sticky top-0">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-white text-lg">{activeTicket.title}</h2>
                <span className={cn(
                  "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                  activeTicket.status === 'Open' ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                )}>
                  {activeTicket.status === 'Open' ? <Circle className="w-2 h-2 fill-current" /> : <CheckCircle2 className="w-3 h-3" />}
                  {activeTicket.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-textMuted">
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  {isConnected ? <Wifi className="w-3.5 h-3.5 text-success" /> : <WifiOff className="w-3.5 h-3.5 text-danger" />}
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
              <div className="w-full max-w-[700px] space-y-6">
                <div className="flex gap-4 justify-start">
                  <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center shrink-0 shadow-sm">
                    <User className="w-5 h-5 text-textMuted" />
                  </div>
                  <div className="max-w-[85%]">
                    <div className="flex items-center gap-2 mb-1.5 ml-1">
                      <span className="font-semibold text-white">Customer</span>
                      <span className="text-xs text-textMuted">{new Date(activeTicket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="bg-surface border border-border text-textMain px-[22px] py-[18px] rounded-2xl rounded-tl-sm shadow-sm text-[15px] leading-[1.7]">
                      <p className="whitespace-pre-wrap">{activeTicket.description}</p>
                    </div>
                  </div>
                </div>

                {messages.map((msg, i) => {
                  const isMe = msg.sender_id === (user?.id || 1);
                  const isAi = msg.sender_role === 'AI';
                  const isSystem = msg.sender_role === 'System';

                  if (isSystem) {
                    return (
                      <div key={msg.id || i} className="flex justify-center my-6">
                        <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2">
                          <ShieldAlert size={14} />
                          <span>{msg.message}</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id || i} 
                      className={cn("flex gap-4", isMe ? "justify-end" : "justify-start")}
                    >
                      {!isMe && (
                        <div className={cn(
                          "w-10 h-10 rounded-full border flex items-center justify-center shrink-0 mt-auto shadow-sm",
                          isAi ? "bg-primary/20 border-primary/30" : "bg-accent/20 border-accent/30"
                        )}>
                          {isAi ? <Sparkles className="w-5 h-5 text-primary" /> : <User className="w-5 h-5 text-accent" />}
                        </div>
                      )}
                      
                      <div className={cn("max-w-[85%]", isMe ? "items-end text-right" : "items-start")}>
                        {!isMe && (
                          <div className="flex items-center gap-2 mb-1.5 ml-1">
                            <span className="font-semibold text-white text-[13px]">{isAi ? 'ResolveAI' : 'Agent'}</span>
                            <span className="text-xs text-textMuted">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        )}
                        <div 
                          className={cn(
                            "px-[22px] py-[18px] shadow-sm whitespace-pre-wrap text-[15px] leading-[1.7]",
                            isMe ? "bg-primary text-white rounded-2xl rounded-br-sm" 
                                 : "bg-surface border border-border text-textMain rounded-2xl rounded-bl-sm",
                            isAi && !isMe ? "border-primary/20 bg-primary/5" : ""
                          )}
                        >
                          {msg.message}
                        </div>
                        {isMe && (
                          <div className="mt-1.5 mr-1">
                            <span className="text-xs text-textMuted font-medium">Sent</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                <AnimatePresence>
                  {isTyping && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex gap-4 justify-start"
                    >
                      <div className="w-10 h-10 bg-primary/20 border-primary/30 border rounded-full flex items-center justify-center shrink-0 mt-auto shadow-sm">
                        <Sparkles size={16} className="text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 ml-1">
                          <span className="font-semibold text-white text-[13px]">ResolveAI</span>
                        </div>
                        <div className="px-[22px] py-[18px] rounded-2xl bg-surface border border-primary/20 text-white rounded-bl-sm shadow-sm flex items-center gap-1.5 h-14">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} className="h-4" />
              </div>
            </div>

            <div className="p-4 bg-background border-t border-border flex justify-center">
              <div className="w-full max-w-[700px]">
                {activeTicket.status === 'Closed' ? (
                  <div className="text-center p-3 bg-surface rounded-lg border border-border text-textMuted text-sm flex items-center justify-center gap-2">
                    <Clock size={16} /> This ticket is closed.
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="relative flex items-end shadow-sm">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Reply to customer..."
                      disabled={!isConnected}
                      className="w-full bg-surface border border-border rounded-xl py-3.5 pl-4 pr-12 text-[15px] text-white placeholder:text-textMuted focus:outline-none focus:border-primary transition-all disabled:opacity-50 resize-none max-h-32 min-h-[52px]"
                      rows={1}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || !isConnected}
                      className="absolute right-2 bottom-2 p-2 bg-primary hover:bg-primaryHover text-white rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-primary"
                    >
                      <Send size={18} className="ml-0.5" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* COLUMN 4: AI COPILOT */}
      {isAgent && activeTicket && !isComposing && (
        <div className="w-80 border-l border-border bg-surface flex flex-col shrink-0">
          <div className="h-16 px-5 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Zap className="w-4 h-4" />
              Copilot
            </div>
            <button 
              onClick={toggleAiAutoReply}
              title={aiAutoReplyEnabled ? "Disable AI Auto-reply" : "Enable AI Auto-reply"}
              className={cn("p-1.5 rounded-md transition-colors", aiAutoReplyEnabled ? "bg-primary/20 text-primary" : "bg-border text-textMuted hover:text-white")}
            >
              <Settings2 size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* AI Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Summary
                </h3>
                <button onClick={fetchSummary} disabled={isAiLoading} className="text-[10px] font-medium bg-border hover:bg-surfaceHover text-white px-2 py-0.5 rounded transition">
                  Generate
                </button>
              </div>
              <div className="bg-background border border-border rounded-lg p-3 text-sm text-textMain leading-relaxed">
                {summary ? summary : <span className="text-textMuted italic">No summary generated yet.</span>}
              </div>
            </div>

            {/* Sentiment & Confidence */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Sentiment
                </h3>
                <div className="bg-background border border-border rounded-lg p-3 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 transition" onClick={fetchSentiment}>
                  {sentiment ? (
                    <span className={cn("text-lg font-bold", sentiment === 'Positive' ? 'text-success' : sentiment === 'Negative' ? 'text-danger' : 'text-warning')}>
                      {sentiment}
                    </span>
                  ) : (
                    <span className="text-xs text-textMuted">Analyze</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> AI Match
                </h3>
                <div className="bg-background border border-border rounded-lg p-3 flex flex-col items-center justify-center gap-1">
                  <span className="text-lg font-bold text-white">94%</span>
                </div>
              </div>
            </div>

            {/* Smart Replies */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Suggestions
                </h3>
                <button onClick={fetchSuggestions} disabled={isAiLoading} className="text-[10px] font-medium bg-primary/20 hover:bg-primary/30 text-primary px-2 py-0.5 rounded transition">
                  Generate
                </button>
              </div>
              <div className="space-y-2">
                {suggestions ? (
                  Object.entries(suggestions).map(([type, text]) => (
                    <button 
                      key={type}
                      onClick={() => setNewMessage(text)}
                      className="w-full text-left bg-background hover:bg-surfaceHover border border-border p-3 rounded-lg transition group text-sm"
                    >
                      <span className="block text-[10px] font-bold text-primary mb-1 uppercase tracking-wider">{type.replace('_', ' ')}</span>
                      <span className="text-textMain line-clamp-2">{text}</span>
                    </button>
                  ))
                ) : (
                  <div className="bg-background border border-border rounded-lg p-3 text-sm text-textMuted italic">
                    Click generate for smart replies.
                  </div>
                )}
              </div>
            </div>

            {/* UI Placeholders as requested */}
            <div className="space-y-2 pt-2 border-t border-border">
              <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider">Similar Tickets</h3>
              <div className="bg-background border border-border rounded-lg p-3 space-y-2 opacity-70">
                {tickets
                  .filter(t => t.id !== activeTicket.id)
                  .filter(t => t.title.toLowerCase().split(' ').some(word => activeTicket.title.toLowerCase().includes(word) && word.length > 3))
                  .slice(0, 3).map(sim => (
                    <Link key={sim.id} to={`/tickets/${sim.id}`} className="block text-xs text-white underline decoration-border hover:decoration-textMuted underline-offset-2 cursor-pointer transition-colors truncate">
                      #{sim.id} - {sim.title}
                    </Link>
                  ))
                }
                {tickets.filter(t => t.id !== activeTicket.id && t.title.toLowerCase().split(' ').some(word => activeTicket.title.toLowerCase().includes(word) && word.length > 3)).length === 0 && (
                  <span className="text-xs text-textMuted italic">No similar tickets found.</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-textMuted uppercase tracking-wider">Resolution Prediction</h3>
              <div className="bg-background border border-border rounded-lg p-3">
                <div className="w-full bg-surface rounded-full h-1.5 mb-2 overflow-hidden">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white">Likely to Resolve</span>
                  <span className="text-textMuted">85%</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
