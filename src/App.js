import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage, LoginPage, RegisterPage, ProductsPage, ChatPage, AdminPage } from './pages';

function App() {
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

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear upload session data
    sessionStorage.removeItem('uploadPreview');
    sessionStorage.removeItem('uploadPrediction');
    setUser(null);
  };

  // Protected Route Component
  const ProtectedRoute = ({ children, requireAdmin = false }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    if (requireAdmin && user.role !== 'admin') {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          user ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />
        } />
        <Route path="/register" element={
          user ? <Navigate to="/" replace /> : <RegisterPage />
        } />

        {/* Protected Routes */}
        <Route path="/" element={<HomePage user={user} onLogout={handleLogout} />} />
        
        <Route path="/products" element={<ProductsPage user={user} onLogout={handleLogout} />} />
        
        <Route path="/chat" element={
          <ProtectedRoute>
            <ChatPage user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <AdminPage user={user} />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;