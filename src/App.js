import React, { useState, useEffect } from 'react';
import UploadSection from './components/UploadSection';
import ChatSection from './components/ChatSection';
import Header from './components/Header';

function App() {
  const [prediction, setPrediction] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handlePrediction = (result) => {
    setPrediction(result);
  };

  // Track mouse movement for interactive background
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
      </div>

      {/* Floating Orbs - Interactive */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Large Orb 1 - Top Left */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-30 animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4), transparent 70%)',
            top: '-10%',
            left: '-10%',
            transform: `translate(${mousePosition.x * -50}px, ${mousePosition.y * -50}px)`,
            transition: 'transform 0.5s ease-out',
            animationDelay: '0s'
          }}
        />
        
        {/* Large Orb 2 - Top Right */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-25 animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.4), transparent 70%)',
            top: '10%',
            right: '-5%',
            transform: `translate(${mousePosition.x * 30}px, ${mousePosition.y * 30}px)`,
            transition: 'transform 0.5s ease-out',
            animationDelay: '2s'
          }}
        />
        
        {/* Large Orb 3 - Bottom Left */}
        <div 
          className="absolute w-[550px] h-[550px] rounded-full blur-3xl opacity-20 animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.4), transparent 70%)',
            bottom: '-10%',
            left: '10%',
            transform: `translate(${mousePosition.x * 40}px, ${mousePosition.y * -40}px)`,
            transition: 'transform 0.5s ease-out',
            animationDelay: '4s'
          }}
        />
        
        {/* Medium Orb 1 */}
        <div 
          className="absolute w-[350px] h-[350px] rounded-full blur-2xl opacity-30 animate-float-slow"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3), transparent 70%)',
            top: '30%',
            left: '20%',
            transform: `translate(${mousePosition.x * 25}px, ${mousePosition.y * 25}px)`,
            transition: 'transform 0.6s ease-out',
            animationDelay: '1s'
          }}
        />
        
        {/* Medium Orb 2 */}
        <div 
          className="absolute w-[400px] h-[400px] rounded-full blur-2xl opacity-25 animate-float-slow"
          style={{
            background: 'radial-gradient(circle, rgba(20, 184, 166, 0.3), transparent 70%)',
            bottom: '20%',
            right: '15%',
            transform: `translate(${mousePosition.x * -35}px, ${mousePosition.y * 35}px)`,
            transition: 'transform 0.6s ease-out',
            animationDelay: '3s'
          }}
        />

        {/* Small Particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-emerald-400/40 rounded-full animate-ping"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Diagonal Lines Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            rgba(16, 185, 129, 0.5) 0px,
            rgba(16, 185, 129, 0.5) 2px,
            transparent 2px,
            transparent 50px
          )`
        }} />
      </div>

      {/* Radial Gradient Overlay */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(16, 185, 129, 0.1), transparent 50%)`,
            transition: 'background 0.3s ease-out'
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Header />
        
        <main className="px-4 py-12 lg:py-20">
          <div className="max-w-6xl mx-auto">
            <UploadSection onPrediction={handlePrediction} />
          </div>
        </main>
      </div>

      <ChatSection diseaseInfo={prediction} />

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-30px);
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-20px) translateX(20px);
          }
          66% {
            transform: translateY(20px) translateX(-20px);
          }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 12s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default App;