"use client"
// pages/signin.tsx or app/signin/page.tsx (for App Router)
import { useState } from 'react';
import { useRouter } from 'next/navigation'; // or 'next/navigation' for App Router
import KingsChatSignin from '../components/KingsChatSignin';

interface AuthTokens {
    accessToken: string;
    expiresInMillis: number;
    refreshToken: string;
}

export default function SigninPage() {
    const router = useRouter();
    const [user, setUser] = useState<AuthTokens | null>(null);

    // Get your client ID from KingsChat Developer Site: https://developer.kingsch.at/
    const CLIENT_ID = process.env.NEXT_PUBLIC_KINGSCHAT_CLIENT_ID || '75373810-afb1-4d1f-ba1e-035cc2aaa933';

    // Define the scopes you need
    const SCOPES = ['send_chat_message']; // Add other scopes as needed

    const handleSigninSuccess = (tokens: AuthTokens) => {
        console.log('Authentication successful:', tokens);
        setUser(tokens);

        // Redirect to dashboard or home page after successful signin
        router.push('/dashboard');
    };

    const handleSigninError = (error: any) => {
        console.error('Authentication failed:', error);
        // You can show a toast notification or error message here
    };

    const handleSignout = () => {
        // Clear stored tokens
        localStorage.removeItem('kingschat_access_token');
        localStorage.removeItem('kingschat_refresh_token');
        localStorage.removeItem('kingschat_expires_at');

        setUser(null);
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px'
        }}>
            <div style={{
                maxWidth: '400px',
                width: '100%',
                padding: '30px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#fff',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
                    KingsChat Authentication
                </h1>

                {!user ? (
                    <div>
                        <p style={{ marginBottom: '20px', textAlign: 'center', color: '#666' }}>
                            Sign in with your KingsChat account to continue
                        </p>

                        <KingsChatSignin
                            clientId={CLIENT_ID}
                            scopes={SCOPES}
                            onSuccess={handleSigninSuccess}
                            onError={handleSigninError}
                        />
                    </div>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ color: 'green', marginBottom: '20px' }}>
                            ✓ Successfully signed in!
                        </p>
                        <p style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
                            Access Token: {user.accessToken.substring(0, 20)}...
                        </p>
                        <button
                            onClick={handleSignout}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}