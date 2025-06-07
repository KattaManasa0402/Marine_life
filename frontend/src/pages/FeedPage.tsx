import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { MediaItem } from '../types';
import { Link } from 'react-router-dom';
import Spinner from '../components/common/Spinner';

const MediaCard = ({ item }: { item: MediaItem }) => (
    <Link to={`/media/${item.id}`} className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-2 transition-all duration-300 group">
        <div className="h-48 overflow-hidden">
            <img src={item.file_url} alt={item.species_ai_prediction || 'Marine life'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="p-5">
            <h3 className="font-bold text-lg text-neutral truncate group-hover:text-primary transition-colors">
                {item.validated_species || item.species_ai_prediction || "Awaiting Identification"}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
                Health: <span className="font-medium">{item.validated_health_status || item.health_status_ai_prediction || 'N/A'}</span>
            </p>
            <p className="text-xs text-gray-400 mt-3">
                Uploaded: {new Date(item.created_at).toLocaleDateString()}
            </p>
        </div>
    </Link>
);

const FeedPage = () => {
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMedia = async () => {
            try {
                setLoading(true);
                const response = await api.get<MediaItem[]>('/media/');
                setMediaItems(response.data);
            } catch (err) {
                setError('Failed to load media feed. The server might be offline.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMedia();
    }, []);

    if (loading) return <div className="mt-16"><Spinner size="12" /></div>;
    if (error) return <div className="text-center p-10 bg-red-100 text-error font-bold rounded-lg">{error}</div>;

    return (
        <div>
            <h1 className="text-4xl font-bold mb-8 text-neutral border-b-4 border-secondary pb-2">Recent Sightings</h1>
            {mediaItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {mediaItems.map(item => <MediaCard key={item.id} item={item} />)}
                </div>
            ) : (
                <div className="text-center p-16 bg-white rounded-xl shadow-sm">
                    <p className="text-lg text-gray-500">No sightings have been uploaded yet. Be the first!</p>
                    <Link to="/upload" className="mt-4 inline-block bg-accent hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                        Upload a Sighting
                    </Link>
                </div>
            )}
        </div>
    );
};

export default FeedPage;