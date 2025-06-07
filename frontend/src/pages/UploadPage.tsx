import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const UploadPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [description, setDescription] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const { fetchUser } = useAuth();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }
        setIsDetectingLocation(true);
        setError('');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude.toFixed(6));
                setLongitude(position.coords.longitude.toFixed(6));
                setIsDetectingLocation(false);
            },
            () => {
                setError("Unable to retrieve your location. Please check your browser's location permissions.");
                setIsDetectingLocation(false);
            }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError('Please select an image file to upload.');
            return;
        }
        setError('');
        setSuccess('');
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        if (latitude) formData.append('latitude', latitude);
        if (longitude) formData.append('longitude', longitude);
        if (description) formData.append('description', description);
        try {
            const response = await api.post('/media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            await fetchUser();
            setSuccess('Upload successful! Redirecting...');
            setTimeout(() => {
                navigate(`/media/${response.data.id}`);
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Upload failed. Please try again.');
            setIsUploading(false);
        }
    };
    
    const FormInput = ({ id, label, ...props }: any) => (
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input id={id} {...props} className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
      </div>
    );

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-center text-primary">Upload a New Sighting</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Image File*</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>
                            <div className="flex text-sm text-gray-600"><label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-focus focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"><span>Upload a file</span><input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} required accept="image/*" /></label><p className="pl-1">or drag and drop</p></div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </div>
                    </div>
                     {file && <p className="text-sm text-green-600 mt-2 font-semibold">Selected: {file.name}</p>}
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Location (Optional)</label>
                        <button type="button" onClick={handleDetectLocation} disabled={isDetectingLocation} className="bg-info bg-opacity-40 hover:bg-opacity-60 text-primary text-xs font-bold py-1 px-3 rounded-full disabled:opacity-50 disabled:cursor-wait">
                            {isDetectingLocation ? 'Detecting...' : '📍 Detect My Location'}
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput id="latitude" label="Latitude" type="number" step="any" value={latitude} onChange={(e: any) => setLatitude(e.target.value)} placeholder="e.g., 26.3351" />
                        <FormInput id="longitude" label="Longitude" type="number" step="any" value={longitude} onChange={(e: any) => setLongitude(e.target.value)} placeholder="e.g., -80.0728" />
                    </div>
                </div>

                <div>
                   <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                    <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the sighting, location, or behavior..." className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                
                {error && <div className="p-3 text-center bg-red-100 text-error font-semibold rounded-md">{error}</div>}
                {success && <div className="p-3 text-center bg-green-100 text-success font-semibold rounded-md">{success}</div>}
                
                <button type="submit" disabled={isUploading || success !== ''} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {isUploading ? 'Uploading...' : 'Submit Sighting'}
                </button>
            </form>
        </div>
    );
};
export default UploadPage;