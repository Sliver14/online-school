'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Phone,
  MapPin,
  MessageCircle,
  ChevronDown,
  X,
} from 'lucide-react';
import axios, { AxiosError } from 'axios';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';
import { zones } from '../../utils/zones';
import { countries } from '../../utils/countries';
import { Toaster, toast } from 'react-hot-toast';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  lastName: string;
  firstName: string;
  phone: string;
  kingschatId: string;
  zone: string;
  country: string;
  city: string;
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
}

const Authpage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userId, userLoading, userError, refreshAuth } = useUser();
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [signupStep, setSignupStep] = useState<number>(1);
  const [showSuccessNotification, setShowSuccessNotification] = useState<boolean>(false);
  const [zoneSearch, setZoneSearch] = useState<string>('');
  const [countrySearch, setCountrySearch] = useState<string>('');
  const [showZoneDropdown, setShowZoneDropdown] = useState<boolean>(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotError, setForgotError] = useState<string>('');
  const [forgotSuccess, setForgotSuccess] = useState<boolean>(false);
  const [justSignedIn, setJustSignedIn] = useState<boolean>(false);
  const zoneRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);
  const forgotModalRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    lastName: '',
    firstName: '',
    phone: '',
    kingschatId: '',
    zone: '',
    country: '',
    city: '',
  });

  useEffect(() => {
    if (userLoading) return;
    if (userId) {
      // Only show toast if user is actively on auth page and didn't just sign in
      if (typeof window !== 'undefined' && window.location.pathname === '/auth' && !justSignedIn) {
        toast.success('Already signed in!');
      }
      router.replace('/');
    }
    if (userError) {
      toast.error(userError);
      console.log(userError);
    }
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsLogin(false);
    } else if (mode === 'signin') {
      setIsLogin(true);
    }
  }, [searchParams, userLoading, userError, router, justSignedIn]);

  useEffect(() => {
    if (showSuccessNotification) {
      const timer = setTimeout(() => setShowSuccessNotification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessNotification]);

  // Reset justSignedIn flag after a delay
  useEffect(() => {
    if (justSignedIn) {
      const timer = setTimeout(() => setJustSignedIn(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [justSignedIn]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (zoneRef.current && !zoneRef.current.contains(event.target as Node)) {
        setShowZoneDropdown(false);
      }
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
      if (
        forgotModalRef.current &&
        !forgotModalRef.current.contains(event.target as Node) &&
        showForgotPassword
      ) {
        setShowForgotPassword(false);
        setForgotEmail('');
        setForgotError('');
        setForgotSuccess(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showForgotPassword]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleZoneSelect = (zone: { value: string; label: string }) => {
    setFormData({ ...formData, zone: zone.value });
    setZoneSearch(zone.label);
    setShowZoneDropdown(false);
    if (error) setError('');
  };

  const handleCountrySelect = (country: { value: string; label: string }) => {
    setFormData({ ...formData, country: country.value });
    setCountrySearch(country.label);
    setShowCountryDropdown(false);
    if (error) setError('');
  };

  const filteredZones = zones.filter((zone) =>
    zone.label.toLowerCase().includes(zoneSearch.toLowerCase())
  );

  const filteredCountries = countries.filter((country) =>
    country.label.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const validateStep1 = (): boolean => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      toast.error('Please fill in all required fields');
      return false;
    }

    if (!isLogin) {
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.kingschatId) {
        setError('Please fill in all required fields');
        toast.error('Please fill in all required fields');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        toast.error('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        toast.error('Password must be at least 6 characters long');
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      toast.error('Please enter a valid email address');
      return false;
    }

    if (!isLogin) {
      const phoneRegex = /^(\+?\d{1,4})?0?\d{7,14}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        setError('Please enter a valid phone number');
        toast.error('Please enter a valid phone number');
        return false;
      }
    }

    return true;
  };

  const validateStep2 = (): boolean => {
    if (!formData.zone || !formData.country || !formData.city) {
      setError('Please fill in all required fields');
      toast.error('Please fill in all required fields');
      return false;
    }
    if (!zones.some((zone) => zone.value === formData.zone)) {
      setError('Please select a valid zone');
      toast.error('Please select a valid zone');
      return false;
    }
    if (!countries.some((country) => country.value === formData.country)) {
      setError('Please select a valid country');
      toast.error('Please select a valid country');
      return false;
    }
    return true;
  };

  const handleSignin = async (): Promise<void> => {
    if (!validateStep1()) return;

    setIsLoading(true);
    setError('');

    try {
      await axios.post('/api/auth/signin', {
        email: formData.email,
        password: formData.password,
      });
      
      toast.success('Signed in successfully!');
      setJustSignedIn(true);
      
      // Refresh the auth state to pick up the new token
      await refreshAuth();
      
      // Redirect to home page
      router.replace('/');
    } catch (error) {
      console.error('Sign-in error:', error);
      let errorMessage = 'Invalid email or password';
      if (error instanceof AxiosError) {
        const errorData = error.response?.data as ApiErrorResponse;
        errorMessage = errorData?.error || errorData?.message || errorMessage;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (): Promise<void> => {
    if (!validateStep2()) return;

    setIsLoading(true);
    setError('');

    try {
      await axios.post('/api/auth/signup', {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phone,
        kcUsername: formData.kingschatId,
        zone: formData.zone,
        country: formData.country,
        city: formData.city,
      });
      setShowSuccessNotification(true);
      toast.success('Check your email for verification link');
    } catch (error) {
      console.error('Sign-up error:', error);
      let errorMessage = 'Sign-up failed. Please try again.';
      if (error instanceof AxiosError) {
        const errorData = error.response?.data as ApiErrorResponse;
        errorMessage = errorData?.error || errorData?.message || errorMessage;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (): Promise<void> => {
    setForgotError('');
    setIsLoading(true);

    if (!forgotEmail) {
      setForgotError('Please enter your email address.');
      toast.error('Please enter your email address.');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      setForgotError('Please enter a valid email address.');
      toast.error('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      await axios.post('/api/auth/forgot-password', { email: forgotEmail });
      setForgotSuccess(true);
      toast.success(`A reset link has been sent to ${forgotEmail}.`);
    } catch (error) {
      console.error('Forgot Password error:', error);
      let errorMessage = 'Failed to send reset link. Please try again.';
      if (error instanceof AxiosError) {
        const errorData = error.response?.data as ApiErrorResponse;
        errorMessage = errorData?.error || errorMessage;
      }
      setForgotError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (isLogin) {
      handleSignin();
    } else {
      if (signupStep === 1) {
        if (validateStep1()) {
          setSignupStep(2);
        }
      } else {
        handleSignup();
      }
    }
  };

  const handlePrevStep = (): void => {
    setSignupStep(1);
    setError('');
  };

  const toggleAuthMode = (): void => {
    setIsLogin(!isLogin);
    setSignupStep(1);
    setError('');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      lastName: '',
      firstName: '',
      phone: '',
      kingschatId: '',
      zone: '',
      country: '',
      city: '',
    });
    setZoneSearch('');
    setCountrySearch('');
  };

  const renderStep1 = () => (
    <>
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleInputChange}
          disabled={isLoading}
          className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          required
        />
      </div>
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleInputChange}
          disabled={isLoading}
          className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          required
        />
      </div>
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleInputChange}
          disabled={isLoading}
          className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          required
        />
      </div>
      <div className="relative">
        <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          name="kingschatId"
          placeholder="Kingschat ID"
          value={formData.kingschatId}
          onChange={handleInputChange}
          disabled={isLoading}
          className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          required
        />
      </div>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleInputChange}
          disabled={isLoading}
          className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          required
        />
      </div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          disabled={isLoading}
          className="w-full pl-10 pr-12 py-3 bg-white/80 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={isLoading}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          disabled={isLoading}
          className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          required
        />
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="relative" ref={zoneRef}>
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          name="zoneSearch"
          placeholder="Search Zone"
          value={zoneSearch}
          onChange={(e) => {
            setZoneSearch(e.target.value);
            setShowZoneDropdown(true);
          }}
          onFocus={() => setShowZoneDropdown(true)}
          disabled={isLoading}
          className="w-full pl-10 pr-12 py-3 bg-white/80 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          required
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        {showZoneDropdown && filteredZones.length > 0 && (
          <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {filteredZones.map((zone) => (
              <li
                key={zone.value}
                onClick={() => handleZoneSelect(zone)}
                className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer transition-all duration-200"
              >
                {zone.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="relative" ref={countryRef}>
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          name="countrySearch"
          placeholder="Search Country"
          value={countrySearch}
          onChange={(e) => {
            setCountrySearch(e.target.value);
            setShowCountryDropdown(true);
          }}
          onFocus={() => setShowCountryDropdown(true)}
          disabled={isLoading}
          className="w-full pl-10 pr-12 py-3 bg-white/80 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          required
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        {showCountryDropdown && filteredCountries.length > 0 && (
          <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {filteredCountries.map((country) => (
              <li
                key={country.value}
                onClick={() => handleCountrySelect(country)}
                className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer transition-all duration-200"
              >
                {country.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          name="city"
          placeholder="Enter City"
          value={formData.city}
          onChange={handleInputChange}
          disabled={isLoading}
          className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          required
        />
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-gray-100 relative overflow-hidden">
      <Toaster position="top-right" />
      {/* Background Decorations */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-10 w-16 h-16 rounded-full bg-blue-200/30 opacity-50 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-blue-300/30 opacity-50 animate-pulse delay-100"></div>
        <div className="absolute top-1/3 left-1/4 w-20 h-20 rounded-full bg-gray-200/20 border-2 border-blue-300/50 opacity-30 animate-pulse delay-200"></div>
      </div>

      {/* Back to Home Button */}
      <button
        type="button"
        onClick={() => router.push('/welcome')}
        className="fixed top-4 left-4 z-50 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300"
        aria-label="Back to Home"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in">
          <div
            ref={forgotModalRef}
            className="bg-white/95 backdrop-blur-md rounded-2xl p-8 w-full max-w-md border border-gray-200 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotEmail('');
                setForgotError('');
                setForgotSuccess(false);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Reset Your Password</h2>
            {forgotSuccess ? (
              <div className="p-4 bg-green-100/80 border border-green-500 rounded-xl flex items-center gap-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-600 text-sm">A reset link has been sent to {forgotEmail}.</p>
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-6 text-sm">
                  Enter your email address to receive a password reset link.
                </p>
                {forgotError && (
                  <div className="mb-6 p-4 bg-red-100/80 border border-red-500 rounded-xl flex items-center gap-3">
                    <AlertCircle size={20} className="text-red-600" />
                    <p className="text-red-600 text-sm">{forgotError}</p>
                  </div>
                )}
                <div className="relative mb-6">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotEmail('');
                      setForgotError('');
                      setForgotSuccess(false);
                    }}
                    disabled={isLoading}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl hover:bg-gray-300 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 transition-all duration-300"
                  >
                    {isLoading && <Loader2 size={20} className="animate-spin" />}
                    {isLoading ? 'Sending...' : 'Send Link'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <Image src="/logo.png" alt="LoveWorld Foundation Logo" width={800} height={800} priority />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-600 mb-2">Welcome to Loveworld</h1>
          <h2 className="text-xl md:text-2xl font-semibold text-gray-700">Foundation School</h2>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 border border-gray-200 shadow-xl">
          <div className="flex bg-gray-100/80 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={toggleAuthMode}
              disabled={isLoading}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 text-sm ${
                !isLogin ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={toggleAuthMode}
              disabled={isLoading}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 text-sm ${
                isLogin ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sign In
            </button>
          </div>

          {!isLogin && (
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    signupStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  1
                </div>
                <div
                  className={`w-16 h-1 rounded-full ${signupStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}
                ></div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    signupStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  2
                </div>
              </div>
              <p className="text-center text-gray-600 text-sm">
                {signupStep === 1 ? 'Personal Information' : 'Location Details'}
              </p>
            </div>
          )}

          {showSuccessNotification && (
            <div className="mb-4 p-3 bg-green-100/80 border border-green-500 rounded-xl flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-600 text-sm">Check your email for verification link</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100/80 border border-red-500 rounded-xl flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {isLogin ? (
              <>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full pl-10 pr-12 py-3 bg-white/80 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <label className="flex items-center text-gray-600">
                    <input type="checkbox" className="mr-2 rounded" disabled={isLoading} />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Forgot password?
                  </button>
                </div>
              </>
            ) : (
              <>{signupStep === 1 ? renderStep1() : renderStep2()}</>
            )}

            <div className="space-y-3">
              {!isLogin && signupStep === 2 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={isLoading}
                  className="w-full bg-gray-200 text-gray-800 font-medium py-3 rounded-xl hover:bg-gray-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  <ArrowLeft size={20} />
                  Back to Step 1
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm"
              >
                {isLoading && <Loader2 size={20} className="animate-spin" />}
                {isLoading ? (
                  isLogin ? (
                    'Signing In...'
                  ) : signupStep === 1 ? (
                    'Processing...'
                  ) : (
                    'Creating Account...'
                  )
                ) : isLogin ? (
                  'Sign In'
                ) : signupStep === 1 ? (
                  <>
                    Next Step <ArrowRight size={20} />
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-gray-600 text-sm mt-6">
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700">
              Privacy Policy
            </a>
          </p>
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">🌟 Online Replica of the onsite Foundation School.</p>
        </div>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <Authpage />
    </Suspense>
  );
}