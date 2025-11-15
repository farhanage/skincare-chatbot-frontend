import React from 'react';
import { ShoppingBag, LogOut, User } from 'lucide-react';

export default function Header({ onNavigate, currentPage, cartItemsCount, user, onLogout }) {
  return (
    <header className="bg-white border-b border-slate-200 shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <div 
            onClick={() => onNavigate('upload')}
            className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-all"
          >
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-xl shadow-lg">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">SkinCare AI</h1>
              <p className="text-xs text-slate-600 font-semibold">Deteksi & Konsultasi</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-2">
            <button 
              onClick={() => onNavigate('upload')}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all ${
                currentPage === 'upload' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Deteksi
            </button>
            
            <button 
              onClick={() => onNavigate('products')}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
                currentPage === 'products' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg' 
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ShoppingBag size={18} />
              Produk
              {cartItemsCount > 0 && (
                <span className="bg-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg">
                    <User className="text-white" size={16} />
                  </div>
                  <span className="text-slate-900 font-bold text-sm">{user.username}</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl font-bold transition-all"
                >
                  <LogOut size={18} />
                  Keluar
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onNavigate('login')}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
                >
                  Masuk
                </button>
                <button 
                  onClick={() => onNavigate('register')}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold transition-all shadow-lg"
                >
                  Daftar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
