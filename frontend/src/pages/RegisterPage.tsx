import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaUserPlus, FaSignInAlt } from 'react-icons/fa';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loadingToast = toast.loading('Creating account...');
    try {
      await api.post('/users/register', { username, email, password });
      toast.success('Account created! Please log in.', { id: loadingToast });
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Registration failed. Try again.', { id: loadingToast });
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
        <div className="floating-bubble floating-bubble-large top-1/4 right-1/4 animate-[bubble-float-3]" style={{'--rand-x': '40px'} as React.CSSProperties}></div>
        <div className="floating-bubble floating-bubble-medium top-1/2 left-1/3 animate-[bubble-float-2]" style={{'--rand-x': '-30px'} as React.CSSProperties}></div>
        <div className="floating-bubble floating-bubble-small bottom-1/4 right-1/2 animate-[bubble-float-1]" style={{'--rand-x': '10px'} as React.CSSProperties}></div>

        <div className="text-center relative z-10">
          <h2 className="text-4xl font-heading text-ocean-dark font-bold">Join the Watch!</h2>
          <p className="mt-2 text-ocean-text-light text-lg">Create your MarineWatch account</p>
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
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field"
              placeholder="Email address"
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
            {isLoading ? 'Registering...' : <><FaUserPlus /> Register</>}
          </motion.button>
          <p className="text-center text-ocean-text-light text-md">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-ocean-primary hover:text-ocean-dark transition-colors">
              Log in here <FaSignInAlt className="inline-block ml-1" />
            </Link>
          </p>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default RegisterPage;