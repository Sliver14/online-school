'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { clearAuthToken } from '@/lib/auth-utils';

interface UserDetails {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface UserContextType {
  userId: string | null;
  userDetails: UserDetails | null;
  userLoading: boolean;
  userError: string | null;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [userLoading, setUserLoading] = useState<boolean>(true);
  const [userError, setUserError] = useState<string | null>(null);
  const router = useRouter();

  const verifyToken = useCallback(async () => {
    try {
      const response = await axios.get('/api/auth/tokenverify', { 
        withCredentials: true,
        timeout: 5000 // 5 second timeout
      });
      
      const { userId, user } = response.data;
      setUserId(userId);
      setUserDetails(user);
      setUserError(null);
    } catch (error: any) {
      console.error('Token verification failed:', error.response?.data?.error || error.message);
      setUserId(null);
      setUserDetails(null);
      setUserError(error.response?.data?.error || 'Authentication failed');
      
      // Clear invalid token
      if (error.response?.status === 401) {
        clearAuthToken();
      }
    } finally {
      setUserLoading(false);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    setUserLoading(true);
    await verifyToken();
  }, [verifyToken]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const logout = useCallback(() => {
    setUserId(null);
    setUserDetails(null);
    setUserError(null);
    clearAuthToken();
    router.push('/welcome');
  }, [router]);

  return (
    <UserContext.Provider value={{ 
      userId, 
      userDetails, 
      userLoading, 
      userError, 
      logout,
      refreshAuth 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};