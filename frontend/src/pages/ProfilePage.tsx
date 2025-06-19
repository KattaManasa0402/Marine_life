import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import GlassCard from '../components/common/GlassCard';
import { FaUser, FaCamera, FaLocationDot, FaCalendar } from 'react-icons/fa6';
import IconWrapper from '../utils/IconWrapper';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <GlassCard className="p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Profile Image */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-aqua-glow/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-aqua-glow/20 to-transparent" />
            <IconWrapper>
              {(FaUser as any)({ className: "w-full h-full text-sea-foam/50" })}
            </IconWrapper>
          </motion.div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-display font-bold text-sea-foam mb-2">
              {user?.username || 'Ocean Explorer'}
            </h1>
            <p className="text-sea-foam/70 mb-4">
              Marine Life Enthusiast
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-2 text-sea-foam/80">
                <IconWrapper>{(FaCamera as any)({ className: "text-aqua-glow" })}</IconWrapper>
                <span>24 Sightings</span>
              </div>
              <div className="flex items-center gap-2 text-sea-foam/80">
                <IconWrapper>{(FaLocationDot as any)({ className: "text-aqua-glow" })}</IconWrapper>
                <span>5 Locations</span>
              </div>
              <div className="flex items-center gap-2 text-sea-foam/80">
                <IconWrapper>{(FaCalendar as any)({ className: "text-aqua-glow" })}</IconWrapper>
                <span>Member since 2024</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <GlassCard className="p-6 text-center">
            <h3 className="text-2xl font-display text-aqua-glow mb-2">42</h3>
            <p className="text-sea-foam/70">Validations</p>
          </GlassCard>
          <GlassCard className="p-6 text-center">
            <h3 className="text-2xl font-display text-aqua-glow mb-2">15</h3>
            <p className="text-sea-foam/70">Species Found</p>
          </GlassCard>
          <GlassCard className="p-6 text-center">
            <h3 className="text-2xl font-display text-aqua-glow mb-2">89%</h3>
            <p className="text-sea-foam/70">Accuracy Rate</p>
          </GlassCard>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default ProfilePage; 