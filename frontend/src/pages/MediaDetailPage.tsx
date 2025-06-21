import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { MediaItem } from '../types';
import Spinner from '../components/common/Spinner';
import { motion } from 'framer-motion';
import { FaFlask, FaThumbsUp, FaThumbsDown, FaUser, FaCalendarDays, FaLocationDot, FaCircleInfo, FaCircleCheck, FaCircleXmark, FaTriangleExclamation, FaLightbulb, FaSpinner, FaArrowLeft, FaTag, FaHeartPulse } from 'react-icons/fa6';
import { useAuth } from '../contexts/AuthContext';
import GlassCard from '../components/common/GlassCard';
import IconWrapper from '../utils/IconWrapper';

const MediaDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [mediaItem, setMediaItem] = useState<MediaItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMediaItem = async () => {
            try {
                const response = await api.get<MediaItem>(`/media/${id}`);
                setMediaItem(response.data);
            } catch (err) {
                setError('Failed to load media details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchMediaItem();
        }
    }, [id]);

    if (loading) return <div className="flex justify-center items-center h-[70vh]"><Spinner size="16" /></div>;
    if (error) return <div className="text-center text-red-400 py-12">{error}</div>;
    if (!mediaItem) return <div className="text-center text-white/80 py-12">Media item not found.</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <GlassCard className="p-0 overflow-hidden">
                            <img src={mediaItem.file_url} alt={mediaItem.species_ai_prediction || 'Marine Life'} className="w-full h-auto object-cover" />
                        </GlassCard>

                        <GlassCard className="p-6">
                            <h2 className="text-3xl font-display font-bold text-white mb-4 flex items-center gap-3">
                                {mediaItem.validated_species || mediaItem.species_ai_prediction || 'Marine Life Sighting'}
                                {mediaItem.is_validated_by_community && (
                                    <span className="text-green-400 text-2xl" title="Community Validated"><IconWrapper>{(FaCircleCheck as any)()}</IconWrapper></span>
                                )}
                            </h2>
                            <p className="text-white/80 mb-6">{mediaItem.description || "No description provided."}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/90">
                                <div className="flex items-center gap-2"><IconWrapper>{(FaTag as any)({ className: "text-aqua-glow" })}</IconWrapper> <strong>AI Species:</strong> {mediaItem.species_ai_prediction || 'N/A'}</div>
                                <div className="flex items-center gap-2"><IconWrapper>{(FaHeartPulse as any)({ className: "text-aqua-glow" })}</IconWrapper> <strong>AI Health:</strong> {mediaItem.health_status_ai_prediction || 'N/A'}</div>
                                <div className="flex items-center gap-2"><IconWrapper>{(FaLocationDot as any)({ className: "text-aqua-glow" })}</IconWrapper> <strong>Latitude:</strong> {mediaItem.latitude || 'N/A'}</div>
                                <div className="flex items-center gap-2"><IconWrapper>{(FaLocationDot as any)({ className: "text-aqua-glow" })}</IconWrapper> <strong>Longitude:</strong> {mediaItem.longitude || 'N/A'}</div>
                            </div>
                        </GlassCard>
                    </div>

                    <div className="space-y-8">
                        <GlassCard className="p-6">
                            <h3 className="text-xl font-display font-bold text-white mb-4 border-b border-white/10 pb-3">Community Validation</h3>
                            <div className="flex justify-around items-center text-white mb-6">
                               <div className="text-center">
                                   <IconWrapper>{(FaCircleCheck as any)({ className: "text-aqua-glow text-3xl mx-auto mb-1" })}</IconWrapper>
                                   <span className="text-2xl font-bold">{mediaItem.validation_score}</span>
                                   <p className="text-sm text-white/70">Validation Score</p>
                               </div>
                            </div>
                            <p className="text-xs text-center text-white/50">
                                This score reflects the community's consensus on the AI's predictions.
                            </p>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <h3 className="text-xl font-display font-bold text-white mb-4">Uploader</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-deep-blue flex items-center justify-center text-aqua-glow text-2xl font-bold">
                                    U
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Anonymous User</p>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default MediaDetailPage;