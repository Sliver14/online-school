// import React, { useState, useRef, useEffect } from 'react';
// import {
//     Play,
//     Pause,
//     Volume2,
//     VolumeX,
//     Maximize,
//     Settings,
//     SkipBack,
//     SkipForward,
//     CheckCircle,
//     Loader
// } from 'lucide-react';
//
// const VideoPlayer = ({
//                          videoUrl,
//                          poster,
//                          title = "Video Lesson",
//                          onVideoEnd,
//                          isCompleted = false,
//                          className = ""
//                      }) => {
//     const videoRef = useRef(null);
//     const progressRef = useRef(null);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [currentTime, setCurrentTime] = useState(0);
//     const [duration, setDuration] = useState(0);
//     const [volume, setVolume] = useState(1);
//     const [isMuted, setIsMuted] = useState(false);
//     const [isFullscreen, setIsFullscreen] = useState(false);
//     const [showControls, setShowControls] = useState(true);
//     const [isLoading, setIsLoading] = useState(false);
//     const [showSettings, setShowSettings] = useState(false);
//     const [playbackRate, setPlaybackRate] = useState(1);
//     const [isBuffering, setIsBuffering] = useState(false);
//
//     // Auto-hide controls after 3 seconds of inactivity
//     useEffect(() => {
//         let timeout;
//         if (isPlaying && showControls) {
//             timeout = setTimeout(() => {
//                 setShowControls(false);
//             }, 3000);
//         }
//         return () => clearTimeout(timeout);
//     }, [isPlaying, showControls]);
//
//     // Update current time
//     useEffect(() => {
//         const video = videoRef.current;
//         if (!video) return;
//
//         const updateTime = () => setCurrentTime(video.currentTime);
//         const updateDuration = () => setDuration(video.duration);
//         const handleLoadStart = () => setIsLoading(true);
//         const handleCanPlay = () => setIsLoading(false);
//         const handleWaiting = () => setIsBuffering(true);
//         const handlePlaying = () => setIsBuffering(false);
//         const handleEnded = () => {
//             setIsPlaying(false);
//             if (onVideoEnd) onVideoEnd();
//         };
//
//         video.addEventListener('timeupdate', updateTime);
//         video.addEventListener('loadedmetadata', updateDuration);
//         video.addEventListener('loadstart', handleLoadStart);
//         video.addEventListener('canplay', handleCanPlay);
//         video.addEventListener('waiting', handleWaiting);
//         video.addEventListener('playing', handlePlaying);
//         video.addEventListener('ended', handleEnded);
//
//         return () => {
//             video.removeEventListener('timeupdate', updateTime);
//             video.removeEventListener('loadedmetadata', updateDuration);
//             video.removeEventListener('loadstart', handleLoadStart);
//             video.removeEventListener('canplay', handleCanPlay);
//             video.removeEventListener('waiting', handleWaiting);
//             video.removeEventListener('playing', handlePlaying);
//             video.removeEventListener('ended', handleEnded);
//         };
//     }, [onVideoEnd]);
//
//     const togglePlay = () => {
//         const video = videoRef.current;
//         if (video.paused) {
//             video.play();
//             setIsPlaying(true);
//         } else {
//             video.pause();
//             setIsPlaying(false);
//         }
//     };
//
//     const handleProgressClick = (e) => {
//         const video = videoRef.current;
//         const rect = progressRef.current.getBoundingClientRect();
//         const clickX = e.clientX - rect.left;
//         const newTime = (clickX / rect.width) * duration;
//         video.currentTime = newTime;
//     };
//
//     const handleVolumeChange = (e) => {
//         const newVolume = parseFloat(e.target.value);
//         setVolume(newVolume);
//         videoRef.current.volume = newVolume;
//         setIsMuted(newVolume === 0);
//     };
//
//     const toggleMute = () => {
//         const video = videoRef.current;
//         if (isMuted) {
//             video.volume = volume;
//             setIsMuted(false);
//         } else {
//             video.volume = 0;
//             setIsMuted(true);
//         }
//     };
//
//     const skipTime = (seconds) => {
//         const video = videoRef.current;
//         video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
//     };
//
//     const toggleFullscreen = () => {
//         const videoContainer = videoRef.current.parentElement;
//         if (!document.fullscreenElement) {
//             videoContainer.requestFullscreen?.() ||
//             videoContainer.webkitRequestFullscreen?.() ||
//             videoContainer.msRequestFullscreen?.();
//             setIsFullscreen(true);
//         } else {
//             document.exitFullscreen?.() ||
//             document.webkitExitFullscreen?.() ||
//             document.msExitFullscreen?.();
//             setIsFullscreen(false);
//         }
//     };
//
//     const changePlaybackRate = (rate) => {
//         videoRef.current.playbackRate = rate;
//         setPlaybackRate(rate);
//         setShowSettings(false);
//     };
//
//     const formatTime = (time) => {
//         const minutes = Math.floor(time / 60);
//         const seconds = Math.floor(time % 60);
//         return `${minutes}:${seconds.toString().padStart(2, '0')}`;
//     };
//
//     const progressPercentage = duration ? (currentTime / duration) * 100 : 0;
//
//     return (
//         <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
//             <div className="p-2 pb-2 md:p-6 md:pb-4">
//                 <h3 className="hidden md:text-xl font-semibold text-gray-900 mb-4 flex items-center">
//                     <Play className="h-5 w-5 mr-2 text-indigo-600" />
//                     {title}
//                 </h3>
//             </div>
//
//             <div className="md:px-6 md:pb-6">
//                 <div
//                     className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden group cursor-pointer"
//                     onMouseEnter={() => setShowControls(true)}
//                     onMouseLeave={() => !isPlaying || setShowControls(true)}
//                     onMouseMove={() => setShowControls(true)}
//                 >
//                     <video
//                         ref={videoRef}
//                         className="w-full h-full object-cover"
//                         poster={poster}
//                         onClick={togglePlay}
//                     >
//                         <source src={videoUrl} type="video/mp4" />
//                         Your browser does not support the video tag.
//                     </video>
//
//                     {/* Loading Spinner */}
//                     {(isLoading || isBuffering) && (
//                         <div className="absolute inset-0 flex items-center justify-center bg-black opacity-50 ">
//                             <Loader className="h-12 w-12 text-white animate-spin" />
//                         </div>
//                     )}
//
//                     {/* Play Button Overlay */}
//                     {!isPlaying && !isLoading && (
//                         <div className="absolute inset-0 flex items-center justify-center">
//                             <button
//                                 onClick={togglePlay}
//                                 className="bg-black  bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 transition-all duration-200 transform hover:scale-110"
//                             >
//                                 <Play className="lg:h-12 lg:w-12 text-white ml-1" />
//                             </button>
//                         </div>
//                     )}
//
//                     {/* Custom Controls */}
//                     <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pd-2 md:p-4 transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
//                         {/* Progress Bar */}
//                         <div
//                             ref={progressRef}
//                             className="w-full h-2 bg-white bg-opacity-30 rounded-full cursor-pointer mb-4 group/progress"
//                             onClick={handleProgressClick}
//                         >
//                             <div
//                                 className="h-full bg-indigo-500 rounded-full relative transition-all duration-150"
//                                 style={{ width: `${progressPercentage}%` }}
//                             >
//                                 <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-1 h-1 md:w-4 md:h-4 bg-indigo-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity duration-150"></div>
//                             </div>
//                         </div>
//
//                         {/* Controls Row */}
//                         <div className="flex items-center justify-between text-white">
//                             <div className="flex items-center spcae-x-2 md:space-x-3">
//                                 {/* Play/Pause */}
//                                 <button
//                                     onClick={togglePlay}
//                                     className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
//                                 >
//                                     {isPlaying ? (
//                                         <Pause className="h-4 w-4 md:h-6 md:w-6" />
//                                     ) : (
//                                         <Play className="h-4 w-4 md:h-6 md:w-6" />
//                                     )}
//                                 </button>
//
//                                 {/* Skip Buttons */}
//                                 <button
//                                     onClick={() => skipTime(-10)}
//                                     className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
//                                 >
//                                     <SkipBack className="h-4 w-4 md:h-5 md:w-5" />
//                                 </button>
//                                 <button
//                                     onClick={() => skipTime(10)}
//                                     className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
//                                 >
//                                     <SkipForward className="h-4 w-4 md:h-5 md:w-5" />
//                                 </button>
//
//                                 {/* Volume */}
//                                 <div className="flex items-center space-x-2 group/volume">
//                                     <button
//                                         onClick={toggleMute}
//                                         className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
//                                     >
//                                         {isMuted || volume === 0 ? (
//                                             <VolumeX className="h-5 w-5" />
//                                         ) : (
//                                             <Volume2 className="h-5 w-5" />
//                                         )}
//                                     </button>
//                                     <input
//                                         type="range"
//                                         min="0"
//                                         max="1"
//                                         step="0.1"
//                                         value={isMuted ? 0 : volume}
//                                         onChange={handleVolumeChange}
//                                         className="w-0 group-hover/volume:w-20 transition-all duration-300 h-1 bg-white bg-opacity-30 rounded-full appearance-none cursor-pointer"
//                                         style={{
//                                             background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) 100%)`
//                                         }}
//                                     />
//                                 </div>
//
//                                 {/* Time Display */}
//                                 <span className="text-sm font-medium">
//                                   {formatTime(currentTime)} / {formatTime(duration)}
//                                 </span>
//                             </div>
//
//                             <div className="flex items-center space-x-2">
//                                 {/* Settings */}
//                                 <div className="relative">
//                                     <button
//                                         onClick={() => setShowSettings(!showSettings)}
//                                         className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
//                                     >
//                                         <Settings className="h-4 w-4 md:h-5 md:w-5" />
//                                     </button>
//                                     {showSettings && (
//                                         <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-90 rounded-lg p-3 min-w-40">
//                                             <div className="text-sm font-medium mb-2">Playback Speed</div>
//                                             <div className="space-y-1">
//                                                 {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
//                                                     <button
//                                                         key={rate}
//                                                         onClick={() => changePlaybackRate(rate)}
//                                                         className={`block w-full text-left px-3 py-1 rounded text-sm hover:bg-white hover:bg-opacity-20 transition-all duration-200 ${
//                                                             playbackRate === rate ? 'bg-indigo-600' : ''
//                                                         }`}
//                                                     >
//                                                         {rate}x {rate === 1 ? '(Normal)' : ''}
//                                                     </button>
//                                                 ))}
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//
//                                 {/* Fullscreen */}
//                                 <button
//                                     onClick={toggleFullscreen}
//                                     className="hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
//                                 >
//                                     <Maximize className="h-4 w-4 md:h-5 md:w-5" />
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//
//                 {/* Completion Status */}
//                 {isCompleted && (
//                     <div className="mt-4 flex items-center text-green-600 bg-green-50 p-3 rounded-lg">
//                         <CheckCircle className="h-5 w-5 mr-2" />
//                         <span className="font-medium">Video completed!</span>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };
//
// export default VideoPlayer;


