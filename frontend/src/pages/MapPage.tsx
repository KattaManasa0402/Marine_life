import React, { useState, useEffect, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl, GeolocateControl, FullscreenControl, ScaleControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import api from '../api/axios';
import { MapDataPoint } from '../types';
import { Link } from 'react-router-dom';
import Spinner from '../components/common/Spinner';
import { motion } from 'framer-motion';
import MapSidebar from '../components/common/MapSidebar';
import MarkerPulse from '../components/common/MarkerPulse';
import { FaBars, FaLocationDot } from 'react-icons/fa6';
import IconWrapper from '../utils/IconWrapper';

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const MapPage: React.FC = () => {
    const [viewState, setViewState] = useState({ longitude: -20, latitude: 30, zoom: 2.2, pitch: 40, bearing: 0 });
    const [mapData, setMapData] = useState<MapDataPoint[]>([]);
    const [selectedPin, setSelectedPin] = useState<MapDataPoint | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchMapData = async () => {
            if (!MAPBOX_TOKEN) {
                setError('Mapbox Access Token is not configured.');
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const response = await api.get<MapDataPoint[]>('/map/data');
                setMapData(response.data.filter(p => p.latitude != null && p.longitude != null));
            } catch (err) {
                setError('Could not load map data.');
            } finally {
                setLoading(false);
            }
        };
        fetchMapData();
    }, []);

    const handleSelectLocation = useCallback((point: MapDataPoint) => {
        setSelectedPin(point);
        setViewState(prev => ({ ...prev, longitude: point.longitude, latitude: point.latitude, zoom: Math.max(prev.zoom, 6), pitch: 50, bearing: 0, transitionDuration: 1000 as any }));
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    }, []);
    
    if (loading) {
        return <div className="flex flex-col justify-center items-center h-[70vh]"><Spinner size="16" /><p className="text-white/80 mt-4 text-lg">Loading Global Sightings...</p></div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto px-4 pb-20">
            <div className="text-center my-8">
                <h1 className="text-5xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-aqua-glow to-azure">Global Discovery Map</h1>
                <p className="text-lg text-white/80 max-w-3xl mx-auto">Explore marine life sightings from around the world through our community observations.</p>
            </div>
            <div className="relative w-full h-[70vh] rounded-3xl overflow-hidden border border-white/10 shadow-lg">
                {error ? (
                    <div className="w-full h-full flex items-center justify-center bg-deep-blue/80 text-red-400 text-xl text-center p-4">{error}</div>
                ) : (
                    <>
                        <button onClick={() => setIsSidebarOpen(true)} className="absolute top-4 left-4 z-10 p-3 bg-deep-blue/80 border border-white/10 backdrop-blur-md rounded-lg text-white hover:bg-aqua-glow/20 transition-colors">
                            <IconWrapper>{(FaBars as any)()}</IconWrapper>
                        </button>
                        <MapSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} data={mapData} onSelectLocation={handleSelectLocation} />
                        <Map {...viewState} mapStyle="mapbox://styles/mapbox/navigation-night-v1" onMove={evt => setViewState(evt.viewState)} mapboxAccessToken={MAPBOX_TOKEN} projection={{name: 'mercator'}} style={{ width: '100%', height: '100%' }}>
                            <GeolocateControl position="top-left" />
                            <FullscreenControl position="top-left" />
                            <NavigationControl position="top-left" visualizePitch={true} />
                            <ScaleControl position="bottom-left" />
                            {mapData.map((point) => (
                                <Marker
                                    key={point.id}
                                    longitude={point.longitude}
                                    latitude={point.latitude}
                                    anchor="bottom"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        onClick={() => handleSelectLocation(point)}
                                        className="cursor-pointer"
                                    >
                                        <IconWrapper>{(FaLocationDot as any)({ className: "text-3xl text-aqua-glow" })}</IconWrapper>
                                        <MarkerPulse color="rgb(0, 255, 255)" size={6} />
                                    </motion.div>
                                </Marker>
                            ))}
                            {selectedPin && (
                                <Popup longitude={selectedPin.longitude} latitude={selectedPin.latitude} anchor="bottom" onClose={() => setSelectedPin(null)} closeOnClick={false} maxWidth="320px" className="map-popup-glass">
                                    <div className="p-4">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-white mb-1">
                                                    {selectedPin.validated_species ? selectedPin.validated_species : selectedPin.species_prediction || 'Unidentified Species'}
                                                </h3>
                                                <p className="text-white/70 text-sm line-clamp-2">{selectedPin.species_prediction || 'No description available'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Popup>
                            )}
                        </Map>
                    </>
                )}
            </div>
        </motion.div>
    );
};
export default MapPage;