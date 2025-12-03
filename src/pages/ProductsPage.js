import React from 'react';
import { Sidebar } from '../components/Layout';
import { Products } from '../features/products';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Menu } from 'lucide-react';

export default function ProductsPage({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useLocalStorage('sidebarOpen', true);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        currentPage="products"
        user={user}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-3.5 left-3 z-20 bg-white p-2 sm:p-3 rounded-xl shadow-lg text-emerald-600 hover:bg-emerald-50 transition-all"
      >
        <Menu size={20} className="sm:w-6 sm:h-6" />
      </button>
      <div className={`flex-1 min-h-screen relative overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} pt-8 lg:pt-0`}>
        {/* Background Image */}
        <div className="fixed inset-0 opacity-60 pointer-events-none" style={{
          backgroundImage: `url('/bg.png')`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}></div>
        <div className="fixed inset-0 bg-gradient-to-br from-white/80 via-emerald-50/70 to-teal-50/70 pointer-events-none"></div>
        
        <div className="relative z-10">
          <Products user={user} />
        </div>
      </div>
    </div>
  );
}
