import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaUpload, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import IconWrapper from '../utils/IconWrapper';

const UploadPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size exceeds 5MB limit.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleLocationDetection = () => {
    setIsLocating(true);
    toast.loading('Detecting location...', { id: 'location-toast' });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          toast.success('Location detected!', { id: 'location-toast' });
          setIsLocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Failed to detect location.', { id: 'location-toast' });
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.', { id: 'location-toast' });
      setIsLocating(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      toast.error('Please select an image to upload.');
      return;
    }

    setIsLoading(true);
    const uploadToast = toast.loading('Uploading sighting...', { duration: 0 });
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (description) formData.append('description', description);
      if (latitude !== null) formData.append('latitude', latitude.toString());
      if (longitude !== null) formData.append('longitude', longitude.toString());

      const response = await api.post('/media/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Sighting uploaded successfully! AI analysis pending.', { id: uploadToast });
      navigate(`/media/${response.data.id}`);
    } catch (error: any) {
      console.error('Upload failed:', error.response?.data || error.message);
      toast.error(error.response?.data?.detail || 'Upload failed. Please try again.', { id: uploadToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex justify-center items-center py-12 min-h-[calc(100vh-200px)]"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="glass-card w-full max-w-2xl p-8 relative overflow-hidden"
      >
        <div className="floating-bubble floating-bubble-medium top-1/4 left-1/4 animate-[bubble-float-1]" style={{'--rand-x': '20px'} as React.CSSProperties}></div>
        <div className="floating-bubble floating-bubble-small bottom-1/2 right-1/4 animate-[bubble-float-2]" style={{'--rand-x': '-30px'} as React.CSSProperties}></div>

        <div className="text-center relative z-10">
          <h2 className="text-4xl font-heading text-ocean-dark font-bold">Share Your Sighting</h2>
          <p className="mt-2 text-ocean-text-light text-lg">Help us monitor marine life by uploading an image</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 relative z-10">
          <div>
            <label htmlFor="file-upload" className="block text-ocean-text-dark text-lg font-semibold mb-2">
              Upload Image
            </label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-ocean-medium rounded-lg cursor-pointer bg-ocean-light hover:bg-ocean-light/70 transition-colors duration-300"
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="max-h-32 object-contain rounded-md"
                    />
                    <p className="mt-2 text-sm text-ocean-text-dark">{selectedFile.name}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <IconWrapper icon={<FaUpload className="w-10 h-10 text-ocean-primary mb-3" />} />
                    <p className="mb-2 text-sm text-ocean-text-light">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-ocean-text-light">JPG, PNG, GIF (MAX. 5MB)</p>
                  </div>
                )}
                <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-ocean-text-dark text-lg font-semibold mb-2">
              Description (Optional)
            </label>
            <motion.textarea
              whileFocus={{ scale: 1.01 }}
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="input-field resize-none"
              placeholder="E.g., observed near coral reefs, unique behavior..."
            ></motion.textarea>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="latitude" className="block text-ocean-text-dark text-lg font-semibold mb-2">
                Latitude (Optional)
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                id="latitude"
                type="number"
                step="any"
                value={latitude === null ? '' : latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || null)}
                className="input-field"
                placeholder="e.g., 34.0522"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="longitude" className="block text-ocean-text-dark text-lg font-semibold mb-2">
                Longitude (Optional)
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                id="longitude"
                type="number"
                step="any"
                value={longitude === null ? '' : longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || null)}
                className="input-field"
                placeholder="e.g., -118.2437"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleLocationDetection}
            disabled={isLocating}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            {isLocating ? (
              <><IconWrapper icon={<FaSpinner className="animate-spin" />} /> Detecting Location...</>
            ) : (
              <><IconWrapper icon={<FaMapMarkerAlt />} /> Detect My Location</>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isLoading || !selectedFile}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? (
              <><IconWrapper icon={<FaSpinner className="animate-spin" />} /> Uploading...</>
            ) : (
              <><IconWrapper icon={<FaUpload />} /> Submit Sighting</>
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default UploadPage;