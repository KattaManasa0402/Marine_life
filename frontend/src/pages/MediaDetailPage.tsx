import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { MediaItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/common/Spinner';

// Simple SVG Icons for buttons
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>;

const MediaDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { user, fetchUser } = useAuth();
    const [item, setItem] = useState<MediaItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [showSpeciesCorrection, setShowSpeciesCorrection] = useState(false);
    const [speciesCorrection, setSpeciesCorrection] = useState('');
    const [speciesVoteMessage, setSpeciesVoteMessage] = useState('');

    const [showHealthCorrection, setShowHealthCorrection] = useState(false);
    const [healthCorrection, setHealthCorrection] = useState('');
    const [healthVoteMessage, setHealthVoteMessage] = useState('');
    const healthStatusOptions = ["Healthy", "Injured", "Sick", "Bleached", "Deceased", "Unknown"];

    const pollingInterval = useRef<NodeJS.Timeout | null>(null);

    // This function is correct and needs no changes.
    const fetchItem = async (itemId: string | undefined) => {
        if (!itemId) return;
        try {
            const response = await api.get<MediaItem>(`/media/${itemId}`);
            const fetchedItem = response.data;
            setItem(fetchedItem);
            if (fetchedItem.ai_processing_status !== 'pending') {
                if (pollingInterval.current) clearInterval(pollingInterval.current);
            }
        } catch (err) {
            setError('Media item not found.');
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        } finally {
            setLoading(false);
        }
    };

    // This hook is correct and needs no changes.
    useEffect(() => {
        fetchItem(id);
        pollingInterval.current = setInterval(() => {
            setItem(currentItem => {
                if (currentItem?.ai_processing_status === 'pending') {
                    fetchItem(id);
                } else {
                    if (pollingInterval.current) clearInterval(pollingInterval.current);
                }
                return currentItem;
            });
        }, 3000);
        return () => {
            if (pollingInterval.current) clearInterval(pollingInterval.current);
        };
    }, [id]);

    // This function is correct and needs no changes.
    const handleVote = async (voteType: 'species' | 'health', agrees: boolean) => {
        if (!user) {
            voteType === 'species' ? setSpeciesVoteMessage("You must be logged in to vote.") : setHealthVoteMessage("You must be logged in to vote.");
            return;
        }
        let payload: any = {};
        if (voteType === 'species') {
            if (!agrees && !speciesCorrection) {
                setSpeciesVoteMessage("Please provide a species correction.");
                return;
            }
            if (!window.confirm(agrees ? "Confirm agreement?" : `Confirm correction to "${speciesCorrection}"?`)) return;
            payload = { vote_on_species: agrees, corrected_species_name: agrees ? null : speciesCorrection };
        } else {
            if (!agrees && !healthCorrection) {
                setHealthVoteMessage("Please select a health status correction.");
                return;
            }
            if (!window.confirm(agrees ? "Confirm agreement?" : `Confirm correction to "${healthCorrection}"?`)) return;
            payload = { vote_on_health: agrees, corrected_health_status: agrees ? null : healthCorrection };
        }
        try {
            await api.post(`/validation/media/${item?.id}/validate`, payload);
            const successMsg = "Vote submitted! Your score has been updated.";
            if (voteType === 'species') setSpeciesVoteMessage(successMsg);
            if (voteType === 'health') setHealthVoteMessage(successMsg);
            await fetchUser();
            fetchItem(id);
        } catch (err: any) {
             const errorMessage = err.response?.data?.detail || "You may have already voted on this item.";
             if (voteType === 'species') setSpeciesVoteMessage(errorMessage);
             if (voteType === 'health') setHealthVoteMessage(errorMessage);
        }
    };

    if (loading) return <div className="mt-16"><Spinner size="12" /></div>;
    if (error) return <div className="text-center p-10 bg-red-100 text-red-700 font-bold rounded-lg">{error}</div>;
    if (!item) return <div>Item not found.</div>;

    const isAIPending = item.ai_processing_status === 'pending';
    const DetailRow = ({ label, value }: { label: string, value: string | null | undefined }) => (
      <div className="flex justify-between items-center py-2">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-gray-800">{value || 'N/A'}</span>
      </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
                <img src={item.file_url} alt={item.description || 'Marine Sighting'} className="w-full h-auto rounded-xl shadow-2xl object-cover" />
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Sighting Details</h1>
                    <div className="space-y-2 text-sm">
                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                            <h2 className="font-bold text-blue-800 mb-2">🤖 AI Prediction</h2>
                            {isAIPending ? (
                                <div className="flex items-center space-x-3 text-blue-800">
                                    <Spinner size="4" />
                                    <span>Analyzing image...</span>
                                </div>
                            ) : (
                                <>
                                    <DetailRow label="Species" value={item.species_ai_prediction} />
                                    <DetailRow label="Health" value={item.health_status_ai_prediction} />
                                </>
                            )}
                        </div>
                        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                            <h2 className="font-bold text-green-700 mb-2">👥 Community Validated</h2>
                            <DetailRow label="Species" value={item.validated_species} />
                            <DetailRow label="Health" value={item.validated_health_status} />
                        </div>
                    </div>
                </div>

                {/* ===================== THE FIX IS HERE ===================== */}
                {/* This single, combined block handles all validation UI logic. */}
                <div className="border-t-2 pt-4">
                    <h3 className="font-semibold text-xl text-gray-800 mb-4">Help The Community</h3>

                    {/* Case 1: Not logged in */}
                    {!user ? (
                         <p className="text-sm text-gray-600">Please <Link to="/login" className="text-blue-600 hover:underline font-bold">log in</Link> to participate in validation.</p>
                    
                    // Case 2: Logged in, but AI is still processing
                    ) : isAIPending ? (
                        <p className="text-sm text-gray-500 italic">Validation options will appear once AI analysis is complete.</p>
                    
                    // Case 3: Logged in and AI is done
                    ) : (
                        <div className="space-y-6">
                            {/* Species Validation */}
                            {item.species_ai_prediction && item.species_ai_prediction !== "No Marine Life Detected" && (
                                <div>
                                    <p className="text-sm my-2 text-gray-600">Agree with the AI's prediction of <span className="font-bold">{item.species_ai_prediction}</span>?</p>
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleVote('species', true)} className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-all w-full"><CheckIcon/> Agree</button>
                                        <button onClick={() => setShowSpeciesCorrection(!showSpeciesCorrection)} className="flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg transition-all w-full"><PencilIcon/> Correct</button>
                                    </div>
                                    {showSpeciesCorrection && (<div className="mt-4"><input type="text" value={speciesCorrection} onChange={(e) => setSpeciesCorrection(e.target.value)} placeholder="Enter correct species" className="w-full p-2 border rounded-lg" /><button onClick={() => handleVote('species', false)} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg w-full">Submit Correction</button></div>)}
                                    {speciesVoteMessage && <p className="mt-4 text-sm text-blue-700 font-medium">{speciesVoteMessage}</p>}
                                </div>
                            )}

                            {/* Health Validation */}
                            {item.health_status_ai_prediction && (
                                <div className="border-t pt-4">
                                    <h3 className="font-semibold text-lg text-gray-800">Validate Health Status</h3>
                                    <p className="text-sm my-2 text-gray-600">Agree with the AI's prediction of <span className="font-bold">{item.health_status_ai_prediction}</span>?</p>
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleVote('health', true)} className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-all w-full"><CheckIcon/> Agree</button>
                                        <button onClick={() => setShowHealthCorrection(!showHealthCorrection)} className="flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded-lg transition-all w-full"><PencilIcon/> Correct</button>
                                    </div>
                                    {showHealthCorrection && (<div className="mt-4"><select value={healthCorrection} onChange={(e) => setHealthCorrection(e.target.value)} className="w-full p-2 border rounded-lg"><option value="">Select correct status...</option>{healthStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select><button onClick={() => handleVote('health', false)} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg w-full">Submit Correction</button></div>)}
                                    {healthVoteMessage && <p className="mt-4 text-sm text-blue-700 font-medium">{healthVoteMessage}</p>}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                 {/* ========================================================= */}
            </div>
        </div>
    );
};

export default MediaDetailPage;