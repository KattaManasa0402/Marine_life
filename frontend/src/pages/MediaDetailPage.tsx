import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { MediaItem } from '../types';
import Spinner from '../components/common/Spinner';
import { motion } from 'framer-motion';
import { FaFlask, FaThumbsUp, FaThumbsDown, FaUser, FaCalendarDays, FaLocationDot, FaCircleInfo, FaCircleCheck, FaCircleXmark, FaTriangleExclamation, FaLightbulb, FaSpinner, FaArrowLeft, FaTag, FaHeartPulse, FaCheck } from 'react-icons/fa6';
import { useAuth } from '../contexts/AuthContext';
import GlassCard from '../components/common/GlassCard';
import IconWrapper from '../utils/IconWrapper';

// Validation Modal Component
const ValidationModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  aiSpecies: string | null;
  aiHealth: string | null;
}> = ({ open, onClose, onSubmit, aiSpecies, aiHealth }) => {
  const [speciesVote, setSpeciesVote] = useState<'confirm' | 'dispute' | null>(null);
  const [healthVote, setHealthVote] = useState<'confirm' | 'dispute' | null>(null);
  const [correctedSpecies, setCorrectedSpecies] = useState('');
  const [correctedHealth, setCorrectedHealth] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!open) {
      setSpeciesVote(null);
      setHealthVote(null);
      setCorrectedSpecies('');
      setCorrectedHealth('');
      setComment('');
    }
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-deep-blue rounded-2xl shadow-2xl p-8 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-white/70 hover:text-white text-2xl">{(FaCircleXmark as any)({})}</button>
        <h2 className="text-2xl font-bold text-aqua-glow mb-6 text-center">Validate Sighting</h2>
        <form onSubmit={e => { e.preventDefault(); onSubmit({ speciesVote, healthVote, correctedSpecies, correctedHealth, comment }); }}>
          <div className="mb-4">
            <label className="block text-white mb-2 font-semibold">AI Species: <span className="font-normal">{aiSpecies || 'N/A'}</span></label>
            <div className="flex gap-4 mb-2">
              <button type="button" className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 ${speciesVote === 'confirm' ? 'bg-green-500 text-white' : 'bg-white/10 text-white/80'}`} onClick={() => setSpeciesVote('confirm')}>{(FaCheck as any)({})} Confirm</button>
              <button type="button" className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 ${speciesVote === 'dispute' ? 'bg-red-500 text-white' : 'bg-white/10 text-white/80'}`} onClick={() => setSpeciesVote('dispute')}>{(FaCircleXmark as any)({})} Dispute</button>
            </div>
            {speciesVote === 'dispute' && (
              <input type="text" className="w-full p-2 rounded bg-white/10 text-white mt-2" placeholder="Correct species name" value={correctedSpecies} onChange={e => setCorrectedSpecies(e.target.value)} />
            )}
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2 font-semibold">AI Health: <span className="font-normal">{aiHealth || 'N/A'}</span></label>
            <div className="flex gap-4 mb-2">
              <button type="button" className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 ${healthVote === 'confirm' ? 'bg-green-500 text-white' : 'bg-white/10 text-white/80'}`} onClick={() => setHealthVote('confirm')}>{(FaCheck as any)({})} Confirm</button>
              <button type="button" className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 ${healthVote === 'dispute' ? 'bg-red-500 text-white' : 'bg-white/10 text-white/80'}`} onClick={() => setHealthVote('dispute')}>{(FaCircleXmark as any)({})} Dispute</button>
            </div>
            {healthVote === 'dispute' && (
              <input type="text" className="w-full p-2 rounded bg-white/10 text-white mt-2" placeholder="Correct health status" value={correctedHealth} onChange={e => setCorrectedHealth(e.target.value)} />
            )}
          </div>
          <div className="mb-4">
            <label className="block text-white mb-2 font-semibold">Comment (optional):</label>
            <textarea className="w-full p-2 rounded bg-white/10 text-white" rows={2} value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your reasoning or observations..." />
          </div>
          <button type="submit" className="w-full py-2 rounded-full bg-aqua-glow text-white font-bold text-lg mt-2 hover:bg-sea-foam transition">Submit Validation</button>
        </form>
      </div>
    </div>
  );
};

const MediaDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [mediaItem, setMediaItem] = useState<MediaItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationSubmitted, setValidationSubmitted] = useState(false);

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

    // Submit validation vote
    const handleValidationSubmit = async (data: any) => {
      if (!mediaItem) return;
      try {
        await api.post(`/validation/media/${mediaItem.id}/validate`, {
          vote_on_species: data.speciesVote === 'confirm' ? true : data.speciesVote === 'dispute' ? false : null,
          corrected_species_name: data.speciesVote === 'dispute' ? data.correctedSpecies : undefined,
          vote_on_health: data.healthVote === 'confirm' ? true : data.healthVote === 'dispute' ? false : null,
          corrected_health_status: data.healthVote === 'dispute' ? data.correctedHealth : undefined,
          comment: data.comment || undefined,
        });
        setValidationSubmitted(true);
        setShowValidationModal(false);
      } catch (err) {
        alert('Failed to submit validation. Please try again.');
      }
    };

    if (loading) return <div className="flex justify-center items-center h-[70vh]"><Spinner size="16" /></div>;
    if (error) return <div className="text-center text-red-400 py-12">{error}</div>;
    if (!mediaItem) return <div className="text-center text-white/80 py-12">Media item not found.</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <GlassCard className="p-0 overflow-hidden flex justify-center items-center bg-white/5">
                            <img 
                                src={mediaItem.file_url} 
                                alt={mediaItem.species_ai_prediction || 'Marine Life'} 
                                className="max-w-[400px] max-h-[350px] w-full h-auto object-cover rounded-2xl shadow-lg border-4 border-aqua-glow/30 bg-white/10 m-4"
                                style={{ objectFit: 'cover' }}
                            />
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
                            <p className="text-xs text-center text-white/50 mb-4">
                                This score reflects the community's consensus on the AI's predictions.
                            </p>
                            {/* Show Validate button if user is logged in, not the uploader, and hasn't validated yet */}
                            {user && user.id !== mediaItem.user_id && !validationSubmitted && (
                              <button
                                className="w-full py-2 rounded-full bg-aqua-glow text-white font-bold text-lg mt-2 hover:bg-sea-foam transition"
                                onClick={() => setShowValidationModal(true)}
                              >
                                Validate Sighting
                              </button>
                            )}
                            {validationSubmitted && (
                              <p className="text-green-400 text-center font-semibold mt-2">Thank you for validating!</p>
                            )}
                        </GlassCard>
                        <ValidationModal
                          open={showValidationModal}
                          onClose={() => setShowValidationModal(false)}
                          onSubmit={handleValidationSubmit}
                          aiSpecies={mediaItem.species_ai_prediction}
                          aiHealth={mediaItem.health_status_ai_prediction}
                        />
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