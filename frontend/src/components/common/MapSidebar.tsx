import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { MapDataPoint } from '../../types';

interface MapSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  data: MapDataPoint[];
  onSelectLocation: (point: MapDataPoint) => void;
}

const MapSidebar: React.FC<MapSidebarProps> = ({ isOpen, onClose, data, onSelectLocation }) => {
  // Group data by regions for better organization
  const getRegionName = (lat: number, lon: number): string => {
    if (lat > 0) {
      return lon > 0 ? 'Northeast Ocean' : 'Northwest Ocean';
    } else {
      return lon > 0 ? 'Southeast Ocean' : 'Southwest Ocean';
    }
  };

  // Group by region
  const regions = data.reduce((acc, point) => {
    const region = getRegionName(point.latitude, point.longitude);
    if (!acc[region]) acc[region] = [];
    acc[region].push(point);
    return acc;
  }, {} as Record<string, MapDataPoint[]>);

  // Animation variants
  const sidebarVariants = {
    open: { 
      x: 0,
      opacity: 1,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 24,
        staggerChildren: 0.05
      }
    },
    closed: { 
      x: '-100%',
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    open: { opacity: 1, y: 0 },
    closed: { opacity: 0, y: 10 }
  };

  return (
    <motion.div
      className="fixed top-0 left-0 h-full w-80 z-40"
      initial="closed"
      animate={isOpen ? 'open' : 'closed'}
      variants={sidebarVariants}
    >
      <GlassCard className="h-full p-6 rounded-none rounded-r-xl border-l-0 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-xl text-white">Sightings List</h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {Object.entries(regions).map(([region, points]) => (
            <motion.div key={region} variants={itemVariants}>
              <h4 className="text-lg font-medium text-aqua-glow mb-2">{region}</h4>
              <div className="space-y-3">
                {points.map((point) => (
                  <motion.div 
                    key={point.id}
                    variants={itemVariants}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-3 cursor-pointer transition-colors"
                    onClick={() => onSelectLocation(point)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 overflow-hidden rounded-md">
                        <img 
                          src={point.file_url} 
                          alt={point.validated_species || point.species_prediction || 'Marine life'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-white">{point.validated_species || point.species_prediction || 'Unknown Species'}</h5>
                        <p className="text-xs text-white/70">Lat: {point.latitude.toFixed(2)}, Lng: {point.longitude.toFixed(2)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default MapSidebar;
