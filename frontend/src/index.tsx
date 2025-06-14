import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // New global styles
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import 'mapbox-gl/dist/mapbox-gl.css'; // Keep Mapbox CSS

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);