import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage'; // The "About" page
import SightingsPage from './pages/SightingsPage';
import MapPage from './pages/MapPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UploadPage from './pages/UploadPage';
import ProfilePage from './pages/ProfilePage';
import MediaDetailPage from './pages/MediaDetailPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import Spinner from './components/common/Spinner';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  const bubbleConfigs = [
    { size: 'small', delay: '0s', xOffset: '20px', left: '10%' },
    { size: 'medium', delay: '2s', xOffset: '-30px', left: '30%' },
    { size: 'large', delay: '4s', xOffset: '40px', left: '60%' },
    { size: 'xl', delay: '6s', xOffset: '-50px', left: '80%' },
    { size: 'small', delay: '1s', xOffset: '10px', left: '50%' },
    { size: 'medium', delay: '3s', xOffset: '60px', left: '20%' },
    { size: 'large', delay: '5s', xOffset: '-20px', left: '45%' },
    { size: 'xl', delay: '7s', xOffset: '30px', left: '70%' },
    { size: 'xl', delay: '9s', xOffset: '-10px', left: '5%' },
    { size: 'small', delay: '0.5s', xOffset: '50px', left: '90%' },
    { size: 'medium', delay: '2.5s', xOffset: '-15px', left: '15%' },
    { size: 'large', delay: '4.5s', xOffset: '25px', left: '75%' },
    { size: 'xl', delay: '6.5s', xOffset: '-35px', left: '25%' },
    { size: 'small', delay: '1.5s', xOffset: '5px', left: '35%' },
    { size: 'medium', delay: '3.5s', xOffset: '45px', left: '55%' },
    { size: 'large', delay: '5.5s', xOffset: '-25px', left: '5%' },
    { size: 'xl', delay: '7.5s', xOffset: '15px', left: '95%' },
    { size: 'xl', delay: '9.5s', xOffset: '-5px', left: '40%' },
  ];

  const RootRedirect = () => {
    if (isLoading) {
      return <div className="min-h-[calc(100vh-200px)] flex items-center justify-center"><Spinner size="16" color="ocean-primary" /></div>;
    }
    return isAuthenticated ? <Navigate to="/upload" replace /> : <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen relative z-0">
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: '#4DB6AC',
              color: '#FFFFFF',
              borderRadius: '8px',
              padding: '12px 20px',
              fontWeight: '600'
            },
            success: { iconTheme: { primary: '#A8DADC', secondary: '#4DB6AC' } },
            error: { iconTheme: { primary: '#EF5350', secondary: '#FFFFFF' } },
          }}
        />
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            {bubbleConfigs.map((config, index) => (
              <div
                key={index}
                className={`floating-bubble floating-bubble-${config.size}`}
                style={{
                  left: config.left,
                  animationDelay: config.delay,
                  '--rand-x': config.xOffset
                } as React.CSSProperties}
              ></div>
            ))}
          </div>

          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/media/:id" element={<MediaDetailPage />} />

            {/* Protected Routes */}
            <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/sightings" element={<ProtectedRoute><SightingsPage /></ProtectedRoute>} />
            <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />

            <Route path="/about" element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;