import React, { useState, useEffect } from 'react';
import { Database, Users, ShoppingCart, Package, Terminal, RefreshCw, AlertCircle } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function AdminDashboard({ user, onNavigate }) {
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const fetchData = async (endpoint) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/debug/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.detail || 'Failed to fetch data');
      }

      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const tabs = [
    { id: 'info', label: 'System Info', icon: Database },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'carts', label: 'Carts', icon: ShoppingCart },
    { id: 'tables', label: 'Tables', icon: Terminal }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">Admin Dashboard</h1>
              <p className="text-emerald-300 font-semibold">
                Welcome, {user?.username} | Role: {user?.role?.toUpperCase()}
              </p>
            </div>
            <button
              onClick={() => onNavigate('home')}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6">
          {/* Refresh Button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">{tabs.find(t => t.id === activeTab)?.label}</h2>
            <button
              onClick={() => fetchData(activeTab)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-rose-900/50 border border-rose-500 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-rose-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-rose-200 font-semibold">{error}</p>
                <p className="text-rose-300 text-sm mt-1">Make sure you're logged in as admin</p>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Data Display */}
          {!loading && data && (
            <div className="bg-slate-900 rounded-xl p-6 overflow-auto max-h-[600px]">
              <pre className="text-emerald-300 text-sm font-mono whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Stats Cards (for users/products/carts) */}
        {!loading && data && ['users', 'products', 'carts'].includes(activeTab) && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <p className="text-slate-400 font-semibold mb-2">Total Count</p>
              <p className="text-4xl font-black text-emerald-400">{data.count || 0}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <p className="text-slate-400 font-semibold mb-2">Data Type</p>
              <p className="text-2xl font-black text-white capitalize">{activeTab}</p>
            </div>
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <p className="text-slate-400 font-semibold mb-2">Status</p>
              <p className="text-2xl font-black text-green-400">✓ Loaded</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
