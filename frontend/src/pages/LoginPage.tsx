import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaKey, FaUser, FaLock } from 'react-icons/fa6';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import GlassCard from '../components/common/GlassCard';
import IconWrapper from '../utils/IconWrapper';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading('Signing in...');
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    try {
      const response = await api.post('/users/login', formData, { 
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' } 
      });
      await login(response.data.access_token);
      toast.success('Signed in successfully!', { id: loadingToast });
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Login failed.', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="flex justify-center items-center py-12"
    >
      <GlassCard className="p-8 w-full max-w-md relative overflow-hidden">
        <div className="bubble w-48 h-48 -top-20 -left-20"></div>
        <div className="bubble w-32 h-32 -bottom-16 -right-16"></div>
        
        <div className="text-center relative z-10">
          <IconWrapper>
            {(FaKey as any)({ className: "text-aqua-glow text-5xl mb-4" })}
          </IconWrapper>
          <h2 className="text-3xl font-display text-sea-foam">Welcome Back!</h2>
          <p className="mt-2 text-sm text-sea-foam/70">Sign in to continue your marine exploration</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6 relative z-10">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconWrapper>{(FaUser as any)({ className: "text-aqua-glow/50" })}</IconWrapper>
              </div>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input-field pl-10"
                placeholder="Username"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconWrapper>{(FaLock as any)({ className: "text-aqua-glow/50" })}</IconWrapper>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field pl-10"
                placeholder="Password"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <IconWrapper>{(FaKey as any)()}</IconWrapper>
                Sign in
              </>
            )}
          </motion.button>

          <p className="text-center text-sm text-sea-foam/70">
            Don't have an account?{' '}
            <Link to="/register" className="text-aqua-glow hover:text-sea-foam transition-colors">
              Register here
            </Link>
          </p>
        </form>
      </GlassCard>
    </motion.div>
  );
};

export default LoginPage; 