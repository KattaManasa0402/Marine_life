import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';
import { User } from '../types';

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string) => Promise<void>;
  logout: () => void;
  updateUserPoints: (newPoints: number) => void;
  updateUserBadges: (newBadges: string[]) => void;
}

// This interface defines the expected shape of the decoded JWT payload
interface DecodedToken {
  sub: string; // Subject (username)
  exp: number; // Expiration time
  id: number;  // User ID (which we added in the backend fix)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async (tokenToFetch: string) => {
    try {
      const decoded: DecodedToken = jwtDecode(tokenToFetch);
      // We now reliably have the user ID from the token
      const userId = decoded.id;
      const response = await api.get<User>(`/users/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      // If fetching fails, treat as a logout
      localStorage.removeItem('access_token');
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const decoded: DecodedToken = jwtDecode(token);
          // Check if token is expired
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('access_token');
            setToken(null);
            setUser(null);
          } else {
            // Token is valid, fetch user data
            await fetchUser(token);
          }
        } catch (error) {
          // If token is invalid/malformed
          localStorage.removeItem('access_token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, [token, fetchUser]);

  const login = async (accessToken: string) => {
    setIsLoading(true);
    localStorage.setItem('access_token', accessToken);
    setToken(accessToken); // This will trigger the useEffect to fetch the user
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  const updateUserPoints = (newPoints: number) => {
    setUser(prevUser => prevUser ? { ...prevUser, points: newPoints } : null);
  };

  const updateUserBadges = (newBadges: string[]) => {
    setUser(prevUser => prevUser ? { ...prevUser, badges: newBadges } : null);
  };

  const value: AuthContextType = {
    token,
    user,
    isAuthenticated: !isLoading && !!user, // isAuthenticated is only true when not loading and user exists
    isLoading,
    login,
    logout,
    updateUserPoints,
    updateUserBadges,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};