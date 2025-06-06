// E:\Marine_life\frontend\src\App.tsx
import React from 'react'; // No useState, useEffect directly here anymore
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; 

// NEW: Import the MapPage component
import MapPage from './pages/MapPage';

// Remove direct mapbox imports from App.tsx
// import Map from 'react-map-gl'; 
// import 'mapbox-gl/dist/mapbox-gl.css'; 
// import api from './api/axios'; // No direct API call here either, MapPage handles it

function App() {
  return (
    <Router>
      <div className="h-screen w-screen flex flex-col">
        <header className="bg-blue-800 text-white p-4 text-center text-2xl font-bold flex justify-between items-center">
          <h1 className="flex-grow">Marine Life Monitoring Platform</h1>
          <nav>
            <Link to="/" className="text-white hover:text-gray-300 mx-2">Map</Link>
            <Link to="/login" className="text-white hover:text-gray-300 mx-2">Login</Link>
            <Link to="/register" className="text-white hover:text-gray-300 mx-2">Register</Link>
          </nav>
        </header>
        
        {/* The main content area where routes are rendered */}
        <main className="flex-grow"> 
          <Routes>
            <Route path="/" element={<MapPage />} /> {/* Render MapPage component */}
            <Route path="/login" element={<div>Login Page (Coming Soon)</div>} />
            <Route path="/register" element={<div>Register Page (Coming Soon)</div>} />
          </Routes>
        </main>

        <footer className="bg-gray-800 text-white p-2 text-center text-sm">
          © 2025 Community Marine Life Monitoring
        </footer>
      </div>
    </Router>
  );
}

export default App;