import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { MediaItem } from '../types';
import api from '../api/axios';
import Spinner from '../components/common/Spinner';

const MediaCard = ({ item }: { item: MediaItem }) => (
    <Link to={`/media/${item.id}`} className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300 group">
        <div className="h-40 overflow-hidden"><img src={item.file_url} alt={item.species_ai_prediction || 'Marine life'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>
        <div className="p-4">
            <h3 className="font-bold text-md truncate group-hover:text-primary transition-colors">{item.validated_species || item.species_ai_prediction || "Awaiting Identification"}</h3>
            <p className="text-xs text-gray-500 mt-1">Status: {item.validated_health_status || item.health_status_ai_prediction || 'N/A'}</p>
        </div>
    </Link>
);

const ProfilePage = () => {
    const { user } = useAuth();
    const [myMedia, setMyMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyMedia = async () => {
            if (user) {
                try {
                    const response = await api.get<MediaItem[]>('/media/user/me');
                    setMyMedia(response.data);
                } catch (error) {
                    console.error("Failed to fetch user's media", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchMyMedia();
    }, [user]);

    if (!user) { return <div className="mt-16"><Spinner size="12" /></div>; }

    return (
        <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-neutral">My Profile</h1>
              <p className="text-gray-500 mt-1">Welcome back, {user.username}!</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details & Contributions */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-primary">Account Details</h2>
                        <div className="space-y-3 text-sm">
                            <p><strong>Username:</strong> {user.username}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Member Since:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-primary">My Contributions</h2>
                        <div className="text-center">
                            <p className="text-lg text-gray-600">Total Score</p>
                            <p className="font-bold text-6xl text-accent my-2">{user.score}</p>
                        </div>
                        <div className="mt-6">
                            <h3 className="text-lg text-center font-bold mb-3">My Badges</h3>
                            {user.earned_badges.length > 0 ? (
                                <div className="flex flex-wrap justify-center gap-3">
                                    {user.earned_badges.map(badge => (
                                        <div key={badge} className="bg-info bg-opacity-30 text-primary font-semibold px-4 py-2 rounded-full shadow-sm text-sm">
                                            🎖️ {badge}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 italic">No badges earned yet. Keep contributing!</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Uploads */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-primary">My Uploaded Sightings</h2>
                    {loading ? (
                        <Spinner />
                    ) : myMedia.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {myMedia.map(item => <MediaCard key={item.id} item={item} />)}
                        </div>
                    ) : (
                        <div className="text-center p-8 border-2 border-dashed rounded-lg">
                            <p className="text-gray-500">You haven't uploaded any sightings yet.</p>
                            <Link to="/upload" className="mt-4 inline-block bg-accent hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg">
                                Upload your first one!
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;