import React, { useState, useEffect } from 'react';
import UploadSection from './components/UploadSection';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Register from './components/Register';
import Products from './components/Products';
import AdminDashboard from './components/AdminDashboard';
import AIChatPage from './components/AIChatPage';
import bgImage from './assets/bg.png';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'ai-chat', 'login', 'register', 'products'
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentChatId, setCurrentChatId] = useState(null);

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Chat management functions
  const handleNewChat = () => {
    const newChatId = `chat_${Date.now()}`;
    const newSession = {
      id: newChatId,
      title: 'Chat Baru',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      messageCount: 0
    };

    if (user) {
      const userChatsKey = `user_${user.id}_chats`;
      const saved = localStorage.getItem(userChatsKey);
      const sessions = saved ? JSON.parse(saved) : [];
      const updated = [newSession, ...sessions];
      localStorage.setItem(userChatsKey, JSON.stringify(updated));
    }

    setCurrentChatId(newChatId);
  };

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId);
  };

  const handleDeleteChat = (chatId) => {
    if (!window.confirm('Hapus chat ini?')) return;
    
    if (user) {
      // Remove chat messages
      const chatKey = `user_${user.id}_chat_${chatId}`;
      localStorage.removeItem(chatKey);
      
      // Update sessions list
      const userChatsKey = `user_${user.id}_chats`;
      const saved = localStorage.getItem(userChatsKey);
      if (saved) {
        const sessions = JSON.parse(saved);
        const updated = sessions.filter(s => s.id !== chatId);
        localStorage.setItem(userChatsKey, JSON.stringify(updated));
      }
    }

    // If deleting current chat, create new one
    if (chatId === currentChatId) {
      handleNewChat();
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView('home');
  };

  const handleRegister = (userData) => {
    setUser(userData);
    setCurrentView('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear upload session data
    sessionStorage.removeItem('uploadPreview');
    sessionStorage.removeItem('uploadPrediction');
    setUser(null);
    setCurrentView('home');
  };

  // Render different views
  if (currentView === 'login') {
    return <Login onLogin={handleLogin} onNavigate={setCurrentView} />;
  }

  if (currentView === 'register') {
    return <Register onNavigate={setCurrentView} />;
  }

  if (currentView === 'admin') {
    // Check if user is admin
    if (user?.role !== 'admin') {
      setCurrentView('home');
      return null;
    }
    return <AdminDashboard user={user} onNavigate={setCurrentView} />;
  }

  // AI Chat Page with Sidebar
  if (currentView === 'ai-chat') {
    if (!user) {
      setCurrentView('login');
      return null;
    }
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar 
          currentPage="ai-chat"
          onNavigate={setCurrentView}
          user={user}
          onLogout={handleLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          currentChatId={currentChatId}
        />
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <AIChatPage 
            user={user} 
            currentChatId={currentChatId}
            onChatIdChange={setCurrentChatId}
          />
        </div>
      </div>
    );
  }

  // Products Page with Sidebar
  if (currentView === 'products') {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar 
          currentPage="products"
          onNavigate={setCurrentView}
          user={user}
          onLogout={handleLogout}
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

  // Home Page with Sidebar
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        currentPage="home"
        onNavigate={setCurrentView}
        user={user}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className={`flex-1 min-h-screen relative overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Background Image */}
        <div className="fixed inset-0 opacity-60 pointer-events-none" style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}></div>
        <div className="fixed inset-0 bg-gradient-to-br from-white/80 via-emerald-50/70 to-teal-50/70 pointer-events-none"></div>
        
        <div className="relative z-10">
          <main className="px-4 py-12 lg:py-20">
            <div className="max-w-6xl mx-auto">
              <UploadSection 
                onNavigateToProducts={() => setCurrentView('products')}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;