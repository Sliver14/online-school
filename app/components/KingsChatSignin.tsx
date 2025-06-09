// components/KingsChatSignin.tsx
import React, { useState } from 'react';
import kingsChatWebSdk from 'kingschat-web-sdk';
import 'kingschat-web-sdk/dist/stylesheets/style.min.css';

interface AuthTokens {
    accessToken: string;
    expiresInMillis: number;
    refreshToken: string;
}

interface KingsChatSigninProps {
    clientId: string;
    scopes: string[];
    onSuccess?: (tokens: AuthTokens) => void;
    onError?: (error: any) => void;
    className?: string;
}

const KingsChatSignin: React.FC<KingsChatSigninProps> = ({
                                                             clientId,
                                                             scopes,
                                                             onSuccess,
                                                             onError,
                                                             className = ''
                                                         }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignin = async () => {
        if (!clientId) {
            const errorMsg = 'Client ID is required';
            setError(errorMsg);
            onError?.(new Error(errorMsg));
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const loginOptions = {
                clientId,
                scopes: scopes.join(' ') // SDK expects space-separated string
            };

            const authResponse = await kingsChatWebSdk.login(loginOptions);

            // Store tokens (you might want to use localStorage, cookies, or your state management)
            localStorage.setItem('kingschat_access_token', authResponse.accessToken);
            localStorage.setItem('kingschat_refresh_token', authResponse.refreshToken);
            localStorage.setItem('kingschat_expires_at',
                (Date.now() + authResponse.expiresInMillis).toString()
            );

            onSuccess?.(authResponse);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Authentication failed';
            setError(errorMsg);
            onError?.(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`kingschat-signin ${className}`}>
            {error && (
                <div className="error-message" style={{
                    color: 'red',
                    marginBottom: '10px',
                    padding: '8px',
                    backgroundColor: '#ffeaea',
                    border: '1px solid #ffcdd2',
                    borderRadius: '4px'
                }}>
                    {error}
                </div>
            )}

            <button
                className="kc-web-sdk-btn"
                onClick={handleSignin}
                disabled={isLoading}
                style={{
                    opacity: isLoading ? 0.6 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
            >
                {isLoading ? 'Signing in...' : 'Sign in with KingsChat'}
            </button>
        </div>
    );
};

export default KingsChatSignin;