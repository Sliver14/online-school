"use client"
import React, { useState } from 'react';
import {User, Mail, Lock, Eye, EyeOff, Star, Users, Pencil, AlertCircle, Loader2} from 'lucide-react';
import axios, { AxiosError } from "axios";
import { useRouter } from 'next/navigation';
import Image from "next/image";

// Define interfaces for better type safety
interface FormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    lastName: string;
    firstName: string;
}

interface ApiErrorResponse {
    error?: string;
    message?: string;
}

export default function WelcomeScreen() {
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        lastName: '',
        firstName: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
        if (error) {
            setError('');
        }
    };

    const validateForm = (): boolean => {
        if (!formData.email || !formData.password) {
            setError('Please fill in all required fields');
            return false;
        }

        if (!isLogin) {
            if (!formData.firstName || !formData.lastName) {
                setError('Please fill in all required fields');
                return false;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return false;
            }
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters long');
                return false;
            }
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }

        return true;
    };

    const handleSignin = async (): Promise<void> => {
        if (!validateForm()) return;

        setIsLoading(true);
        setError('');

        try {
            await axios.post("/api/auth/signin", {
                email: formData.email,
                password: formData.password,
            });
            // router.replace("/");
            window.location.href = '/';
        } catch (error) {
            console.error('Sign-in error:', error);

            if (error instanceof AxiosError) {
                const errorData = error.response?.data as ApiErrorResponse;
                const errorMessage = errorData?.error || errorData?.message || "Sign-in failed. Please try again.";
                setError(errorMessage);
            } else if (error instanceof Error) {
                setError(error.message || "An unexpected error occurred during sign-in");
            } else {
                setError("An unknown error occurred during sign-in");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (): Promise<void> => {
        if (!validateForm()) return;

        setIsLoading(true);
        setError('');

        try {
            await axios.post("/api/auth/signup", {
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
            });

            router.push("/auth/verify");

        } catch (error) {
            console.error('Sign-up error:', error);

            if (error instanceof AxiosError) {
                const errorData = error.response?.data as ApiErrorResponse;
                const errorMessage = errorData?.error || errorData?.message || "Sign-up failed. Please try again.";

                if (errorMessage.includes("User not verified")) {
                    // Store email for verification process
                    if (typeof window !== 'undefined') {
                        localStorage.setItem("email", formData.email);
                    }
                    setError("User not verified. Redirecting to verification...");

                    try {
                        await axios.post("/api/auth/resendcode", {
                            email: formData.email,
                        });
                    } catch (resendError) {
                        console.error("Failed to resend verification code:", resendError);
                        setError("Failed to resend verification code. Please try again.");
                    }

                    // Redirect to verification page
                    router.push("/auth/verify");
                } else {
                    setError(errorMessage);
                }
            } else if (error instanceof Error) {
                console.log(error.name)
                setError("An unexpected error occurred during sign-up");
            } else {
                setError("An unknown error occurred during sign-up");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (isLogin) {
            handleSignin();
        } else {
            handleSignup();
        }
    };

    const toggleAuthMode = (): void => {
        setIsLogin(!isLogin);
        setError('');
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            lastName: '',
            firstName: '',
        });
    };

    const handleForgotPasswordClick = (): void => {
        router.push("/auth/forgotpassword");
    };

    return (
        <div className="min-h-screen flex items-center bg-cover bg-center bg-no-repeat justify-center p-4 relative overflow-hidden" style={{ backgroundImage: "url('/welcome/bg welcome app.png')"}}>

            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
            </div>

            {/* Floating icons */}
            <div className="absolute top-20 left-20 text-white/20 animate-bounce">
                <Pencil size={24} />
            </div>
            <div className="absolute top-32 right-32 text-white/20 animate-bounce animation-delay-1000">
                <Star size={20} />
            </div>
            <div className="absolute bottom-20 left-32 text-white/20 animate-bounce animation-delay-2000">
                <Users size={28} />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center border border-white/20">
                        <div className="rounded-full w-18 h-18 flex items-center justify-center">
                            <Image
                                src="/logo.png"
                                alt="LoveWorld Foundation Logo"
                                width={800}
                                height={800}
                                priority
                            />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                        Welcome to Loveworld
                    </h1>
                    <h2 className="text-2xl font-semibold text-yellow-300 mb-2">
                        Foundation School
                    </h2>
                    <p className="text-white/80 text-sm">
                        Online Class and Exams
                    </p>
                </div>

                {/* Form Container */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-xl">
                    {/* Toggle Buttons */}
                    <div className="flex bg-white/10 rounded-xl p-1 mb-6">
                        <button
                            type="button"
                            onClick={toggleAuthMode}
                            disabled={isLoading}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 ${
                                isLogin
                                    ? 'bg-white text-purple-600 shadow-md'
                                    : 'text-white hover:bg-white/10'
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={toggleAuthMode}
                            disabled={isLoading}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 ${
                                !isLogin
                                    ? 'bg-white text-purple-600 shadow-md'
                                    : 'text-white hover:bg-white/10'
                            }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
                            <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                            <p className="text-red-100 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-white/60" size={20} />
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="First Name"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        required={!isLogin}
                                    />
                                </div>

                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-white/60" size={20} />
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Last Name"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                        className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        required={!isLogin}
                                    />
                                </div>
                            </>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-white/60" size={20} />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-white/60" size={20} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-12 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                                className="absolute right-3 top-3 text-white/60 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {!isLogin && (
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-white/60" size={20} />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    required={!isLogin}
                                />
                            </div>
                        )}

                        {isLogin && (
                            <div className="flex justify-between items-center text-sm">
                                <label className="flex items-center text-white/80">
                                    <input
                                        type="checkbox"
                                        className="mr-2 rounded"
                                        disabled={isLoading}
                                    />
                                    Remember me
                                </label>
                                <button
                                    type="button"
                                    onClick={handleForgotPasswordClick}
                                    className="text-yellow-300 cursor-pointer hover:text-yellow-200 transition-colors disabled:opacity-50"
                                    disabled={isLoading}
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:from-yellow-400 disabled:hover:to-orange-500 flex items-center justify-center gap-2"
                        >
                            {isLoading && <Loader2 size={20} className="animate-spin" />}
                            {isLoading
                                ? (isLogin ? 'Signing In...' : 'Creating Account...')
                                : (isLogin ? 'Sign In' : 'Create Account')
                            }
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-white/60 text-xs mt-6">
                        By continuing, you agree to our{' '}
                        <a href="#" className="text-yellow-300 hover:text-yellow-200">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-yellow-300 hover:text-yellow-200">Privacy Policy</a>
                    </p>
                </div>

                {/* Welcome Message */}
                <div className="text-center mt-6">
                    <p className="text-white/80 text-sm">
                        🌟 Online Replica of the onsite Foundation School.
                    </p>
                </div>
            </div>
        </div>
    );
}