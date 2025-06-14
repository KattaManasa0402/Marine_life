import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { MediaItem } from '../types';
import { Link } from 'react-router-dom';
import Spinner from '../components/common/Spinner';
import { motion } from 'framer-motion';
import { FaHeart, FaEye, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import IconWrapper from '../utils/IconWrapper'; // Add this import

const SightingsPage: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMediaItems = async () => {
      try {
        const response = await api.get('/media');
        setMediaItems(response.data);
      } catch (err) {
        console.error('Failed to fetch media items:', err);
        setError('Failed to load sightings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchMediaItems();
  }, []);

  if (loading) {
    return <Spinner size="16" color="ocean-primary" />;
  }

  if (error) {
    return (
      <div className="text-center text-ocean-accent-red py-12 text-xl">
        <IconWrapper icon={<FaExclamationTriangle className="inline-block mr-2 text-3xl" />} /> {error}
      </div>
    );
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="py-8">
      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-heading text-ocean-dark text-center mb-12 font-bold leading-tight"
      >
        Explore Recent <span className="text-ocean-primary">Sightings</span>
      </motion.h1>

      {mediaItems.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center text-lg text-ocean-text-light py-20"
        >
          No marine sightings to display yet. Be the first to upload one!
        </motion.p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mediaItems.map((item, index) => (
            <motion.div
              key={item.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
              className="glass-card overflow-hidden group hover:scale-105 transition-transform duration-300 relative p-0"
            >
              <Link to={`/media/${item.id}`} className="block">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={item.file_url}
                    alt={item.species_ai_prediction || 'Marine life sighting'}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ocean-dark/50 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-xl font-heading text-white drop-shadow-lg">
                      {item.validated_species || item.species_ai_prediction || 'Analyzing...'}
                    </h3>
                  </div>
                  {item.ai_processing_status === 'pending' && (
                    <div className="absolute top-4 left-4 bg-ocean-primary text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Spinner size="4" color="white" /> Analyzing
                    </div>
                  )}
                  {item.is_community_validated && (
                    <div className="absolute top-4 right-4 bg-ocean-accent-gold text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <IconWrapper icon={<FaCheckCircle />} /> Validated
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm text-ocean-text-light mb-2 line-clamp-2">
                    {item.description || 'No description provided.'}
                  </p>
                  <div className="flex justify-between items-center text-ocean-text-dark text-sm">
                    <span className="flex items-center gap-1 text-ocean-dark font-semibold">
                      <IconWrapper icon={<FaHeart />} /> {item.community_votes_up} Likes
                    </span>
                    <span className="flex items-center gap-1 text-ocean-primary font-semibold">
                      <IconWrapper icon={<FaEye />} /> View Details
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SightingsPage;