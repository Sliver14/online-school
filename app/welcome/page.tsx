'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowRight, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';
import { Toaster, toast } from 'react-hot-toast';

const Welcome = () => {
  const router = useRouter();
  const { userId, userLoading } = useUser();
  const [isGetStartedHovered, setIsGetStartedHovered] = useState(false);
  const [isLoginHovered, setIsLoginHovered] = useState(false);
  const [clickedButton, setClickedButton] = useState<string | null>(null);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (userLoading) return;
    if (userId) {
      router.replace('/');
    }
  }, [userId, userLoading, router]);

  const handleGetStarted = () => {
    // setClickedButton('getStarted');
    router.push('/auth?mode=signup');
  };

  const handleLogin = () => {
    // setClickedButton('login');
    router.push('/auth?mode=signin');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Image
        src="/welcome/bg welcome app.png"
        alt=""
        fill
        style={{ objectFit: 'cover' }}
        className="-z-10"
        priority
      />

      <Image
        src="/welcome/Ellipse 1 copy.png"
        alt=""
        width={150}
        height={150}
        className="absolute -right-14 -top-14 lg:-right-10 lg:-top-10"
      />

      <Image
        src="/welcome/Ellipse 1.png"
        alt=""
        width={150}
        height={150}
        className="absolute -left-4 -bottom-4 lg:-left-2 lg:-bottom-2"
      />

      <Image
        src="/welcome/gcap.png"
        alt=""
        width={70}
        height={70}
        className="absolute left-0 top-[65vh] lg:top-[60vh]"
      />

      <div className="flex flex-col relative w-full h-screen justify-center items-center gap-5">
        <Image
          src="/welcome/welcome text.png"
          alt="Welcome to"
          width={250}
          height={250}
          className="flex w-[250px] h-auto lg:w-[350px]"
        />

        <Image
          src="/welcome/Logo-shadow.png"
          alt="LoveWorld Foundation School Logo"
          width={150}
          height={150}
          className="flex w-[150px] h-auto lg:w-[300px]"
        />

        <div className="flex items-center justify-center text-center gap-5">
          <h1 className="text-white text-xl sm:text-2xl md:text-3xl">Online Classes and Exams</h1>
        </div>

        <div className="flex flex-col gap-4 mt-8 md:flex-row md:gap-8">
          <button
            onClick={handleGetStarted}
            onMouseEnter={() => setIsGetStartedHovered(true)}
            onMouseLeave={() => setIsGetStartedHovered(false)}
            aria-label="Get Started with LoveWorld Foundation School"
            className={`
              group relative overflow-hidden
              flex py-4 px-8 rounded-full bg-white text-lg sm:text-xl md:text-2xl text-center items-center justify-center font-bold text-black w-80 cursor-pointer
              transform transition-all duration-300 ease-out
              hover:scale-105 hover:shadow-2xl hover:shadow-white/25
              active:scale-95
              ${clickedButton === 'getStarted' ? 'scale-95' : ''}
              ${isGetStartedHovered ? 'bg-gray-100' : 'bg-white'}
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300 opacity-10"></div>
            <span className="relative z-10 mr-2">Create Account</span>
            <ArrowRight
              size={24}
              className={`relative z-10 transform transition-transform duration-300 ${isGetStartedHovered ? 'translate-x-2' : ''}`}
            />
          </button>

          <button
            onClick={handleLogin}
            onMouseEnter={() => setIsLoginHovered(true)}
            onMouseLeave={() => setIsLoginHovered(false)}
            aria-label="Sign In to LoveWorld Foundation School"
            className={`
              group relative overflow-hidden
              flex py-4 px-8 rounded-full bg-yellow-400 text-lg sm:text-xl md:text-2xl text-center items-center justify-center font-bold text-indigo-950 w-80 cursor-pointer
              transform transition-all duration-300 ease-out
              hover:scale-105 hover:shadow-2xl hover:shadow-yellow-400/25
              active:scale-95
              ${clickedButton === 'login' ? 'scale-95' : ''}
              ${isLoginHovered ? 'bg-yellow-300' : 'bg-yellow-400'}
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300 opacity-20"></div>
            <LogIn
              size={24}
              className={`relative z-10 mr-2 transform transition-transform duration-300 ${isLoginHovered ? 'rotate-12' : ''}`}
            />
            <span className="relative z-10">Signin</span>
          </button>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default Welcome;