import React, { useState, useEffect } from 'react';
import Map, { Marker, Popup, NavigationControl, type MapLayerMouseEvent } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import api from '../api/axios';
import { MapDataPoint } from '../types';
import { Link } from 'react-router-dom';
import Spinner from '../components/common/Spinner';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaExpandAlt } from 'react-icons/fa';
import IconWrapper from '../utils/IconWrapper';

function MapPage() {
  const [viewState, setViewState] = useState({ longitude: -20, latitude: 30, zoom: 2, pitch: 20, bearing: 0 });
  const [mapData, setMapData] = useState<MapDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPin, setSelectedPin] = useState<MapDataPoint | null>(null);
  const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    const fetchMapData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get<MapDataPoint[]>('/map/data');
        setMapData(response.data.filter(p => p.latitude !== null && p.longitude !== null));
      } catch (error) {
        console.error('Failed to fetch map data', error);
        setError('Failed to load map data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);

  const handleMarkerClick = (e: any, pin: MapDataPoint) => {
    const mapEvent = e as unknown as MapLayerMouseEvent;
    mapEvent.originalEvent.stopPropagation();
    setSelectedPin(pin);
    setViewState(prev => ({
      ...prev,
      longitude: pin.longitude,
      latitude: pin.latitude,
      zoom: Math.max(prev.zoom, 5)
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 sm:p-8 flex flex-col items-center"
    >
      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-heading text-ocean-dark text-center mb-12 font-bold leading-tight"
      >
        Global <span className="text-ocean-primary">Sightings Map</span>
      </motion.h1>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card w-full h-[75vh] rounded-2xl shadow-lg overflow-hidden relative"
      >
        {loading && (
          <div className="absolute inset-0 bg-ocean-base-light bg-opacity-70 flex items-center justify-center z-20">
            <Spinner size="16" color="ocean-primary" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 bg-ocean-base-light bg-opacity-90 flex items-center justify-center z-20 text-ocean-accent-red text-xl font-semibold p-4 text-center">
            {error}
          </div>
        )}
        {!MAPBOX_TOKEN ? (
          <div className="absolute inset-0 bg-ocean-base-light bg-opacity-90 flex items-center justify-center z-20 text-ocean-accent-red text-xl font-semibold p-4 text-center">
            Mapbox Access Token not found. Please set REACT_APP_MAPBOX_ACCESS_TOKEN.
          </div>
        ) : (
          <Map
            {...viewState}
            mapboxAccessToken={MAPBOX_TOKEN}
            onMove={evt => setViewState(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/light-v11"
            style={{ width: "100%", height: "100%" }}
          >
            <NavigationControl position="top-right" />
            {mapData.map(pin => (
              <Marker key={pin.id} latitude={pin.latitude} longitude={pin.longitude}>
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="cursor-pointer text-ocean-primary"
                  onClick={(e) => handleMarkerClick(e, pin)}
                  title={pin.validated_species || pin.species_prediction || 'Marine Sighting'}
                >
                  <IconWrapper icon={<FaMapMarkerAlt className="text-3xl drop-shadow-md" />} />
                </motion.div>
              </Marker>
            ))}
            {selectedPin && (
              <Popup
                longitude={selectedPin.longitude}
                latitude={selectedPin.latitude}
                onClose={() => setSelectedPin(null)}
                closeOnClick={false}
                anchor="top"
                offset={20}
                className="font-sans"
              >
                <div className="glass-card w-64 p-0 text-ocean-text-dark border-none shadow-lg">
                  <img
                    src={selectedPin.file_url}
                    alt="sighting"
                    className="w-full h-36 object-cover rounded-t-xl"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-lg font-heading text-ocean-dark truncate">
                      {selectedPin.validated_species || selectedPin.species_prediction || 'Unknown Species'}
                    </h3>
                    <p className="text-sm text-ocean-text-light mt-1">
                      Health: {selectedPin.validated_health || selectedPin.health_prediction || 'N/A'}
                    </p>
                    <Link
                      to={`/media/${selectedPin.id}`}
                      className="btn-secondary btn-sm mt-3 inline-flex items-center gap-2 px-4 py-1 text-sm rounded-full"
                    >
                      <IconWrapper icon={<FaExpandAlt />} /> View Details
                    </Link>
                  </div>
                </div>
              </Popup>
            )}
          </Map>
        )}
      </motion.div>
    </motion.div>
  );
}

export default MapPage;