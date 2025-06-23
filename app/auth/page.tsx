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
  const { userId, userLoading, userError } = useUser();
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
      toast.success('Already signed in!');
      router.replace('/');
    }
    if (userError) {
      toast.error(userError);
    }
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsLogin(false);
    } else if (mode === 'signin') {
      setIsLogin(true);
    }
  }, [searchParams, userId, userLoading, userError, router]);

  useEffect(() => {
    if (showSuccessNotification) {
      const timer = setTimeout(() => setShowSuccessNotification(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessNotification]);

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
      router.replace('/');
      window.location.reload();

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

  const handleNextStep = (): void => {
    if (validateStep1()) {
      setSignupStep(2);
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
        <User className="absolute left-3 top-3 text-neutral-500" size={20} />
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleInputChange}
          disabled={isLoading}
          className="w-full bg-white/10 border border-neutral-300 rounded-xl py-3 pl-12 pr-4 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          required
        />
      </div>

      <div className="relative">
        <User className="absolute left-3 top-3 text-neutral-500" size={20} />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleInputChange}
          disabled={isLoading}
          className="w-full bg-white/10 border border-neutral-300 rounded-xl py-3 pl-12 pr-4 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          required
        />
      </div>

      <div className="relative">
        <Phone className="absolute left-3 top-3 text-neutral-500" size={20} />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleInputChange}
          disabled={isLoading}
          className="w-full bg-white/10 border border-neutral-300 rounded-xl py-3 pl-12 pr-4 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          required
        />
      </div>

      <div className="relative">
        <MessageCircle className="absolute left-3 top-3 text-neutral-500" size={20} />
        <input
          type="text"
          name="kingschatId"
          placeholder="Kingschat ID"
          value={formData.kingschatId}
          onChange={handleInputChange}
          disabled={isLoading}
          className="w-full bg-white/10 border border-neutral-300 rounded-xl py-3 pl-12 pr-4 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          required
        />
      </div>

      <div className="relative">
        <Mail className="absolute left-3 top-3 text-neutral-500" size={20} />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleInputChange}
          disabled={isLoading}
          className="w-full bg-white/10 border border-neutral-300 rounded-xl py-3 pl-12 pr-4 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          required
        />
      </div>

      <div className="relative">
        <Lock className="absolute left-3 top-3 text-neutral-500" size={20} />
        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          disabled={isLoading}
          className="w-full bg-white/10 border border-neutral-300 rounded-xl py-3 pl-12 pr-12 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={isLoading}
          className="absolute right-3 top-3 text-neutral-500 hover:text-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <div className="relative">
        <Lock className="absolute left-3 top-3 text-neutral-500" size={20} />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          disabled={isLoading}
          className="w-full bg-white/10 border border-neutral-300 rounded-xl py-3 pl-12 pr-4 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          required
        />
      </div>
    </>
  );

  const renderStep2 = () => (
    <>
      <div className="relative" ref={zoneRef}>
        <MapPin className="absolute left-3 top-3 text-neutral-500" size={20} />
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
          className="w-full bg-white/10 border border-neutral-300 rounded-xl py-3 pl-12 pr-12 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          required
        />
        <ChevronDown className="absolute right-3 top-3 text-neutral-500" size={20} />
        {showZoneDropdown && filteredZones.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {filteredZones.map((zone) => (
              <li
                key={zone.value}
                onClick={() => handleZoneSelect(zone)}
                className="px-4 py-2 text-neutral-900 hover:bg-neutral-200 cursor-pointer transition-all duration-200"
              >
                {zone.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative" ref={countryRef}>
        <MapPin className="absolute left-3 top-3 text-neutral-500" size={20} />
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
          className="w-full bg-white/10 border border-neutral-300 rounded-xl py-3 pl-12 pr-12 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          required
        />
        <ChevronDown className="absolute right-3 top-3 text-neutral-500" size={20} />
        {showCountryDropdown && filteredCountries.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-neutral-50 border border-neutral-300 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {filteredCountries.map((country) => (
              <li
                key={country.value}
                onClick={() => handleCountrySelect(country)}
                className="px-4 py-2 text-neutral-900 hover:bg-neutral-200 cursor-pointer transition-all duration-200"
              >
                {country.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative">
        <MapPin className="absolute left-3 top-3 text-neutral-500" size={20} />
        <input
          type="text"
          name="city"
          placeholder="Enter City"
          value={formData.city}
          onChange={handleInputChange}
          disabled={isLoading}
          className="w-full bg-white/10 border border-neutral-300 rounded-xl py-3 pl-12 pr-4 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          required
        />
      </div>
    </>
  );

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50 relative overflow-hidden">
      <Toaster position="top-right" />
      {/* Static Background Objects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-36 left-10 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-24 lg:h-24 rounded-full bg-secondary-400/10 opacity-80"></div>
        <div className="absolute bottom-20 right-20 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-24 lg:h-24 rounded-full bg-primary-400/10 opacity-80"></div>
        <div className="absolute top-1/2 left-1/4 w-6 h-6 sm:w-10 sm:h-10 md:w-14 md:h-14 lg:w-20 lg:h-20 rounded-full bg-neutral-200/15 opacity-15 border-2 border-neutral-900"></div>
        <div className="absolute bottom-1/4 right-1/4 w-6 h-6 sm:w-10 sm:h-10 md:w-14 md:h-14 lg:w-20 lg:h-20 rounded-full bg-secondary-400/10 opacity-80"></div>
      </div>

      {/* Back to Home Button */}
      <button
        type="button"
        onClick={() => router.push('/')}
        className="absolute p-2 md:p-4 bg-gray-200 rounded-full top-4 left-4 flex items-center gap-2 text-primary-400 hover:text-secondary-500 text-mobile_paragraph md:text-tablet_paragraph lg:text-desktop_paragraph transition-colors"
      >
        <ArrowLeft size={30} />
      </button>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            ref={forgotModalRef}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-neutral-300 shadow-xl animate-fade-in"
          >
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setForgotEmail('');
                setForgotError('');
                setForgotSuccess(false);
              }}
              className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-mobile_h1 md:text-tablet_h1 lg:text-desktop_h1 font-extrabold text-neutral-900 mb-6">
              Reset Your Password
            </h2>
            {forgotSuccess ? (
              <div className="p-4 bg-success-100/50 border border-success-600 rounded-2xl flex items-center gap-3 shadow-sm">
                <svg className="w-6 h-6 text-success-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-success-600 text-mobile_paragraph md:text-tablet_paragraph lg:text-desktop_paragraph">
                  A reset link has been sent to {forgotEmail}.
                </p>
              </div>
            ) : (
              <>
                <p className="text-neutral-600 mb-6 text-mobile_paragraph md:text-tablet_paragraph lg:text-desktop_paragraph">
                  Enter your email address to receive a password reset link.
                </p>
                {forgotError && (
                  <div className="mb-6 p-4 bg-error-100/50 border border-error-600 rounded-2xl flex items-center gap-3 shadow-sm">
                    <AlertCircle size={20} className="text-error-600 flex-shrink-0" />
                    <p className="text-error-600 text-mobile_paragraph md:text-tablet_paragraph lg:text-desktop_paragraph">{forgotError}</p>
                  </div>
                )}
                <div className="relative mb-6">
                  <Mail className="absolute left-3 top-4 text-neutral-500" size={20} />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-white/10 border border-neutral-300 rounded-2xl py-4 pl-12 pr-4 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
                    className="flex-1 bg-neutral-200 text-neutral-900 py-3 rounded-2xl hover:bg-neutral-300 disabled:opacity-50 transition-all duration-300 shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-secondary-400 to-secondary-500 text-white py-3 rounded-2xl hover:from-secondary-500 hover:to-secondary-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg"
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

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="backdrop-blur-sm rounded-full w-24 h-24 mx-auto mb-2 flex items-center justify-center">
            <div className="rounded-full w-18 h-18 flex items-center justify-center">
              <Image src="/logo.png" alt="LoveWorld Foundation Logo" width={800} height={800} priority />
            </div>
          </div>
          <h1 className="text-mobile_h1 md:text-tablet_h1 lg:text-desktop_h2 font-bold text-primary-500 mb-2 tracking-tight">
            Welcome to Loveworld
          </h1>
          <h2 className="text-mobile_h2 md:text-tablet_h2 lg:text-desktop_h3 font-semibold text-secondary-400 mb-2">
            Foundation School
          </h2>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-neutral-300 shadow-xl">
          <div className="flex bg-white/10 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={toggleAuthMode}
              disabled={isLoading}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 text-desktop_paragraph ${
                !isLogin ? 'bg-white text-primary-500 shadow-md' : 'text-neutral-500 hover:bg-neutral-200'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={toggleAuthMode}
              disabled={isLoading}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 text-desktop_paragraph ${
                isLogin ? 'bg-white text-primary-500 shadow-md' : 'text-neutral-500 hover:bg-neutral-200'
              }`}
            >
              Sign In
            </button>
          </div>

          {!isLogin && (
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-mobile_paragraph md:text-tablet_paragraph lg:text-desktop_paragraph font-medium transition-all duration-300 ${
                    signupStep >= 1 ? 'bg-secondary-400 text-primary-500' : 'bg-neutral-200 text-neutral-500'
                  }`}
                >
                  1
                </div>
                <div
                  className={`w-16 h-1 rounded-full transition-all duration-300 ${signupStep >= 2 ? 'bg-secondary-400' : 'bg-neutral-200'}`}
                ></div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-mobile_paragraph md:text-tablet_paragraph lg:text-desktop_paragraph font-medium transition-all duration-300 ${
                    signupStep >= 2 ? 'bg-secondary-400 text-primary-500' : 'bg-neutral-200 text-neutral-500'
                  }`}
                >
                  2
                </div>
              </div>
              <p className="text-center text-neutral-500 text-mobile_paragraph md:text-tablet_paragraph lg:text-desktop_paragraph">
                {signupStep === 1 ? 'Personal Information' : 'Location Details'}
              </p>
            </div>
          )}

          {showSuccessNotification && (
            <div className="mb-4 p-3 bg-success-light border border-success-500 rounded-lg flex items-center gap-2 animate-fade-in">
              <svg className="w-5 h-5 text-success-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-success-500 text-mobile_paragraph md:text-tablet_paragraph lg:text-desktop_paragraph">
                Check your email for verification link
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-error-light border border-error-500 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="text-error-500 flex-shrink-0" />
              <p className="text-error-500 text-mobile_paragraph md:text-tablet_paragraph lg:text-desktop_paragraph">{error}</p>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {isLogin ? (
              <>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-neutral-500" size={20} />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full bg-white/10 border border-neutral-300 rounded-xl py-3 pl-12 pr-4 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-neutral-500" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full bg-white/10 border border-neutral-300 rounded-xl py-3 pl-12 pr-12 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-3 text-neutral-500 hover:text-neutral-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="flex justify-between items-center text-mobile_paragraph md:text-tablet_paragraph lg:text-desktop_paragraph">
                  <label className="flex items-center text-neutral-500">
                    <input type="checkbox" className="mr-2 rounded" disabled={isLoading} />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-secondary-400 cursor-pointer hover:text-secondary-500 transition-colors disabled:opacity-50"
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
                  className="w-full bg-white/10 border border-neutral-300 text-neutral-900 font-medium py-3 px-6 rounded-xl hover:bg-neutral-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-desktop_paragraph"
                >
                  <ArrowLeft size={20} />
                  Back to Step 1
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-secondary-400 to-secondary-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-secondary-500 hover:to-secondary-600 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:from-secondary-400 disabled:hover:to-secondary-500 flex items-center justify-center gap-2 text-desktop_paragraph"
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

          <p className="text-center text-neutral-500 text-mobile_paragraph md:text-tablet_paragraph lg:text-desktop_paragraph mt-6">
            By continuing, you agree to our{' '}
            <a href="#" className="text-secondary-400 hover:text-secondary-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-secondary-400 hover:text-secondary-500">
              Privacy Policy
            </a>
          </p>
        </div>

        <div className="text-center mt-6">
          <p className="text-neutral-500 text-mobile_paragraph md:text-tablet_paragraph lg:text-desktop_paragraph">
            🌟 Online Replica of the onsite Foundation School.
          </p>
        </div>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-400"></div>
        </div>
      }
    >
      <Authpage />
    </Suspense>
  );
}