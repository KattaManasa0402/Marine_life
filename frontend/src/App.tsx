import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import { Toaster } from 'react-hot-toast';
import OceanBackground from './components/common/OceanBackground';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UploadPage from './pages/UploadPage';
import ProfilePage from './pages/ProfilePage';
import MediaDetailPage from './pages/MediaDetailPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <OceanBackground>
        <div className="flex flex-col min-h-screen">
          <Toaster 
            position="top-center" 
            reverseOrder={false} 
            toastOptions={{ 
              style: { 
                background: 'rgba(10, 25, 47, 0.9)',
                color: '#E0F7FA',
                border: '1px solid rgba(78, 205, 196, 0.2)',
                backdropFilter: 'blur(10px)',
              },
              className: 'backdrop-blur-lg',
            }} 
          />
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/media/:id" element={<MediaDetailPage />} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </OceanBackground>
    </Router>
  );
}

export default App;