"use client"
import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Loader2 } from 'lucide-react';

interface VideoPlayerProps {
    videoUrl: string;
    poster?: string;
    title: string;
    className?: string;
    onVideoEnd?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
                                                     videoUrl,
                                                     poster,
                                                     title,
                                                     className = "",
                                                     onVideoEnd
                                                 }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [videoEnded, setVideoEnded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        const handleDurationChange = () => setDuration(video.duration);
        const handleEnded = () => {
            setVideoEnded(true);
            setIsPlaying(false);
            onVideoEnd?.();
        };
        const handleLoadStart = () => setIsLoading(true);
        const handleCanPlay = () => setIsLoading(false);
        const handleWaiting = () => setIsLoading(true);
        const handlePlaying = () => setIsLoading(false);

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('durationchange', handleDurationChange);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('loadstart', handleLoadStart);
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('playing', handlePlaying);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('durationchange', handleDurationChange);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('loadstart', handleLoadStart);
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('playing', handlePlaying);
        };
    }, [onVideoEnd]);

    const togglePlay = () => {
        if (!videoRef.current) return;

        if (videoEnded) {
            videoRef.current.currentTime = 0;
            setVideoEnded(false);
        }

        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!videoRef.current) return;
        const newTime = parseFloat(e.target.value);
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const toggleFullscreen = () => {
        if (!videoRef.current) return;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            videoRef.current.requestFullscreen();
        }
    };

    const restartVideo = () => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = 0;
        setVideoEnded(false);
        setCurrentTime(0);
    };

    return (
        <div
            className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster={poster}
                preload="metadata"
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
            >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Loading Spinner */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black opacity-50">
                    <div className="text-center text-white">
                        <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-indigo-400" />
                        {/*<p className="text-sm text-gray-300">Loading video...</p>*/}
                    </div>
                </div>
            )}

            {/* Video Ended Overlay */}
            {videoEnded && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                    <div className="text-center text-white">
                        <div className="mb-4">
                            <RotateCcw className="h-16 w-16 mx-auto mb-4 text-green-400" />
                            <h3 className="text-xl font-semibold mb-2">Video Completed!</h3>
                            <p className="text-gray-300">Great job finishing the class.</p>
                        </div>
                        <button
                            onClick={restartVideo}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
                        >
                            Watch Again
                        </button>
                    </div>
                </div>
            )}

            {/* Play Button Overlay */}
            {!isPlaying && !videoEnded && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <button
                        onClick={togglePlay}
                        className="bg-black bg-opacity-50 text-white rounded-full p-4 hover:bg-opacity-75 transition duration-200"
                    >
                        <Play className="h-8 w-8 md:h-12 md:w-12 ml-1" />
                    </button>
                </div>
            )}

            {/* Controls */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 ${
                    showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
                }`}
            >
                {/* Progress Bar */}
                <div className="mb-4">
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                            background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${(currentTime / duration) * 100}%, #6b7280 ${(currentTime / duration) * 100}%, #6b7280 100%)`
                        }}
                    />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={togglePlay}
                            className="text-white hover:text-indigo-400 transition duration-200"
                        >
                            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                        </button>

                        <button
                            onClick={toggleMute}
                            className="text-white hover:text-indigo-400 transition duration-200"
                        >
                            {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                        </button>

                        <span className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <span className="hidden md:block text-white md:text-sm md:font-medium">{title}</span>
                        <button
                            onClick={toggleFullscreen}
                            className="text-white hover:text-indigo-400 transition duration-200"
                        >
                            <Maximize className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 16px;
                    width: 16px;
                    border-radius: 50%;
                    background: #4f46e5;
                    cursor: pointer;
                    border: 2px solid #ffffff;
                }

                .slider::-moz-range-thumb {
                    height: 16px;
                    width: 16px;
                    border-radius: 50%;
                    background: #4f46e5;
                    cursor: pointer;
                    border: 2px solid #ffffff;
                }
            `}</style>
        </div>
    );
};

export default VideoPlayer;