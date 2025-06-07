import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import api from '../api/axios';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>; // The login function will now be async
  logout: () => void;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    // This function is for fetching the user based on an EXISTING token
    if (localStorage.getItem('authToken')) {
      try {
        const response = await api.get<User>('/users/me');
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user, token might be expired.", error);
        // If fetching fails, clear out the bad token and user
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    } else {
        // If there's no token, we're done loading.
        setIsLoading(false);
    }
  };

  // This useEffect runs only once on app startup to check for an existing session
  useEffect(() => {
    fetchUser();
  }, []);

  // ======================= THE FIX IS HERE =======================
  const login = async (newToken: string) => {
    // 1. Set the token in localStorage and in our state
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    
    // 2. Immediately fetch the user data with the new token
    try {
        const response = await api.get<User>('/users/me', {
            headers: {
                Authorization: `Bearer ${newToken}`
            }
        });
        // 3. Set the user in our state
        setUser(response.data);
    } catch (error) {
        console.error("Failed to fetch user immediately after login", error);
    }
  };
  // ================================================================

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  const value = { user, token, login, logout, isLoading, fetchUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};