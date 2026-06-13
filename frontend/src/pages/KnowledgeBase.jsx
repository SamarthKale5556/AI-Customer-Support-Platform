import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Book, Plus, Trash2, ArrowLeft, Search, Bot } from 'lucide-react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function KnowledgeBase() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const [askQuery, setAskQuery] = useState('');
  const [askAnswer, setAskAnswer] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  useEffect(() => {
    if (user?.role !== 'Admin') {
      navigate('/dashboard');
      return;
    }
    fetchItems();
  }, [user, navigate]);

  const fetchItems = async () => {
    try {
      const res = await api.get('/kb');
      setItems(res.data);
    } catch (e) {
      toast.error('Failed to load knowledge base items');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    setIsAdding(true);
    try {
      await api.post('/kb', { title, content, source });
      toast.success('Added to Knowledge Base');
      setTitle('');
      setContent('');
      setSource('');
      fetchItems();
    } catch (e) {
      toast.error('Failed to add item');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/kb/${id}`);
      toast.success('Item deleted');
      fetchItems();
    } catch (e) {
      toast.error('Failed to delete item');
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!askQuery) return;
    setIsAsking(true);
    setAskAnswer('');
    try {
      const res = await api.post('/kb/ask', { query: askQuery });
      setAskAnswer(res.data.answer);
    } catch (e) {
      toast.error('Failed to ask AI');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8 flex flex-col md:flex-row gap-8">
      
      {/* Main KB Management Area */}
      <div className="flex-1 max-w-4xl space-y-8">
        <header className="flex justify-between items-center pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Book className="text-blue-500" /> Knowledge Base
              </h1>
              <p className="text-gray-400 mt-2">Manage documentation for AI RAG responses</p>
            </div>
          </div>
        </header>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Add New Document</h2>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Source URL (Optional)</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isAdding}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition disabled:opacity-50"
            >
              <Plus size={18} /> {isAdding ? 'Ingesting...' : 'Ingest Document'}
            </button>
          </form>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Ingested Documents</h2>
          {items.length === 0 ? (
            <p className="text-gray-400">No documents found.</p>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="bg-black/40 border border-white/5 rounded-xl p-4 flex justify-between items-start group hover:bg-white/5 transition">
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">{item.content}</p>
                    {item.source && (
                      <p className="text-xs text-blue-400 mt-2">Source: {item.source}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RAG Testing Area */}
      <div className="w-full md:w-96 space-y-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-8">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-purple-400">
            <Bot size={24} /> Test AI RAG
          </h2>
          <form onSubmit={handleAsk} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={askQuery}
                onChange={(e) => setAskQuery(e.target.value)}
                placeholder="Ask about refunds..."
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-purple-500 focus:outline-none"
              />
              <Search className="absolute left-3 top-3.5 text-gray-500" size={18} />
            </div>
            <button
              type="submit"
              disabled={isAsking}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition disabled:opacity-50"
            >
              {isAsking ? 'Querying...' : 'Ask'}
            </button>
          </form>

          {askAnswer && (
            <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-sm leading-relaxed text-purple-100">
              {askAnswer}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
