import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { MediaItem } from '../types';
import Spinner from '../components/common/Spinner';
import { motion } from 'framer-motion';
import {
  FaFlask, FaHeart, FaThumbsUp, FaThumbsDown, FaUser, FaCalendarAlt,
  FaMapMarkerAlt, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaExclamationTriangle,
  FaLightbulb, FaSpinner as FaSpinnerIcon
} from 'react-icons/fa';
import IconWrapper from '../utils/IconWrapper'; // Add this import
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const MediaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user, updateUserPoints, updateUserBadges } = useAuth();
  const [mediaItem, setMediaItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const fetchMediaItem = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<MediaItem>(`/media/${id}`);
      setMediaItem(response.data);
      if (isAuthenticated && user) {
        try {
          const voteResponse = await api.get(`/community-votes/check/${id}/${user.id}`);
          setHasVoted(voteResponse.data.has_voted);
          console.log("[MediaDetailPage] User has voted:", voteResponse.data.has_voted);
        } catch (voteError) {
          console.warn("[MediaDetailPage] Could not check user vote (API might not exist or error):", voteError);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch media item:', err.response?.data || err.message);
      if (err.response?.status === 404) {
        setError('Sighting not found.');
      } else {
        setError('Failed to load sighting details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaItem();

    let pollInterval: NodeJS.Timeout | undefined;
    if (mediaItem && mediaItem.ai_processing_status === 'pending') {
      console.log("[MediaDetailPage] Starting polling for AI status...");
      pollInterval = setInterval(() => {
        api.get<MediaItem>(`/media/${id}`)
          .then(response => {
            if (response.data.ai_processing_status !== 'pending') {
              setMediaItem(response.data);
              toast.success('AI analysis complete!');
              if (pollInterval) clearInterval(pollInterval);
              pollInterval = undefined;
              console.log("[MediaDetailPage] AI analysis completed, polling stopped.");
            } else {
                console.log("[MediaDetailPage] AI analysis still pending...");
            }
          })
          .catch(err => {
              console.error("Polling error:", err);
              if (pollInterval) clearInterval(pollInterval);
              pollInterval = undefined;
              toast.error("Error during AI status polling.");
          });
      }, 5000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        console.log("[MediaDetailPage] Polling interval cleared on unmount/status change.");
      }
    };
  }, [id, isAuthenticated, user, mediaItem?.ai_processing_status]);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!isAuthenticated) {
      toast.error('Please log in to vote.');
      return;
    }
    if (hasVoted) {
      toast('You have already voted on this sighting.', { icon: '✋' });
      return;
    }
    if (user?.id === mediaItem?.user_id) {
      toast('You cannot vote on your own sighting.', { icon: '🚫' });
      return;
    }

    setIsVoting(true);
    const voteToast = toast.loading('Submitting vote...');
    try {
      const response = await api.post('/community-votes/', {
        media_item_id: mediaItem?.id,
        user_id: user?.id,
        vote_type: voteType,
      });

      setMediaItem(prev => prev ? {
        ...prev,
        community_votes_up: response.data.new_votes_up,
        community_votes_down: response.data.new_votes_down,
        is_community_validated: response.data.is_community_validated,
      } : null);

      if (response.data.user_points !== undefined) {
        updateUserPoints(response.data.user_points);
      }
      if (response.data.new_badges && response.data.new_badges.length > 0) {
        updateUserBadges(response.data.new_badges);
        response.data.new_badges.forEach((badge: string) =>
          toast.success(`New Badge Unlocked: ${badge}!`, { duration: 5000 })
        );
      }

      setHasVoted(true);
      toast.success('Vote submitted!', { id: voteToast });
    } catch (err: any) {
      console.error('Vote failed:', err.response?.data || err.message);
      toast.error(err.response?.data?.detail || 'Vote failed.', { id: voteToast });
    } finally {
      setIsVoting(false);
    }
  };

  if (loading) {
    return <Spinner size="16" color="ocean-primary" />;
  }

  if (error) {
    return (
      <div className="text-center text-ocean-accent-red py-12 text-xl flex flex-col items-center">
        <IconWrapper icon={<FaExclamationTriangle className="inline-block text-5xl mb-4" />} /> {error}
        <Link to={isAuthenticated ? "/upload" : "/login"} className="btn-primary mt-6">Go to Entry</Link>
      </div>
    );
  }

  if (!mediaItem) {
    return <div className="text-center text-ocean-text-light py-12 text-xl">No media item data.</div>;
  }

  const aiStatusIcon = mediaItem.ai_processing_status === 'pending'
    ? <IconWrapper icon={<FaSpinnerIcon className="animate-spin text-ocean-primary" />} />
    : mediaItem.ai_processing_status === 'completed'
      ? <IconWrapper icon={<FaCheckCircle className="text-ocean-primary" />} />
      : <IconWrapper icon={<FaTimesCircle className="text-ocean-accent-red" />} />;

  const aiStatusText = mediaItem.ai_processing_status === 'pending'
    ? 'AI Analysis: Pending...'
    : mediaItem.ai_processing_status === 'completed'
      ? 'AI Analysis: Completed'
      : 'AI Analysis: Failed';

  const healthIcon = mediaItem.validated_health || mediaItem.health_status_ai_prediction;
  let healthEmoji = '';
  if (healthIcon?.toLowerCase().includes('healthy')) healthEmoji = '😊';
  else if (healthIcon?.toLowerCase().includes('stressed')) healthEmoji = '😟';
  else if (healthIcon?.toLowerCase().includes('diseased')) healthEmoji = '🤒';
  else if (healthIcon?.toLowerCase().includes('injured')) healthEmoji = '🤕';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-8"
    >
      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-heading text-ocean-dark text-center mb-12 font-bold leading-tight"
      >
        Sighting <span className="text-ocean-primary">Details</span>
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Image and AI Results */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="glass-card p-0 overflow-hidden col-span-1 lg:col-span-2"
        >
          <img
            src={mediaItem.file_url}
            alt={mediaItem.description || 'Marine sighting'}
            className="w-full h-96 object-cover object-center rounded-t-2xl shadow-inner-lg"
          />
          <div className="p-6">
            <h2 className="text-3xl font-heading text-ocean-dark font-bold mb-4">
              {mediaItem.validated_species || mediaItem.species_ai_prediction || 'Marine Life Sighting'}
              {mediaItem.is_community_validated && (
                <span className="ml-3 text-ocean-primary text-2xl" title="Community Validated">
                  <IconWrapper icon={<FaCheckCircle />} />
                </span>
              )}
            </h2>

            <div className="text-lg text-ocean-text-dark space-y-3">
              <p className="flex items-center gap-2">
                <IconWrapper icon={<FaFlask className="text-ocean-dark" />} /> AI Prediction:{' '}
                <span className="font-semibold text-ocean-dark">
                  {mediaItem.species_ai_prediction || 'N/A'}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <IconWrapper icon={<FaInfoCircle className="text-ocean-dark" />} /> Health Status Prediction:{' '}
                <span className="font-semibold text-ocean-dark">
                  {mediaItem.health_status_ai_prediction || 'N/A'} {healthEmoji}
                </span>
              </p>
              {mediaItem.ai_confidence_score !== null && (
                <p className="flex items-center gap-2">
                  <IconWrapper icon={<FaLightbulb className="text-ocean-dark" />} /> AI Confidence:{' '}
                  <span className="font-semibold text-ocean-dark">
                    {(mediaItem.ai_confidence_score * 100).toFixed(2)}%
                  </span>
                </p>
              )}
              <p className="flex items-center gap-2">
                {aiStatusIcon} {aiStatusText}
              </p>
              {mediaItem.description && (
                <p className="flex items-start gap-2">
                  <IconWrapper icon={<FaInfoCircle className="text-ocean-dark mt-1" />} /> Description:{' '}
                  <span className="text-ocean-text-light flex-1">{mediaItem.description}</span>
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Sidebar Info & Community Validation */}
        <div className="col-span-1 lg:col-span-1 space-y-8">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-heading text-ocean-dark font-bold mb-4 border-b pb-3 border-ocean-medium">Sighting Information</h3>
            <div className="text-ocean-text-dark space-y-3">
              <p className="flex items-center gap-2">
                <IconWrapper icon={<FaUser className="text-ocean-dark" />} /> Reporter:{' '}
                <Link to={`/profile/${mediaItem.owner.id}`} className="font-semibold text-ocean-primary hover:underline">
                  {mediaItem.owner.username}
                </Link>
              </p>
              <p className="flex items-center gap-2">
                <IconWrapper icon={<FaCalendarAlt className="text-ocean-dark" />} /> Date:{' '}
                <span className="font-semibold">{new Date(mediaItem.created_at).toLocaleDateString()}</span>
              </p>
              {mediaItem.latitude && mediaItem.longitude && (
                <p className="flex items-center gap-2">
                  <IconWrapper icon={<FaMapMarkerAlt className="text-ocean-dark" />} /> Location:{' '}
                  <span className="font-semibold">
                    {mediaItem.latitude.toFixed(4)}, {mediaItem.longitude.toFixed(4)}
                  </span>
                </p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="glass-card p-6"
          >
            <h3 className="text-xl font-heading text-ocean-dark font-bold mb-4 border-b pb-3 border-ocean-medium">Community Validation</h3>
            <div className="flex justify-around items-center text-ocean-text-dark mb-6">
              <div className="flex items-center flex-col">
                <IconWrapper icon={<FaThumbsUp className="text-ocean-primary text-3xl mb-2" />} />
                <span className="text-2xl font-bold">{mediaItem.community_votes_up}</span>
                <span className="text-sm">Upvotes</span>
              </div>
              <div className="flex items-center flex-col">
                <IconWrapper icon={<FaThumbsDown className="text-ocean-accent-red text-3xl mb-2" />} />
                <span className="text-2xl font-bold">{mediaItem.community_votes_down}</span>
                <span className="text-sm">Downvotes</span>
              </div>
            </div>

            {mediaItem.ai_processing_status === 'completed' ? (
              isAuthenticated && user?.id !== mediaItem.user_id ? (
                <div className="flex flex-col space-y-4">
                  {hasVoted ? (
                    <p className="text-center text-ocean-text-light font-semibold text-sm">
                      <IconWrapper icon={<FaCheckCircle className="inline-block text-ocean-primary mr-1" />} /> You have already voted on this sighting.
                    </p>
                  ) : (
                    <>
                      <button
                        onClick={() => handleVote('up')}
                        disabled={isVoting || hasVoted}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                      >
                        {isVoting ? <IconWrapper icon={<FaSpinnerIcon className="animate-spin" />} /> : <IconWrapper icon={<FaThumbsUp />} />} Agree with AI
                      </button>
                      <button
                        onClick={() => handleVote('down')}
                        disabled={isVoting || hasVoted}
                        className="btn-secondary w-full flex items-center justify-center gap-2"
                      >
                        {isVoting ? <IconWrapper icon={<FaSpinnerIcon className="animate-spin" />} /> : <IconWrapper icon={<FaThumbsDown />} />} Disagree with AI
                      </button>
                    </>
                  )}
                </div>
              ) : isAuthenticated && user?.id === mediaItem.user_id ? (
                <p className="text-center text-ocean-text-light font-semibold text-sm">
                  You cannot vote on your own sighting.
                </p>
              ) : (
                <p className="text-center text-ocean-text-light font-semibold text-sm">
                  <Link to="/login" className="text-ocean-primary hover:underline">Log in</Link> to cast your vote!
                </p>
              )
            ) : (
              <p className="text-center text-ocean-text-light font-semibold text-sm">
                Voting will be available once AI analysis is complete.
              </p>
            )}
            {mediaItem.is_community_validated && (
              <p className="text-center text-ocean-primary font-bold mt-4 text-sm">
                <IconWrapper icon={<FaCheckCircle className="inline-block mr-1" />} /> This sighting is community validated!
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default MediaDetailPage;