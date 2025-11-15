import React, { useState, useEffect } from 'react';
import UploadSection from './components/UploadSection';
import ChatSection from './components/ChatSection';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Products from './components/Products';
import bgImage from './assets/bg.png';

function App() {
  const [prediction, setPrediction] = useState(null);
  const [currentView, setCurrentView] = useState('home'); // 'home', 'login', 'register', 'products'
  const [user, setUser] = useState(null);

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

  const handlePrediction = (result) => {
    setPrediction(result);
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

  if (currentView === 'products') {
    return (
      <div className="min-h-screen relative">
        {/* Background Image */}
        <div className="fixed inset-0 opacity-60 pointer-events-none" style={{
          backgroundImage: `url('/bg.png')`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}></div>
        <div className="fixed inset-0 bg-gradient-to-br from-white/80 via-emerald-50/70 to-teal-50/70 pointer-events-none"></div>
        
        <div className="relative z-10">
          <Header 
            onNavigate={setCurrentView}
            currentPage="products"
            user={user}
            onLogout={handleLogout}
          />
          <Products user={user} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="fixed inset-0 opacity-60 pointer-events-none" style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}></div>
      <div className="fixed inset-0 bg-gradient-to-br from-white/80 via-emerald-50/70 to-teal-50/70 pointer-events-none"></div>
      
      <div className="relative z-10">
        <Header 
          onNavigate={setCurrentView}
          currentPage="upload"
          user={user}
          onLogout={handleLogout}
        />
        
        <main className="px-4 py-12 lg:py-20">
          <div className="max-w-6xl mx-auto">
            <UploadSection onPrediction={handlePrediction} />
          </div>
        </main>

        <ChatSection diseaseInfo={prediction} />
      </div>
    </div>
  );
}

export default App;