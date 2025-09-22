"use client"
import React, { useEffect, useState } from 'react';
import { CheckCircle, Mail, ArrowRight, Home, User, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VerifiedSuccess() {
  const [status, setStatus] = useState('loading');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Simulate URL params for demo (in real app, use router.query)
    const urlParams = new URLSearchParams(window.location.search);
    const urlStatus = urlParams.get('status');
    const email = urlParams.get('email');
    const name = urlParams.get('name');
    const message = urlParams.get('message');
    
    setStatus(urlStatus || 'success');
    setUserEmail(email || 'user@example.com');
    setUserName(name || 'John');
    setErrorMessage(message || '');
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleContinue = () => {
    router.push('/auth?mode=signin');
    // alert('Redirecting to login...');
  };

  const handleGoHome = () => {
    router.push('/');
    // alert('Redirecting to homepage...');
  };

  const handleResendVerification = async () => {
    if (!userEmail) {
      alert('No email address found. Please try registering again.');
      return;
    }

    if (resendCooldown > 0) {
      alert(`Please wait ${resendCooldown} seconds before trying again.`);
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Verification email sent! Please check your inbox and spam folder.');
        setResendCooldown(300); // 5 minutes cooldown
      } else {
        alert(data.error || 'Failed to send verification email.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      alert('Failed to send verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const getErrorMessage = (message: string) => {
    switch (message) {
      case 'missing_token':
        return 'No verification token was provided in the link. Please check your email and click the correct link.';
      case 'invalid_token':
        return 'The verification link is invalid, malformed, or has already been used.';
      case 'server_error':
        return 'A server error occurred during verification. Our team has been notified.';
      default:
        return 'An unexpected error occurred during email verification. Please try again.';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Processing Verification...</h2>
          <p className="text-gray-600">Please wait while we verify your email address.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
          
          <div className="absolute top-4 right-4 text-green-200 opacity-20">
            <Mail size={24} />
          </div>
          <div className="absolute bottom-4 left-4 text-emerald-200 opacity-20">
            <CheckCircle size={20} />
          </div>

          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-white animate-bounce" size={40} />
            </div>
            <div className="absolute inset-0 w-20 h-20 bg-green-400 rounded-full mx-auto opacity-25 animate-ping"></div>
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Email Verified Successfully! 🎉
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {userName ? `Congratulations ${userName}!` : 'Congratulations!'} Your email address has been verified. 
            You can now access all features of your <span className="font-semibold text-purple-600">Loveworld Foundation School</span> account.
          </p>

          {userEmail && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="text-green-600" size={16} />
                <span className="text-green-800 font-medium">{userEmail}</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <User size={18} />
              <span>Continue to Login</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={handleGoHome}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Home size={18} />
              <span>Go to Homepage</span>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Welcome to the Online Foundation School! 🎓
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'already_verified') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
          
          <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-white" size={40} />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Already Verified! ✅
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your email address is already verified. You can proceed to login to your account and start exploring!
          </p>

          {userEmail && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="text-blue-600" size={16} />
                <span className="text-blue-800 font-medium">{userEmail}</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleContinue}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <User size={18} />
              <span>Go to Login</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={handleGoHome}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Home size={18} />
              <span>Go to Homepage</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 to-amber-500"></div>
          
          <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="text-white" size={40} />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Verification Link Expired ⏰
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your email verification link has expired for security reasons. Don&apos;t worry - we can send you a fresh verification link right away!
          </p>

          {userEmail && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-2">
                <Mail className="text-orange-600" size={16} />
                <span className="text-orange-800 font-medium">{userEmail}</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleResendVerification}
              disabled={isResending || resendCooldown > 0}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              {isResending ? (
                <>
                  <RefreshCw className="animate-spin" size={18} />
                  <span>Sending...</span>
                </>
              ) : resendCooldown > 0 ? (
                <>
                  <Clock size={18} />
                  <span>Try again in {formatTime(resendCooldown)}</span>
                </>
              ) : (
                <>
                  <Mail size={18} />
                  <span>Send New Verification Email</span>
                </>
              )}
            </button>

            <button
              onClick={handleGoHome}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Home size={18} />
              <span>Go to Homepage</span>
            </button>
          </div>

          {resendCooldown > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                <Clock className="inline w-4 h-4 mr-1" />
                Rate limited for security. Please wait before requesting another email.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-pink-500"></div>
        
        <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="text-white" size={40} />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Verification Failed ❌
        </h1>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          {getErrorMessage(errorMessage)}
        </p>

        <div className="space-y-3">
          <button
            onClick={handleResendVerification}
            disabled={isResending || !userEmail || resendCooldown > 0}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
          >
            {isResending ? (
              <>
                <RefreshCw className="animate-spin" size={18} />
                <span>Sending...</span>
              </>
            ) : resendCooldown > 0 ? (
              <>
                <Clock size={18} />
                <span>Try again in {formatTime(resendCooldown)}</span>
              </>
            ) : (
              <>
                <Mail size={18} />
                <span>Request New Verification</span>
              </>
            )}
          </button>

          <button
            onClick={handleGoHome}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <Home size={18} />
            <span>Go to Homepage</span>
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@loveworldschool.com" className="text-purple-600 hover:text-purple-700 font-medium">
              support@loveworldschool.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
