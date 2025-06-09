"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import kingsChatWebSdk from 'kingschat-web-sdk';

// Create Auth Context
const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    // Initialize auth state on mount
    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            setIsLoading(true);

            // Check for stored token
            const storedToken = getStoredToken();
            if (storedToken) {
                // Verify token is still valid
                const isValid = await verifyToken(storedToken);
                if (isValid) {
                    setToken(storedToken);
                    setIsAuthenticated(true);
                    // Optionally fetch user data
                    await fetchUserData(storedToken);
                } else {
                    // Token is invalid, clear it
                    clearStoredToken();
                }
            }

            // Check for auth code in URL (after OAuth redirect)
            const urlParams = new URLSearchParams(window.location.search);
            const authCode = urlParams.get('code');
            const state = urlParams.get('state');

            if (authCode) {
                await handleAuthCallback(authCode, state);
            }
        } catch (error) {
            console.error('Auth initialization error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAuthCallback = async (authCode, state) => {
        try {
            // Exchange auth code for access token
            const tokenData = await exchangeCodeForToken(authCode);

            if (tokenData && tokenData.access_token) {
                const accessToken = tokenData.access_token;

                // Store token
                storeToken(accessToken, tokenData.refresh_token);
                setToken(accessToken);
                setIsAuthenticated(true);

                // Fetch user data
                await fetchUserData(accessToken);

                // Clear URL parameters and redirect to home
                window.history.replaceState({}, document.title, window.location.pathname);
                router.push('/');
            }
        } catch (error) {
            console.error('Auth callback error:', error);
            router.push('/welcome');
        }
    };

    const exchangeCodeForToken = async (authCode) => {
        try {
            // Use KingsChat SDK or direct API call to exchange code for token
            const response = await fetch('https://accounts.kingsch.at/oauth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grant_type: 'authorization_code',
                    client_id: 'com.kingschat',
                    code: authCode,
                    redirect_uri: `${window.location.origin}/welcome`,
                }),
            });

            if (response.ok) {
                return await response.json();
            } else {
                throw new Error('Token exchange failed');
            }
        } catch (error) {
            console.error('Token exchange error:', error);
            throw error;
        }
    };

    const fetchUserData = async (accessToken) => {
        try {
            // Initialize KingsChat SDK with token
            kingsChatWebSdk.init({
                apiKey: accessToken,
                // Add other SDK configuration as needed
            });

            // Fetch user profile using SDK
            const userProfile = await kingsChatWebSdk.user.getProfile();
            setUser(userProfile);
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };

    const verifyToken = async (token) => {
        try {
            // Verify token with KingsChat API
            const response = await fetch('https://api.kingsch.at/v1/user/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            return response.ok;
        } catch (error) {
            console.error('Token verification error:', error);
            return false;
        }
    };

    const login = async () => {
        try {
            const clientId = 'com.kingschat';
            const scopes = encodeURIComponent('["kingschat"]');
            const redirectUri = encodeURIComponent(`${window.location.origin}/welcome`);
            const state = generateRandomState();

            // Store state for validation
            sessionStorage.setItem('oauth_state', state);

            const authUrl = `https://accounts.kingsch.at/?client_id=${clientId}&scopes=${scopes}&redirect_uri=${redirectUri}&state=${state}&response_type=code`;

            window.location.href = authUrl;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Clear stored tokens
            clearStoredToken();

            // Reset state
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);

            // Redirect to welcome page
            router.push('/welcome');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const refreshToken = async () => {
        try {
            const storedRefreshToken = localStorage.getItem('kingschat_refresh_token');
            if (!storedRefreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await fetch('https://accounts.kingsch.at/oauth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grant_type: 'refresh_token',
                    client_id: 'com.kingschat',
                    refresh_token: storedRefreshToken,
                }),
            });

            if (response.ok) {
                const tokenData = await response.json();
                storeToken(tokenData.access_token, tokenData.refresh_token);
                setToken(tokenData.access_token);
                return tokenData.access_token;
            } else {
                throw new Error('Token refresh failed');
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            await logout();
            throw error;
        }
    };

    // Token storage utilities
    const storeToken = (accessToken, refreshToken) => {
        localStorage.setItem('kingschat_access_token', accessToken);
        if (refreshToken) {
            localStorage.setItem('kingschat_refresh_token', refreshToken);
        }
        localStorage.setItem('kingschat_token_timestamp', Date.now().toString());
    };

    const getStoredToken = () => {
        return localStorage.getItem('kingschat_access_token');
    };

    const clearStoredToken = () => {
        localStorage.removeItem('kingschat_access_token');
        localStorage.removeItem('kingschat_refresh_token');
        localStorage.removeItem('kingschat_token_timestamp');
    };

    const generateRandomState = () => {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    };

    const value = {
        user,
        token,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshToken,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;