import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import GlassCard from '../components/common/GlassCard';
import { FaUser, FaCamera, FaLocationDot, FaCalendar, FaStar, FaTrophy, FaFish, FaWater } from 'react-icons/fa6';
import IconWrapper from '../utils/IconWrapper';
import api from '../api/axios';
import { MediaItem } from '../types';

const badgeLevels = [
  { count: 1, label: 'First Splash', icon: FaStar, color: 'bg-aqua-glow/80' },
  { count: 5, label: 'Explorer', icon: FaTrophy, color: 'bg-sea-foam/80' },
  { count: 10, label: 'Marine Enthusiast', icon: FaFish, color: 'bg-azure/80' },
  { count: 20, label: 'Ocean Guardian', icon: FaWater, color: 'bg-blue-400/80' },
];

// Animated bubble background
const Bubble: React.FC<{ delay: number; size: number; left: number }> = ({ delay, size, left }) => (
  <motion.div
    initial={{ y: '100vh', opacity: 0 }}
    animate={{ y: '-100vh', opacity: [0, 0.8, 0] }}
    transition={{ duration: 8, delay, repeat: Infinity, ease: 'linear' }}
    className="absolute rounded-full bg-white/10 backdrop-blur-sm"
    style={{ width: size, height: size, left: `${left}%`, filter: 'blur(1px)' }}
  />
);

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [userSightings, setUserSightings] = useState<MediaItem[]>([]);
  const [uniqueSpecies, setUniqueSpecies] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserSightings = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const response = await api.get<MediaItem[]>('/media/');
        const userItems = response.data.filter(item => item.user_id === user.id);
        setUserSightings(userItems);
        setUniqueSpecies(new Set(userItems
          .map(item => item.species_ai_prediction as string | null)
          .filter((s): s is string => typeof s === 'string' && s !== null && s !== undefined && s !== '')
        ));
      } catch (err) {
        setUserSightings([]);
        setUniqueSpecies(new Set());
      } finally {
        setLoading(false);
      }
    };
    fetchUserSightings();
  }, [user]);

  // Determine badge
  const badge = badgeLevels.slice().reverse().find(b => userSightings.length >= b.count);

  // Animated stat number
  const AnimatedStat: React.FC<{ value: number; icon: React.ReactNode }> = ({ value, icon }) => (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center"
    >
      <span className="text-3xl mb-1">{icon}</span>
      <motion.h3
        className="text-2xl font-display text-aqua-glow mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        {value}
      </motion.h3>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated bubbles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(18)].map((_, i) => (
          <Bubble key={i} delay={i * 0.7} size={18 + (i % 5) * 8} left={Math.random() * 100} />
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto relative z-10"
      >
        <GlassCard className="p-8 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Profile Image with animated glow */}
            <motion.div
              whileHover={{ scale: 1.08 }}
              className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-aqua-glow/60 shadow-xl bg-gradient-to-br from-aqua-glow/40 to-sea-foam/30 flex items-center justify-center animate-pulse"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-aqua-glow/30 to-transparent" />
              <IconWrapper>
                {(FaUser as any)({ className: "w-28 h-28 text-sea-foam/60" })}
              </IconWrapper>
              {badge && (
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.7 }}
                  className={`absolute bottom-2 right-2 px-3 py-1 rounded-full text-xs font-bold text-white shadow ${badge.color} flex items-center gap-1.5`}
                  title={badge.label}
                >
                  <IconWrapper>{(badge.icon as any)({ className: "text-white" })}</IconWrapper> {badge.label}
                </motion.div>
              )}
            </motion.div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <motion.h1
                className="text-4xl font-display font-bold text-sea-foam mb-2 flex items-center justify-center md:justify-start gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
              >
                {user?.username || 'Ocean Explorer'} <span className="text-2xl">🌊</span>
              </motion.h1>
              <motion.p
                className="text-sea-foam/70 mb-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                Welcome back to the ocean, marine life enthusiast!
              </motion.p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-2 text-sea-foam/80">
                  <IconWrapper>{(FaCamera as any)({ className: "text-aqua-glow" })}</IconWrapper>
                  <span>{userSightings.length} Sightings</span>
                </div>
                <div className="flex items-center gap-2 text-sea-foam/80">
                  <IconWrapper>{(FaFish as any)({ className: "text-aqua-glow" })}</IconWrapper>
                  <span>{uniqueSpecies.size} Species</span>
                </div>
                <div className="flex items-center gap-2 text-sea-foam/80">
                  <IconWrapper>{(FaCalendar as any)({ className: "text-aqua-glow" })}</IconWrapper>
                  <span>Member since {user?.created_at ? new Date(user.created_at).getFullYear() : '2024'}</span>
                </div>
              </div>
              {/* Floating badge showcase */}
              <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
                {badgeLevels.filter(b => userSightings.length >= b.count).map((b, i) => (
                  <motion.div
                    key={b.label}
                    className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow ${b.color} flex items-center gap-1.5 animate-bounce`}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 + i * 0.2 }}
                    title={b.label}
                  >
                    <IconWrapper>{(b.icon as any)({ className: "text-white" })}</IconWrapper> {b.label}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Section with marine icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <GlassCard className="p-6 text-center">
              <AnimatedStat value={userSightings.length} icon={(FaCamera as any)({ className: "text-aqua-glow" })} />
              <p className="text-sea-foam/70">Sightings</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <AnimatedStat value={uniqueSpecies.size} icon={(FaFish as any)({ className: "text-sea-foam" })} />
              <p className="text-sea-foam/70">Species Found</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <AnimatedStat value={user?.score ?? 0} icon={(FaStar as any)({ className: "text-yellow-400" })} />
              <p className="text-sea-foam/70">Score</p>
            </GlassCard>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default ProfilePage; 