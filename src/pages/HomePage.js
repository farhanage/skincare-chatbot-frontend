import React from 'react';
import { Sidebar } from '../components/Layout';
import { UploadSection } from '../features/upload';
import bgImage from '../assets/bg.png';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Menu } from 'lucide-react';

export default function HomePage({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useLocalStorage('sidebarOpen', true);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        currentPage="home"
        user={user}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className={`flex-1 min-h-screen relative overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-3.5 left-3 z-20 bg-white p-2 sm:p-3 rounded-xl shadow-lg text-emerald-600 hover:bg-emerald-50 transition-all"
        >
          <Menu size={20} className="sm:w-6 sm:h-6" />
        </button>
        {/* Background Image */}
        <div className="fixed inset-0 opacity-60 pointer-events-none" style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}></div>
        <div className="fixed inset-0 bg-gradient-to-br from-white/80 via-emerald-50/70 to-teal-50/70 pointer-events-none"></div>
        
        <div className="relative z-10">
          <main className="px-4 sm:px-6 lg:px-8 py-12 lg:py-20 pt-16 lg:pt-12">
            <div className="max-w-6xl mx-auto">
              <UploadSection />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
