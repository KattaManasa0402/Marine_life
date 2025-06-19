import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { FaUpload, FaSpinner, FaCheck, FaXmark, FaCompass } from 'react-icons/fa6';
import api from '../api/axios';
import toast from 'react-hot-toast';
import GlassCard from '../components/common/GlassCard';
import IconWrapper from '../utils/IconWrapper';

const UploadPage: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [description, setDescription] = useState<string>('');
    const [latitude, setLatitude] = useState<string>('');
    const [longitude, setLongitude] = useState<string>('');
    const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(acceptedFiles.slice(0, 1));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png'],
            'video/*': ['.mp4', '.mov']
        },
        maxSize: 100 * 1024 * 1024 // 100MB
    });

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        const loadingToast = toast.loading('Uploading files...');

        try {
            const formData = new FormData();
            if (files.length > 0) {
                formData.append('file', files[0]);
            }
            
            if (description) formData.append('description', description);
            if (latitude && !isNaN(parseFloat(latitude))) formData.append('latitude', latitude);
            if (longitude && !isNaN(parseFloat(longitude))) formData.append('longitude', longitude);

            const response = await api.post('/media/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const progress = progressEvent.total ? Math.round((progressEvent.loaded * 100) / progressEvent.total) : 0;
                    setUploadProgress(prev => ({ ...prev, total: progress }));
                }
            });

            toast.success('Files uploaded successfully!', { id: loadingToast });
            setFiles([]);
            setUploadProgress({});
        } catch (err: any) {
            const errorDetail = err.response?.data?.detail;
            if (typeof errorDetail === 'string') {
                toast.error(errorDetail, { id: loadingToast });
            } else {
                toast.error('Upload failed. Please try again.', { id: loadingToast });
            }
        } finally {
            setUploading(false);
        }
    };

    const handleDetectLocation = () => {
        if (navigator.geolocation) {
            setIsDetectingLocation(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude.toFixed(6));
                    setLongitude(position.coords.longitude.toFixed(6));
                    toast.success('Location detected!');
                    setIsDetectingLocation(false);
                },
                (error) => {
                    console.error('Error getting geolocation:', error);
                    let errorMessage = 'Failed to detect location.';
                    if (error.code === error.PERMISSION_DENIED) {
                        errorMessage = 'Location access denied. Please enable it in your browser settings.';
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        errorMessage = 'Location information is unavailable.';
                    } else if (error.code === error.TIMEOUT) {
                        errorMessage = 'The request to get user location timed out.';
                    }
                    toast.error(errorMessage);
                    setIsDetectingLocation(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            toast.error('Geolocation is not supported by your browser.');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
                <GlassCard className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-display font-bold text-white mb-2">Upload Media</h1>
                        <p className="text-white/70">Share your marine life sightings with the community</p>
                    </div>

                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                            isDragActive ? 'border-aqua-glow bg-aqua-glow/10' : 'border-white/20 hover:border-aqua-glow'
                        }`}
                    >
                        <input {...getInputProps()} />
                        <IconWrapper>{(FaUpload as any)({ className: "text-5xl text-aqua-glow mx-auto mb-4" })}</IconWrapper>
                        <p className="text-white text-lg mb-2">
                            {isDragActive ? 'Drop the files here' : 'Drag & drop files here, or click to select'}
                        </p>
                        <p className="text-white/50 text-sm">
                            Supports JPG, PNG, MP4, MOV (max 100MB)
                        </p>
                    </div>

                    {files.length > 0 && (
                        <div className="mt-8 space-y-4">
                            <h2 className="text-xl font-semibold text-white mb-4">Selected File</h2>
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-deep-blue/30 p-4 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <IconWrapper>{(FaCheck as any)({ className: "text-aqua-glow" })}</IconWrapper>
                                        <span className="text-white">{file.name}</span>
                                    </div>
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="text-white/50 hover:text-red-400 transition-colors"
                                    >
                                        <IconWrapper>{(FaXmark as any)()}</IconWrapper>
                                    </button>
                                </div>
                            ))}

                            <div className="space-y-4 pt-4">
                                <div>
                                    <label htmlFor="description" className="block text-white text-lg font-semibold mb-2">Description (Optional)</label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="input-field h-24 resize-y"
                                        placeholder="Add a description for your sighting..."
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="latitude" className="block text-white text-lg font-semibold mb-2">Latitude (Optional)</label>
                                        <input
                                            id="latitude"
                                            type="text"
                                            value={latitude}
                                            onChange={(e) => setLatitude(e.target.value)}
                                            className="input-field"
                                            placeholder="e.g., 34.0522"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="longitude" className="block text-white text-lg font-semibold mb-2">Longitude (Optional)</label>
                                        <input
                                            id="longitude"
                                            type="text"
                                            value={longitude}
                                            onChange={(e) => setLongitude(e.target.value)}
                                            className="input-field"
                                            placeholder="e.g., -118.2437"
                                        />
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                onClick={handleDetectLocation}
                                disabled={isDetectingLocation}
                                className="btn-secondary w-full flex items-center justify-center gap-2 mt-4"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isDetectingLocation ? (
                                    <>
                                        <IconWrapper>{(FaSpinner as any)({ className: "animate-spin" })}</IconWrapper>
                                        Detecting Location...
                                    </>
                                ) : (
                                    <>
                                        <IconWrapper>{(FaCompass as any)()}</IconWrapper>
                                        Detect My Location
                                    </>
                                )}
                            </motion.button>

                            <motion.button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
                            >
                                {uploading ? (
                                    <>
                                        <IconWrapper>{(FaSpinner as any)({ className: "animate-spin" })}</IconWrapper>
                                        Uploading... {uploadProgress.total}%
                                    </>
                                ) : (
                                    <>
                                        <IconWrapper>{(FaUpload as any)()}</IconWrapper>
                                        Upload {files.length} {files.length === 1 ? 'File' : 'Files'}
                                    </>
                                )}
                            </motion.button>
                        </div>
                    )}
                </GlassCard>
            </motion.div>
        </div>
    );
};

export default UploadPage;