import React, { useState, useEffect } from 'react';
import Map, { Marker, Popup, type MapLayerMouseEvent } from 'react-map-gl';
import api from '../api/axios';
import { MapDataPoint } from '../types';
import { Link } from 'react-router-dom';
import Spinner from '../components/common/Spinner';

function MapPage() {
  const [viewState, setViewState] = useState({
    longitude: -20,
    latitude: 30,
    zoom: 2,
  });
  const [mapData, setMapData] = useState<MapDataPoint[]>([]);
  const [selectedPin, setSelectedPin] = useState<MapDataPoint | null>(null);
  const [loading, setLoading] = useState(true);

  const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);
        const response = await api.get<MapDataPoint[]>('/map/data');
        setMapData(response.data.filter(p => p.latitude && p.longitude));
      } catch (error) {
        console.error('Failed to fetch map data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);

  if (!MAPBOX_ACCESS_TOKEN) {
    return <div className="p-4 text-red-500">Mapbox Access Token is not set in .env.local</div>;
  }

  const handleMarkerClick = (e: any, pin: MapDataPoint) => {
    const mapEvent = e as unknown as MapLayerMouseEvent;
    mapEvent.originalEvent.stopPropagation();
    setSelectedPin(pin);
  };

  return (
    <div>
        <h1 className="text-4xl font-bold mb-8 text-neutral border-b-4 border-secondary pb-2">Sightings Map</h1>
        <div className="w-full h-[75vh] relative rounded-xl overflow-hidden shadow-xl border border-gray-200">
            {loading && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-20">
                    <Spinner size="16" />
                </div>
            )}
            <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
            >
                {mapData.map(pin => (
                  <Marker key={`marker-${pin.id}`} longitude={pin.longitude} latitude={pin.latitude} anchor="bottom">
                      <div className="cursor-pointer group" onClick={(e) => handleMarkerClick(e, pin)}>
                          <div className={`w-3 h-3 rounded-full bg-accent ring-4 ring-accent/30 transition-all duration-300 group-hover:scale-150 ${selectedPin?.id === pin.id ? 'scale-150' : ''}`} />
                      </div>
                  </Marker>
                ))}
                {selectedPin && (
                    <Popup
                      longitude={selectedPin.longitude}
                      latitude={selectedPin.latitude}
                      onClose={() => setSelectedPin(null)}
                      closeOnClick={false}
                      anchor="top"
                      offset={15}
                      className="font-sans"
                    >
                        <div className="w-56">
                            <img src={selectedPin.file_url} alt="sighting" className="w-full h-32 object-cover rounded-t-lg" />
                            <div className="p-3">
                              <h3 className="font-bold text-base text-primary truncate">{selectedPin.validated_species || selectedPin.species_prediction || 'Unknown'}</h3>
                              <p className="text-sm text-gray-700">{selectedPin.validated_health || selectedPin.health_prediction || 'N/A'}</p>
                              <Link to={`/media/${selectedPin.id}`} className="text-secondary hover:underline text-xs font-semibold mt-2 inline-block">View Details →</Link>
                            </div>
                        </div>
                    </Popup>
                )}
            </Map>
        </div>
    </div>
  );
}
export default MapPage;