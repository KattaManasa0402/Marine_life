import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { MediaItem } from '../types';
import Spinner from '../components/common/Spinner';
import { motion } from 'framer-motion';
import { FaFlask, FaThumbsUp, FaThumbsDown, FaUser, FaCalendarDays, FaLocationDot, FaCircleInfo, FaCircleCheck, FaCircleXmark, FaTriangleExclamation, FaLightbulb, FaSpinner, FaArrowLeft } from 'react-icons/fa6';
import { useAuth } from '../contexts/AuthContext';
import GlassCard from '../components/common/GlassCard';
import IconWrapper from '../utils/IconWrapper';
import toast from 'react-hot-toast';

const MediaDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [mediaItem, setMediaItem] = useState<MediaItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [voting, setVoting] = useState(false);

    const fetchMediaItem = useCallback(async () => {
        try {
            const response = await api.get<MediaItem>(`/media/${id}`);
            setMediaItem(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load sighting.');
            toast.error('Failed to load media details');
            navigate('/sightings');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchMediaItem();
    }, [fetchMediaItem]);

    const handleVote = async (vote: 'up' | 'down') => {
        if (!mediaItem || voting) return;
        setVoting(true);
        const loadingToast = toast.loading('Submitting vote...');
        try {
            await api.post(`/media/${id}/vote`, { vote });
            setMediaItem(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    community_votes_up: vote === 'up' ? prev.community_votes_up + 1 : prev.community_votes_up,
                    community_votes_down: vote === 'down' ? prev.community_votes_down + 1 : prev.community_votes_down
                };
            });
            toast.success('Vote recorded!', { id: loadingToast });
        } catch (error) {
            toast.error('Failed to submit vote', { id: loadingToast });
        } finally {
            setVoting(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-[70vh]"><Spinner size="16" /></div>;
    }

    if (error || !mediaItem) {
        return (
            <div className="text-center text-red-400 py-12 text-xl flex flex-col items-center">
                <IconWrapper>{(FaTriangleExclamation as any)({ className: "inline-block text-5xl mb-4" })}</IconWrapper>
                <p>{error || 'Sighting data not found.'}</p>
                <Link to="/" className="btn-primary mt-6">Go Home</Link>
            </div>
        );
    }
    
    const aiStatusIcon =
        mediaItem.ai_processing_status === 'pending' ? <IconWrapper>{(FaSpinner as any)({ className: "animate-spin text-aqua-glow" })}</IconWrapper>
      : mediaItem.ai_processing_status === 'completed' ? <IconWrapper>{(FaCircleCheck as any)({ className: "text-green-400" })}</IconWrapper>
      : <IconWrapper>{(FaCircleXmark as any)({ className: "text-red-400" })}</IconWrapper>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <GlassCard className="p-0 overflow-hidden col-span-1 lg:col-span-2">
                    <img src={mediaItem.file_url} alt={mediaItem.description || 'Marine sighting'} className="w-full h-auto max-h-[70vh] object-contain bg-black/20" />
                    <div className="p-6">
                        <h2 className="text-3xl font-display font-bold text-white mb-4 flex items-center gap-3">
                            {mediaItem.validated_species || mediaItem.species_ai_prediction || 'Marine Life Sighting'}
                            {mediaItem.is_community_validated && (
                                <span className="text-green-400 text-2xl" title="Community Validated"><IconWrapper>{(FaCircleCheck as any)()}</IconWrapper></span>
                            )}
                        </h2>
                        <div className="space-y-3 text-white/90">
                            <p className="flex items-center gap-3"><IconWrapper>{(FaFlask as any)()}</IconWrapper> AI Prediction: <span className="font-semibold">{mediaItem.species_ai_prediction || 'N/A'}</span></p>
                            <p className="flex items-center gap-3"><IconWrapper>{(FaLightbulb as any)()}</IconWrapper> AI Confidence: <span className="font-semibold">{mediaItem.ai_confidence_score ? `${(mediaItem.ai_confidence_score * 100).toFixed(1)}%` : 'N/A'}</span></p>
                            <p className="flex items-center gap-3">{aiStatusIcon} AI Status: <span className="font-semibold capitalize">{mediaItem.ai_processing_status.replace('_', ' ')}</span></p>
                             {mediaItem.description && <p className="flex items-start gap-3"><IconWrapper>{(FaCircleInfo as any)({ className: "mt-1" })}</IconWrapper> Description: <span className="flex-1">{mediaItem.description}</span></p>}
                        </div>
                    </div>
                </GlassCard>

                <div className="col-span-1 lg:col-span-1 space-y-8">
                    <GlassCard className="p-6">
                        <h3 className="text-xl font-display font-bold text-white mb-4 border-b border-white/10 pb-3">Sighting Info</h3>
                        <div className="space-y-3 text-white/90">
                           <p className="flex items-center gap-3"><IconWrapper>{(FaUser as any)()}</IconWrapper> By: <Link to={`/profile/${mediaItem.owner.id}`} className="font-semibold text-aqua-glow hover:underline">{mediaItem.owner.username}</Link></p>
                           <p className="flex items-center gap-3"><IconWrapper>{(FaCalendarDays as any)()}</IconWrapper> On: <span className="font-semibold">{new Date(mediaItem.created_at).toLocaleDateString()}</span></p>
                           {mediaItem.latitude && mediaItem.longitude && <p className="flex items-center gap-3"><IconWrapper>{(FaLocationDot as any)()}</IconWrapper> At: <span className="font-semibold">{mediaItem.latitude.toFixed(4)}, {mediaItem.longitude.toFixed(4)}</span></p>}
                        </div>
                    </GlassCard>
                    <GlassCard className="p-6">
                        <h3 className="text-xl font-display font-bold text-white mb-4 border-b border-white/10 pb-3">Community Validation</h3>
                        <div className="flex justify-around items-center text-white mb-6">
                           <div className="text-center"><IconWrapper>{(FaThumbsUp as any)({ className: "text-green-400 text-3xl mx-auto mb-1" })}</IconWrapper><span className="text-2xl font-bold">{mediaItem.community_votes_up}</span></div>
                           <div className="text-center"><IconWrapper>{(FaThumbsDown as any)({ className: "text-red-400 text-3xl mx-auto mb-1" })}</IconWrapper><span className="text-2xl font-bold">{mediaItem.community_votes_down}</span></div>
                        </div>
                    </GlassCard>
                </div>
            </div>
            <div className="mt-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/70 hover:text-aqua-glow transition-colors mb-6">
                    <IconWrapper>{(FaArrowLeft as any)()}</IconWrapper>
                    Back to Sightings
                </button>
            </div>
        </motion.div>
    );
};
export default MediaDetailPage;