"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/welcome');
        }
    }, [isAuthenticated, isLoading, router]);

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, don't render children (will redirect)
    if (!isAuthenticated) {
        return null;
    }

    // If authenticated, render the protected content
    return children;
};

export default ProtectedRoute;