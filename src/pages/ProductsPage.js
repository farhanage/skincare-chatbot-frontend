import React, { useState } from 'react';
import { Sidebar } from '../components/Layout';
import { Products } from '../components/Product';

export default function ProductsPage({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        currentPage="products"
        user={user}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className={`flex-1 min-h-screen relative overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
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
