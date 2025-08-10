import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { MediaItem } from '../types';
import { Link } from 'react-router-dom';
import Spinner from '../components/common/Spinner';
import { motion } from 'framer-motion';
import { FaHeart, FaEye, FaCircleCheck, FaTriangleExclamation, FaSpinner, FaThumbsUp, FaThumbsDown, FaArrowRotateRight, FaTrash } from 'react-icons/fa6';
import GlassCard from '../components/common/GlassCard';
import IconWrapper from '../utils/IconWrapper';
import OceanBackground from '../components/common/OceanBackground';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

// Bubble component for the ocean effect
const Bubble: React.FC<{ delay: number; size: number; left: number }> = ({ delay, size, left }) => (
    <motion.div
        initial={{ y: '100vh', opacity: 0 }}
        animate={{ y: '-100vh', opacity: [0, 0.8, 0] }}
        transition={{
            duration: 8,
            delay,
            repeat: Infinity,
            ease: 'linear'
        }}
        className="absolute rounded-full bg-white/10 backdrop-blur-sm"
        style={{
            width: size,
            height: size,
            left: `${left}%`,
            filter: 'blur(1px)'
        }}
    />
);

const SightingsPage: React.FC = () => {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { user } = useAuth();

    const fetchMediaItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/media/');
            setMediaItems(response.data);
        } catch (err) {
            console.error("Failed to fetch media items:", err);
            setError('Failed to load sightings. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMediaItems();
    }, [fetchMediaItems, refreshTrigger]);

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const handleDelete = async (itemId: number, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation to detail page
        e.stopPropagation();
        
        if (!window.confirm('Are you sure you want to delete this sighting? This action cannot be undone.')) {
            return;
        }

        try {
            await api.delete(`/media/${itemId}`);
            toast.success('Sighting deleted successfully');
            // Remove the item from the local state
            setMediaItems(prev => prev.filter(item => item.id !== itemId));
        } catch (err) {
            console.error('Failed to delete media item:', err);
            toast.error('Failed to delete sighting. Please try again.');
        }
    };

    if (loading) {
        return (
            <OceanBackground bubbleCount={20}>
                <div className="flex justify-center items-center h-[70vh]">
                    <Spinner size="16" />
                </div>
            </OceanBackground>
        );
    }

    if (error) {
        return (
            <OceanBackground bubbleCount={20}>
                <div className="text-center text-red-400 py-12 text-xl">
                    <IconWrapper>{(FaTriangleExclamation as any)({ className: "inline-block mr-2 text-3xl" })}</IconWrapper> {error}
                </div>
            </OceanBackground>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <OceanBackground>
            <div className="py-8">
                <motion.h1 
                    initial={{ y: -20, opacity: 0 }} 
                    animate={{ y: 0, opacity: 1 }} 
                    className="text-5xl font-display text-center mb-12 font-bold bg-clip-text text-transparent bg-gradient-to-r from-aqua-glow via-sea-foam to-azure"
                >
                    Explore Recent Sightings
                </motion.h1>

                <div className="text-center mb-8">
                    <motion.button
                        onClick={handleRefresh}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-secondary flex items-center justify-center gap-2 mx-auto backdrop-blur-md bg-white/10 hover:bg-white/20"
                    >
                        <IconWrapper>{(FaArrowRotateRight as any)()}</IconWrapper>
                        Refresh Sightings
                    </motion.button>
                </div>

                {mediaItems.length === 0 ? (
                    <p className="text-center text-lg text-white/70 py-20">No marine sightings to display yet.</p>
                ) : (
                    <motion.div 
                        variants={containerVariants} 
                        initial="hidden" 
                        animate="visible" 
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4"
                    >
                        {mediaItems.map((item) => (
                            <motion.div key={item.id} variants={cardVariants} className="group">
                                <Link to={`/media/${item.id}`}>
                                    <GlassCard className="p-0 overflow-hidden h-full flex flex-col hover:border-aqua-glow/70 transition-all duration-300 backdrop-blur-md bg-gradient-to-br from-sea-foam/30 via-white/10 to-aqua-glow/20 shadow-lg rounded-3xl">
                                        <div className="relative flex justify-center items-center pt-6 pb-2">
                                            <img 
                                                src={item.file_url || '/placeholder-marine.png'} 
                                                alt={item.species_ai_prediction || 'Marine life sighting'} 
                                                className="w-32 h-32 object-cover rounded-full border-4 border-aqua-glow/40 shadow-md bg-white/20 group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {/* Validation badge */}
                                            {item.is_validated_by_community && (
                                                <div className="absolute top-2 right-2 bg-green-400/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
                                                    <IconWrapper>{(FaCircleCheck as any)()}</IconWrapper> Validated
                                                </div>
                                            )}
                                            {/* Delete button for own sightings or superusers */}
                                            {user && (item.user_id === user.id || user.is_superuser) && (
                                                <button
                                                    onClick={(e) => handleDelete(item.id, e)}
                                                    className="absolute top-2 left-2 bg-red-500/90 hover:bg-red-600/90 text-white p-2 rounded-full text-xs shadow-md transition-colors z-10"
                                                    title={user.is_superuser ? "Delete this sighting (Superuser)" : "Delete this sighting"}
                                                >
                                                    <IconWrapper>{(FaTrash as any)()}</IconWrapper>
                                                </button>
                                            )}
                                        </div>
                                        <div className="px-6 pb-4 flex flex-col flex-grow">
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {/* AI Species badge */}
                                                {item.species_ai_prediction && (
                                                    <span className="inline-block bg-aqua-glow/80 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                                                        {item.species_ai_prediction}
                                                    </span>
                                                )}
                                                {/* AI Health badge */}
                                                {item.health_status_ai_prediction && (
                                                    <span className="inline-block bg-sea-foam/70 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                                                        {item.health_status_ai_prediction}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-bold text-lg text-sea-foam drop-shadow-md mb-1">{item.validated_species || item.species_ai_prediction || 'Analyzing...'}</h3>
                                            {item.ai_processing_status === 'pending' && (
                                                <p className="text-sm text-white/80 flex items-center gap-1.5 mt-1">
                                                    <IconWrapper>{(FaSpinner as any)({ className: "animate-spin text-sm" })}</IconWrapper>
                                                    AI Processing...
                                                </p>
                                            )}
                                            {item.ai_processing_status === 'failed_queue' && (
                                                <p className="text-sm text-red-400/80 flex items-center gap-1.5 mt-1">
                                                    <IconWrapper>{(FaTriangleExclamation as any)({ className: "text-sm" })}</IconWrapper>
                                                    AI Failed
                                                </p>
                                            )}
                                            <p className="text-sm text-white/70 mb-4 flex-grow line-clamp-2">{item.description || 'No description provided.'}</p>
                                            <div className="flex justify-between items-center text-white/80 text-sm mt-auto">
                                                <span className="flex items-center gap-1.5 font-semibold">
                                                    <IconWrapper>{(FaCircleCheck as any)({ className: "text-aqua-glow" })}</IconWrapper>
                                                    Validation Score: {item.validation_score}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-aqua-glow font-semibold group-hover:text-white transition-colors">
                                                    <IconWrapper>{(FaEye as any)()}</IconWrapper> View Details
                                                </span>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </OceanBackground>
    );
};

export default SightingsPage;