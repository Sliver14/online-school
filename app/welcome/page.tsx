"use client"
import React, {useState} from 'react'
import Image from 'next/image';
import { ArrowRight, LogIn} from 'lucide-react';
import { useRouter } from 'next/navigation';

const Welcome = () => {
  const router = useRouter();
  const [isGetStartedHovered, setIsGetStartedHovered] = useState(false);
  const [isLoginHovered, setIsLoginHovered] = useState(false);
  const [clickedButton, setClickedButton] = useState(null);

  const handleGetStarted = () => {
    // setClickedButton('getStarted');
      router.push('/auth?mode=signup');
    setTimeout(() => setClickedButton(null), 300);
  };

  // const handleLogin = () => {
  //     setClickedButton('login');
  //     router.push('/welcome');
  //     console.log('Login clicked - redirect to signup');
  //     // Simulate navigation
  //     setTimeout(() => setClickedButton(null), 300);
  // };

  // On your welcome page button click:
  const handleLogin = () => {
    router.push('/auth?mode=signin');
  };

  return (
      <div className="relative w-screen h-screen overflow-hidden">
        <Image
            src="/welcome/bg welcome app.png"
            alt="Background"
            layout="fill"
            objectFit="cover"
            className="-z-10"
        />

        <Image
            src="/welcome/Ellipse 1 copy.png"
            alt="obj1"
            width={150}
            height={150}
            className='absolute -right-14 -top-14 lg:-right-10 lg:-top-10'
        />

        <Image
            src="/welcome/Ellipse 1.png"
            alt="obj2"
            width={150}
            height={150}
            className='absolute -left-4 -bottom-4 lg:-left-2 lg:-bottom-2'
        />

        <Image
            src="/welcome/gcap.png"
            alt="obj2"
            width={70}
            height={70}
            className='absolute left-0 top-[65vh] lg:top-[60vh]'
        />


        <div className='flex flex-col relative w-full h-screen justify-center items-center gap-5'>
          <Image
              src="/welcome/welcome text.png"
              alt="Welcome to"
              width={250}
              height={250}
              // layout="fill"
              // objectFit="cover"
              className="flex w-[250px] h-auto lg:w-[350px]"
          />

          <Image
              src="/welcome/Logo-shadow.png"
              alt="Welcome to"
              width={150}
              height={150}
              // layout="fill"
              // objectFit="cover"
              className="flex w-[150px] h-auto lg:w-[300px] "
          />
          <div className='felx items-center justify-center text-center gap-5'>
            {/* <h1 className='text-yellow-400 text-2xl '>
              Loveworld
            </h1>
            <h1 className='text-white uppercase text-3xl font-bold'>
              Foundation School
            </h1> */}
            <h1 className='text-white text-3xl'>
              Online Class and Exams
            </h1>
          </div>

          {/*<div className='flex flex-col gap-3 mt-12 md:flex-row md:gap-8'>*/}
          {/*  <button onClick={() => router.push("/signin")} className='flex py-2 rounded-full bg-white text-2xl text-center items-center justify-center self-center font-bold text-black w-80 cursor-pointer'>Get Started*/}
          {/*  </button>*/}

          {/*  <button onClick={() => router.push("/signup")} className='flex py-2 rounded-full bg-yellow-400 text-2xl text-center items-center justify-center self-center font-bold text-indigo-950 w-80 cursor-pointer'>Log in*/}
          {/*  </button>*/}
          {/*</div>*/}
          {/* Interactive buttons */}
          <div className="flex flex-col gap-4 mt-8 md:flex-row md:gap-8">
            <button
                onClick={handleGetStarted}
                onMouseEnter={() => setIsGetStartedHovered(true)}
                onMouseLeave={() => setIsGetStartedHovered(false)}
                className={`
              group relative overflow-hidden
              flex py-4 px-8 rounded-full bg-white text-2xl text-center items-center justify-center font-bold text-black w-80 cursor-pointer
              transform transition-all duration-300 ease-out
              hover:scale-105 hover:shadow-2xl hover:shadow-white/25
              active:scale-95
              ${clickedButton === 'getStarted' ? 'scale-95' : ''}
              ${isGetStartedHovered ? 'bg-gray-100' : 'bg-white'}
            `}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300 opacity-10"></div>
              <span className="relative z-10 mr-2">Get Started</span>
              <ArrowRight
                  size={24}
                  className={`relative z-10 transform transition-transform duration-300 ${isGetStartedHovered ? 'translate-x-2' : ''}`}
              />
            </button>

            <button
                onClick={handleLogin}
                onMouseEnter={() => setIsLoginHovered(true)}
                onMouseLeave={() => setIsLoginHovered(false)}
                className={`
              group relative overflow-hidden
              flex py-4 px-8 rounded-full bg-yellow-400 text-2xl text-center items-center justify-center font-bold text-indigo-950 w-80 cursor-pointer
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
              <span className="relative z-10">Log in</span>
            </button>
          </div>


        </div>

      </div>
  )
}

export default Welcome



