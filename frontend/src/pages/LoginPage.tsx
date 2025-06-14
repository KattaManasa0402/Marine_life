import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import IconWrapper from '../utils/IconWrapper';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/upload";

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading('Diving in...');
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    try {
      const response = await api.post('/users/login', formData, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
      await login(response.data.access_token);
      toast.success('Welcome to MarineWatch!', { id: loadingToast });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Login failed. Please check your credentials.', { id: loadingToast });
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
        className="glass-card w-full max-w-md p-8 relative overflow-hidden"
      >
        <div className="floating-bubble floating-bubble-small top-1/4 left-1/4 animate-[bubble-float-1]" style={{'--rand-x': '20px'} as React.CSSProperties}></div>
        <div className="floating-bubble floating-bubble-medium top-1/2 right-1/3 animate-[bubble-float-2]" style={{'--rand-x': '-30px'} as React.CSSProperties}></div>
        <div className="floating-bubble floating-bubble-large bottom-1/4 left-1/2 animate-[bubble-float-3]" style={{'--rand-x': '40px'} as React.CSSProperties}></div>
        <div className="floating-bubble floating-bubble-small top-1/10 left-3/4 animate-[bubble-float-1]" style={{'--rand-x': '10px', 'animation-delay': '1s'} as React.CSSProperties}></div>

        <div className="text-center relative z-10">
          <h2 className="text-4xl font-heading text-ocean-dark font-bold">Welcome Back!</h2>
          <p className="mt-2 text-ocean-text-light text-lg">Sign in to your MarineWatch account</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 relative z-10">
          <div>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input-field"
              placeholder="Username"
            />
          </div>
          <div>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
              placeholder="Password"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLoading ? 'Signing In...' : <><IconWrapper icon={<FaSignInAlt />} /> Sign In</>}
          </motion.button>
          <p className="text-center text-ocean-text-light text-md">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-ocean-primary hover:text-ocean-dark transition-colors">
              Register here <IconWrapper icon={<FaUserPlus className="inline-block ml-1" />} />
            </Link>
          </p>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;