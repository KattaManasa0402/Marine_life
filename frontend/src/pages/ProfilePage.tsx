import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import Spinner from '../components/common/Spinner';
import { FaUserCircle, FaStar, FaGlobe, FaTrophy, FaCompass, FaRegSadTear, FaCheckCircle, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../api/axios';
import { MediaItem } from '../types';
import { Link } from 'react-router-dom';
import IconWrapper from '../utils/IconWrapper';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [userSightings, setUserSightings] = useState<MediaItem[]>([]);
  const [sightingsLoading, setSightingsLoading] = useState(true);
  const [sightingsError, setSightingsError] = useState<string | null>(null);

  console.log("[ProfilePage] Component Render. user:", user ? user.username : "null", "isAuthenticated:", isAuthenticated, "authLoading:", authLoading);

  useEffect(() => {
    const fetchUserSightings = async () => {
      if (user?.id) {
        setSightingsLoading(true);
        setSightingsError(null);
        console.log("[ProfilePage] Attempting to fetch user sightings for user ID:", user.id);
        try {
          const response = await api.get<MediaItem[]>(`/media/user/${user.id}`);
          setUserSightings(response.data);
          console.log("[ProfilePage] Fetched user sightings:", response.data);
        } catch (error) {
          console.error('[ProfilePage] Failed to fetch user sightings:', error);
          setSightingsError('Failed to load your sightings.');
        } finally {
          setSightingsLoading(false);
          console.log("[ProfilePage] User sightings fetch completed. sightingsLoading:", false);
        }
      } else {
        console.log("[ProfilePage] User ID not available, skipping sighting fetch.");
        setSightingsLoading(false);
      }
    };
    
    if (!authLoading && isAuthenticated && user) {
      fetchUserSightings();
    } else if (!authLoading && !isAuthenticated) {
        console.log("[ProfilePage] Not authenticated, not fetching sightings.");
        setSightingsLoading(false);
    }

  }, [user, isAuthenticated, authLoading]);

  if (authLoading) {
    console.log("[ProfilePage] Displaying auth loading spinner.");
    return <Spinner size="16" color="ocean-primary" />;
  }

  if (!isAuthenticated) {
    console.log("[ProfilePage] User is not authenticated, showing fallback message (should be handled by ProtectedRoute).");
    return <div className="text-center text-ocean-accent-red py-12 text-xl">You must be logged in to view your profile.</div>;
  }

  if (!user) {
    console.log("[ProfilePage] User object is null despite isAuthenticated being true. This is unexpected.");
    return <div className="text-center text-ocean-accent-red py-12 text-xl">User data not found. Please log in again.</div>;
  }

  const badgeIcons: { [key: string]: React.ReactElement } = {
    "First Sighting": <IconWrapper icon={<FaCompass className="text-ocean-primary" />} />,
    "Community Contributor": <IconWrapper icon={<FaStar className="text-ocean-accent-gold" />} />,
    "Global Explorer": <IconWrapper icon={<FaGlobe className="text-ocean-medium" />} />,
    "Verified Expert": <IconWrapper icon={<FaCheckCircle className="text-ocean-primary" />} />,
  };

  const commonMotionProps = {
    initial: "hidden",
    animate: "visible",
    variants: {
      hidden: { opacity: 0, y: 30 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    }
  };

  return (
    <motion.div {...commonMotionProps} className="py-8">
      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-heading text-ocean-dark text-center mb-12 font-bold leading-tight"
      >
        Your <span className="text-ocean-primary">Profile</span>
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Info Card */}
        <motion.div
          variants={commonMotionProps.variants}
          initial="hidden"
          animate="visible"
          className="glass-card p-8 flex flex-col items-center text-center col-span-1 lg:col-span-1"
        >
          <IconWrapper icon={<FaUserCircle className="text-ocean-dark text-7xl mb-4" />} />
          <h2 className="text-3xl font-heading text-ocean-dark font-bold mb-2">
            {user.username}
          </h2>
          <p className="text-ocean-text-light text-md">{user.email}</p>
          <div className="mt-6 flex items-center gap-2 text-ocean-dark font-semibold text-xl">
            <IconWrapper icon={<FaTrophy className="text-ocean-accent-gold" />} /> Points: {user.points}
          </div>

          <div className="mt-8 w-full">
            <h3 className="text-xl font-heading text-ocean-dark font-bold mb-4">Your Badges</h3>
            {user.badges && user.badges.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-4">
                {user.badges.map((badge, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 200, damping: 10 }}
                    className="glass-card p-4 flex flex-col items-center text-sm font-semibold text-ocean-text-dark w-32 h-32 justify-center"
                  >
                    <div className="text-4xl mb-2">
                      {badgeIcons[badge] || <IconWrapper icon={<FaStar className="text-ocean-primary" />} />}
                    </div>
                    {badge}
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-ocean-text-light text-sm">No badges earned yet. Keep exploring!</p>
            )}
          </div>
        </motion.div>

        {/* User Sightings List */}
        <div className="col-span-1 lg:col-span-2">
          <motion.div
            variants={commonMotionProps.variants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="glass-card p-8"
          >
            <h3 className="text-2xl font-heading text-ocean-dark font-bold mb-6 text-center">Your Recent Sightings</h3>
            {sightingsLoading ? (
              <Spinner size="12" color="ocean-primary" />
            ) : sightingsError ? (
              <div className="text-center text-ocean-accent-red text-md">
                <IconWrapper icon={<FaRegSadTear className="inline-block mr-2 text-2xl" />} /> {sightingsError}
              </div>
            ) : userSightings.length === 0 ? (
              <p className="text-center text-ocean-text-light text-md">You haven't uploaded any sightings yet. Start contributing!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userSightings.map((item) => (
                  <motion.div
                    key={item.id}
                    className="glass-card p-0 overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
                  >
                    <Link to={`/media/${item.id}`} className="block">
                      <img
                        src={item.file_url}
                        alt={item.species_ai_prediction || 'Marine life'}
                        className="w-full h-48 object-cover rounded-t-xl transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="p-4">
                        <h4 className="font-semibold text-lg font-heading text-ocean-dark truncate">
                          {item.validated_species || item.species_ai_prediction || 'Analyzing...'}
                        </h4>
                        <p className="text-sm text-ocean-text-light mt-1">
                          Health: {item.validated_health || item.health_status_ai_prediction || 'N/A'}
                        </p>
                        <p className="text-xs text-ocean-text-light flex items-center gap-1">
                          <IconWrapper icon={<FaMapMarkerAlt />} /> {item.latitude?.toFixed(2)}, {item.longitude?.toFixed(2)}
                        </p>
                        <p className="text-xs text-ocean-text-light">
                          Uploaded: {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;