'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [userLoading, setUserLoading] = useState<boolean>(true);
  const [userError, setUserError] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      setUserLoading(true);
      try {
        const response = await axios.get('/api/auth/tokenverify', { withCredentials: true });
        console.log('Token verify response:', response.data);
        const { userId, user } = response.data;
        setUserId(userId);
        setUserDetails(user);
        setUserError(null);
        console.log('loggedin userDetails:', user);
        console.log('loggedin userId:', userId);
      } catch (error: any) {
        console.error('Token verification error:', error);
        setUserId(null);
        setUserDetails(null);
        setUserError(error.response?.data?.error || 'Failed to verify token');
      } finally {
        setUserLoading(false);
      }
    };

    verifyToken();
  }, []);

  return (
    <UserContext.Provider value={{ userId, userDetails, userLoading, userError }}>
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