import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, User, Clock, CheckCircle2, Circle, MoreVertical, Wifi, WifiOff, Sparkles, MessageSquare, Activity, FileText } from 'lucide-react';
import api from '../api';
import { toast } from 'react-hot-toast';

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);

  const [suggestions, setSuggestions] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [summary, setSummary] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchTicketAndMessages();
    
    // Connect WebSocket
    const wsUrl = `ws://localhost:8000/ws/chat/${id}`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      const newMsg = JSON.parse(event.data);
      setMessages(prev => [...prev, newMsg]);
      scrollToBottom();
    };

    ws.current.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchTicketAndMessages = async () => {
    try {
      const ticketRes = await api.get(`/tickets/${id}`);
      setTicket(ticketRes.data);
      
      const msgRes = await api.get(`/messages/${id}`);
      setMessages(msgRes.data);
      scrollToBottom();
    } catch (error) {
      console.error("Failed to load data", error);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !ticket || ticket.status === 'Closed') return;

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const payload = {
        sender_id: user?.id || 1, // Fallback since mocked user might not have numeric ID initially
        message: newMessage
      };
      ws.current.send(JSON.stringify(payload));
      setNewMessage('');
    } else {
      toast.error("WebSocket is not connected");
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

  const applySuggestion = (text) => {
    setNewMessage(text);
  };

  if (!ticket) {
    return <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">Loading ticket details...</div>;
  }

  const isAgent = user?.role === 'Agent' || user?.role === 'Admin';

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col md:flex-row">
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-h-screen">
        {/* Header */}
        <nav className="bg-white/5 border-b border-white/10 sticky top-0 z-10 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link to={user?.role === 'Customer' ? '/tickets' : '/dashboard'} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl font-bold line-clamp-1">{ticket.title}</h1>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mt-1">
                  <span className="flex items-center gap-1">
                    {ticket.status === 'Open' ? <Circle size={10} className="text-amber-500" /> : <CheckCircle2 size={10} className="text-emerald-500" />}
                    <span className={ticket.status === 'Open' ? 'text-amber-500' : 'text-emerald-500'}>{ticket.status}</span>
                  </span>
                  <span>•</span>
                  <span>Ticket #{ticket.id}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    {isConnected ? <Wifi size={12} className="text-emerald-500" /> : <WifiOff size={12} className="text-red-500" />}
                    {isConnected ? 'Live' : 'Connecting...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Chat Messages */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <div className="flex gap-4 justify-start">
            <div className="flex flex-col items-start max-w-[80%]">
              <div className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 shadow-sm">
                <p className="whitespace-pre-wrap font-semibold mb-2 text-gray-300">Original Ticket Description:</p>
                <p className="whitespace-pre-wrap text-gray-200">{ticket.description}</p>
              </div>
            </div>
          </div>

          {messages.map((msg) => {
            const isMe = msg.sender_id === (user?.id || 1);
            return (
              <div key={msg.id} className={`flex gap-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-500/20 border border-blue-500/50 rounded-full flex items-center justify-center mt-auto">
                    <User size={20} className="text-blue-400" />
                  </div>
                )}
                
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                  <div 
                    className={`px-5 py-3 rounded-2xl ${
                      isMe 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-white/10 border border-white/5 text-white rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  </div>
                  <span className="text-xs text-gray-500 font-medium mt-1.5 px-1 flex items-center gap-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isMe && <CheckCircle2 size={12} className="text-blue-500" />}
                  </span>
                </div>

                {isMe && (
                  <div className="flex-shrink-0 h-10 w-10 bg-white/10 rounded-full flex items-center justify-center mt-auto">
                    <User size={20} className="text-white" />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </main>

        {/* Input Area */}
        <div className="bg-[#0A0A0A] border-t border-white/10 p-4 sticky bottom-0">
          {ticket.status === 'Closed' ? (
            <div className="text-center p-3 bg-white/5 rounded-xl border border-white/10 text-gray-400 text-sm flex items-center justify-center gap-2">
              <Clock size={16} />
              This ticket is closed. You can no longer send messages.
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="relative flex items-center max-w-4xl mx-auto">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isConnected ? "Type your message..." : "Connecting..."}
                disabled={!isConnected}
                className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-6 pr-14 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || !isConnected}
                className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
              >
                <Send size={18} className="ml-0.5" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* AI Assistant Sidebar (Agents/Admins Only) */}
      {isAgent && (
        <div className="w-full md:w-80 border-l border-white/10 bg-white/5 p-6 flex flex-col gap-6 overflow-y-auto max-h-screen hidden md:flex">
          <div className="flex items-center gap-2 text-xl font-bold text-purple-400">
            <Sparkles className="w-6 h-6" />
            AI Assistant
          </div>

          {/* Sentiment Analysis */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><Activity className="w-4 h-4 text-gray-400"/> Sentiment</h3>
              <button onClick={fetchSentiment} disabled={isAiLoading} className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded hover:bg-purple-500/30 transition disabled:opacity-50">Analyze</button>
            </div>
            {sentiment ? (
              <div className={`text-lg font-bold ${sentiment === 'Positive' ? 'text-green-400' : sentiment === 'Negative' ? 'text-red-400' : 'text-yellow-400'}`}>
                {sentiment}
              </div>
            ) : (
              <div className="text-sm text-gray-500">Not analyzed yet</div>
            )}
          </div>

          {/* Reply Suggestions */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><MessageSquare className="w-4 h-4 text-gray-400"/> Smart Replies</h3>
              <button onClick={fetchSuggestions} disabled={isAiLoading} className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded hover:bg-purple-500/30 transition disabled:opacity-50">Generate</button>
            </div>
            {suggestions ? (
              <div className="space-y-3">
                {Object.entries(suggestions).map(([type, text]) => (
                  <button 
                    key={type}
                    onClick={() => applySuggestion(text)}
                    className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-xl text-sm transition group"
                  >
                    <span className="block text-xs text-gray-400 mb-1 capitalize group-hover:text-purple-400">{type.replace('_', ' ')}</span>
                    <span className="text-gray-200 line-clamp-2">{text}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No suggestions generated.</div>
            )}
          </div>

          {/* Chat Summary */}
          <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400"/> Summary</h3>
              <button onClick={fetchSummary} disabled={isAiLoading} className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded hover:bg-purple-500/30 transition disabled:opacity-50">Summarize</button>
            </div>
            {summary ? (
              <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                {summary}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No summary available.</div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
