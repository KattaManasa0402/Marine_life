// E:\Marine_life\frontend\src\pages\MapPage.tsx
import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import mapboxgl from 'mapbox-gl'; // NEW: Import mapbox-gl directly
// Removed: import Map from 'react-map-gl';
// Removed: import 'mapbox-gl/dist/mapbox-gl.css'; (already in index.html)

import api from '../api/axios'; 

// Set Mapbox access token globally for mapbox-gl (best practice)
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || '';

function MapPage() {
  // Map instance reference
  const mapContainer = useRef<HTMLDivElement>(null); // Ref for the map DOM element
  const map = useRef<mapboxgl.Map | null>(null); // Ref for the mapboxgl.Map object

  // State for current map center and zoom (optional, can be managed by mapboxgl directly)
  const [lng, setLng] = useState(-100);
  const [lat, setLat] = useState(40);
  const [zoom, setZoom] = useState(3);

  const [backendStatus, setBackendStatus] = useState('Checking...');

  // --- Backend Health Check (existing) ---
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await api.get('/health');
        setBackendStatus(response.data.message);
        console.log('Backend Health Check:', response.data);
      } catch (error) {
        console.error('Backend Health Check Failed:', error);
        setBackendStatus('Backend Status: Offline or Error');
      }
    };
    checkBackend();
  }, []);

  // --- Mapbox GL JS Initialization (NEW) ---
  useEffect(() => {
    if (map.current) return; // Initialize map only once
    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12', // stylesheet location
        center: [lng, lat], // starting position [lng, lat]
        zoom: zoom // starting zoom
      });

      // Add navigation control (zoom in/out, rotate)
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Update state when map moves (optional, for controlled view)
      map.current.on('move', () => {
        if (map.current) {
          setLng(parseFloat(map.current.getCenter().lng.toFixed(4)));
          setLat(parseFloat(map.current.getCenter().lat.toFixed(4)));
          setZoom(parseFloat(map.current.getZoom().toFixed(2)));
        }
      });
    }

    // Cleanup function: remove map on component unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [lng, lat, zoom]); // Re-run if center/zoom changes (for controlled view)

  // --- END Mapbox GL JS Initialization ---

  // Basic check for Mapbox Access Token (now handled by mapboxgl.accessToken assignment)
  if (!mapboxgl.accessToken) { // Check the global token
    console.error(
      'Mapbox Access Token is not set. Please set REACT_APP_MAPBOX_ACCESS_TOKEN in your .env.local file.',
    );
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-red-500 text-lg">Mapbox Access Token Error. Check console.</p>
      </div>
    );
  }

  return (
    <div className="flex-grow relative"> 
      <div className="absolute top-0 left-0 bg-white p-2 m-2 rounded shadow z-10 text-sm">
        Backend Status: {backendStatus}
        <br />
        Map Center: {lng}, {lat} | Zoom: {zoom} {/* Display current map state */}
      </div>
      {/* Map container div */}
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} className="map-container" />
    </div>
  );
}

export default MapPage;