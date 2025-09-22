'use client';

import React, { useState, useEffect } from 'react';

interface LoadingComponentProps {
    isVisible?: boolean;
    onComplete?: () => void;
    duration?: number; // in milliseconds
}
const loadingTexts = [
    'Loading...',
    'Preparing your experience...',
    'Almost ready...',
    'Welcome to Love World!'
];

const LoveWorldLoading: React.FC<LoadingComponentProps> = ({
                                                               isVisible = true,
                                                               onComplete,
                                                               duration = 5000
                                                           }) => {
    const [textIndex, setTextIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isVisible) return;

        // Progress animation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    if (onComplete) {
                        setTimeout(onComplete, 500);
                    }
                    return 100;
                }
                return prev + (100 / (duration / 100));
            });
        }, 100);

        // Text rotation
        const textInterval = setInterval(() => {
            setTextIndex(prev => (prev + 1) % loadingTexts.length);
        }, 3000);

        return () => {
            clearInterval(progressInterval);
            clearInterval(textInterval);
        };
    }, [isVisible, duration, onComplete]);

    if (!isVisible) return null;

    return (
        <div className="loading-overlay">
            <div className="loading-container">
                <div className="logo-container">
                    <div className="glowing-ring"></div>
                    <div className="love-world-text">LOVE WORLD</div>
                    <div className="logo">
                        <div className="outer-circle">
                            <div className="inner-circle">
                                <div className="heart"></div>
                            </div>
                        </div>
                    </div>
                    <div className="school-text">FOUNDATION SCHOOL</div>
                </div>

                <div className="loading-bar-container">
                    <div
                        className="loading-bar"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <div className="spinner"></div>

                <div className="loading-text">
                    {loadingTexts[textIndex]}
                    <span className="dots"></span>
                </div>
            </div>

            <style jsx>{`
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: black;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          font-family: 'Arial', sans-serif;
        }

        .loading-container {
          text-align: center;
          position: relative;
        }

        .logo-container {
          position: relative;
          margin-bottom: 30px;
          animation: heartbeat 2s ease-in-out infinite;
        }

        @keyframes heartbeat {
          0% { transform: scale(1); }
          25% { transform: scale(1.05); }
          50% { transform: scale(1.1); }
          75% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .logo {
          width: 150px;
          height: 150px;
          position: relative;
          margin: 0 auto;
        }

        .outer-circle {
          width: 150px;
          height: 150px;
          background: linear-gradient(45deg, #FFD700, #FFA500);
          border-radius: 50%;
          position: relative;
          box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);
          animation: rotate 3s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .inner-circle {
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, #1e3c72, #2a5298);
          border-radius: 50%;
          position: absolute;
          top: 15px;
          left: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .heart {
          width: 60px;
          height: 60px;
          background: linear-gradient(45deg, #FFD700, #FFA500);
          position: relative;
          transform: rotate(-45deg);
          animation: pulse 1.5s ease-in-out infinite;
        }

        .heart:before,
        .heart:after {
          content: '';
          width: 60px;
          height: 60px;
          position: absolute;
          left: 30px;
          top: 0;
          background: linear-gradient(45deg, #FFD700, #FFA500);
          border-radius: 30px 30px 0 0;
          transform: rotate(-45deg);
          transform-origin: 0 60px;
        }

        .heart:after {
          left: 0;
          transform: rotate(45deg);
          transform-origin: 60px 60px;
        }

        @keyframes pulse {
          0% { transform: rotate(-45deg) scale(0.8); }
          50% { transform: rotate(-45deg) scale(1); }
          100% { transform: rotate(-45deg) scale(0.8); }
        }

        .school-text, .love-world-text {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(45deg, #FFD700, #FFA500);
          color: #1e3c72;
          padding: 8px 20px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 12px;
          letter-spacing: 1px;
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
        }

        .love-world-text {
          top: -10px;
        }

        .school-text {
          bottom: -10px;
        }

        .loading-bar-container {
          width: 200px;
          height: 6px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          margin: 20px auto;
          overflow: hidden;
          position: relative;
        }

        .loading-bar {
          height: 100%;
          background: linear-gradient(90deg, #FFD700, #FFA500, #FFD700);
          border-radius: 3px;
          transition: width 0.3s ease;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }

        .loading-text {
          color: white;
          font-size: 18px;
          font-weight: 300;
          margin-top: 20px;
          animation: fadeInOut 2s ease-in-out infinite;
        }

        @keyframes fadeInOut {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid #FFD700;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .dots {
          animation: dots 1.5s infinite;
        }

        @keyframes dots {
          0% { opacity: 0; }
          25% { opacity: 1; }
          50% { opacity: 0; }
          75% { opacity: 1; }
          100% { opacity: 0; }
        }

        .glowing-ring {
          position: absolute;
          width: 180px;
          height: 180px;
          border: 2px solid transparent;
          border-top: 2px solid rgba(255, 215, 0, 0.6);
          border-radius: 50%;
          top: -15px;
          left: -15px;
          animation: rotateGlow 4s linear infinite;
        }

        @keyframes rotateGlow {
          0% { 
            transform: rotate(0deg); 
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); 
          }
          50% { 
            box-shadow: 0 0 40px rgba(255, 215, 0, 0.6); 
          }
          100% { 
            transform: rotate(360deg); 
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); 
          }
        }
      `}</style>
        </div>
    );
};

export default LoveWorldLoading;