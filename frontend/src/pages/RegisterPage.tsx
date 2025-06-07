import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('/users/', { username, email, password });
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any)
    {
      if (Array.isArray(err.response?.data?.detail)) {
        const errorMessages = err.response.data.detail.map((d: any) => d.msg).join(', ');
        setError(errorMessages);
      } else {
        setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <div className="p-8 bg-white rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-primary">Create an Account</h2>
            <p className="mt-2 text-sm text-gray-600">Join the community and help monitor marine life</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && <p className="text-center bg-red-100 text-error p-3 rounded-md">{error}</p>}
          {success && <p className="text-center bg-green-100 text-success p-3 rounded-md">{success}</p>}
          <div className="rounded-md shadow-sm -space-y-px">
             <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Username" />
            </div>
             <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input id="email-address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Email address" />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Password" />
            </div>
          </div>
          <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-accent hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent">
            Register
          </button>
          <p className="text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="font-medium text-secondary hover:text-primary">Sign in here</Link>
          </p>
        </form>
      </div>
    </div>
  );
};
export default RegisterPage;