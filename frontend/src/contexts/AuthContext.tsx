import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';
import { User } from '../types';

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (accessToken: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUserPoints: (newPoints: number) => void;
  updateUserBadges: (newBadges: string[]) => void;
  isLoading: boolean;
}

interface DecodedToken {
  sub: string;
  exp: number;
  id: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async (token: string) => {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      const userId = decoded.id;
      console.log("[AuthContext] Fetching user with ID:", userId);
      const response = await api.get(`/users/${userId}`);
      setUser(response.data);
      console.log("[AuthContext] Fetched user data:", response.data);
    } catch (error) {
      console.error("[AuthContext] Error fetching user data:", error);
      setUser(null);
      localStorage.removeItem('access_token');
      setToken(null);
    } finally {
      setIsLoading(false);
      console.log("[AuthContext] fetchUser completed. isLoading:", false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      const decoded: DecodedToken = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        console.log("[AuthContext] Token expired, attempting refresh or logout.");
        logout();
      } else {
        console.log("[AuthContext] Token valid, fetching user data.");
        fetchUser(token);
      }
    } else {
      setIsLoading(false);
      console.log("[AuthContext] No token found, not authenticated. isLoading:", false);
    }
  }, [token, fetchUser]);

  const login = async (accessToken: string) => {
    localStorage.setItem('access_token', accessToken);
    setToken(accessToken);
    console.log("[AuthContext] Login successful, token set.");
    await fetchUser(accessToken);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
    console.log("[AuthContext] User logged out.");
  };

  const refreshToken = async () => {
    console.warn("Refresh token functionality not implemented. Logging out.");
    logout();
  };

  const updateUserPoints = (newPoints: number) => {
    setUser(prevUser => prevUser ? { ...prevUser, points: newPoints } : null);
    console.log("[AuthContext] User points updated:", newPoints);
  };

  const updateUserBadges = (newBadges: string[]) => {
    setUser(prevUser => prevUser ? { ...prevUser, badges: newBadges } : null);
    console.log("[AuthContext] User badges updated:", newBadges);
  };

  const isAuthenticated = !!token && !!user;

  const authContextValue: AuthContextType = {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    refreshToken,
    updateUserPoints,
    updateUserBadges,
    isLoading,
  };

  console.log("[AuthContext] Render. isAuthenticated:", isAuthenticated, "user:", user ? user.username : "null", "isLoading:", isLoading);

  return (
    <AuthContext.Provider value={authContextValue}>
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