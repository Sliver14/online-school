'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Play, Pause, Volume2, VolumeX, Maximize, Lock, FileText, Upload, Link2, Video } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import AssessmentModal from './AssessmentModal';

interface ClassViewProps {
  classId: string;
  onBack: () => void;
}

interface VideoData {
  id: number;
  title: string;
  videoUrl: string;
  classNumber: number;
  videoPosterUrl?: string;
  order: number;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

interface AssessmentData {
  id: number;
  title: string;
  questions: Question[];
}

interface ResourceData {
  id: number;
  title: string;
  type: 'READ' | 'ESSAY' | 'VIDEO' | 'LINK' | 'ASSIGNMENT' | 'NOTE';
  content?: string;
  resourceUrl?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface ClassData {
  id: number;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
  posterUrl: string;
  videos: VideoData[];
  assessments: AssessmentData[];
  resources: ResourceData[];
}

const ClassView: React.FC<ClassViewProps> = ({ classId: _propClassId, onBack }) => {
  const {
    activeResourceTab,
    setActiveResourceTab,
    handleVideoComplete,
    handleAssessmentComplete,
    videoWatched,
    assessmentCompleted,
    selectedClassId,
    setSelectedClassId,
    initializeProgress,
  } = useAppContext();
  const { userId, userLoading, userError } = useUser();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentData | null>(null);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [assessmentAttempts, setAssessmentAttempts] = useState<{ [assessmentId: string]: boolean }>({});
  const [essayFile, setEssayFile] = useState<File | null>(null);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleError = (message: string, error?: any) => {
    console.error(message, error);
    showNotification('error', message);
  };

  const loadProgressData = async () => {
    if (!selectedClassId || userLoading || !userId || !classData) {
      setProgressLoading(false);
      return;
    }

    try {
      setProgressLoading(true);

      const videoProgressResponse = await axios.get(`/api/user-progress/video-watched?userId=${userId}&classId=${selectedClassId}`);
      if (videoProgressResponse.data.success) {
        const videoProgress = videoProgressResponse.data.data;
        const videoWatchedStatus = videoProgress.some((progress: any) => progress.watchedAt);
        initializeProgress({
          videoWatched: { [selectedClassId]: videoWatchedStatus },
        });
      }

      if (classData.assessments && classData.assessments.length > 0) {
        const assessmentProgress: { [assessmentId: string]: boolean } = {};
        const assessmentAttempts: { [assessmentId: string]: boolean } = {};
        const assessmentPromises = classData.assessments.map(async (assessment) => {
          try {
            const response = await axios.get(`/api/user-progress/assessment-results/${assessment.id}?userId=${userId}`);
            if (response.data.success) {
              assessmentProgress[assessment.id.toString()] = response.data.data.isPassed;
              assessmentAttempts[assessment.id.toString()] = response.data.data.attemptCount > 0;
            } else {
              assessmentProgress[assessment.id.toString()] = false;
              assessmentAttempts[assessment.id.toString()] = false;
            }
            return response.data.success ? response.data.data : null;
          } catch (error) {
            console.error(`Error fetching assessment ${assessment.id} results:`, error);
            assessmentProgress[assessment.id.toString()] = false;
            assessmentAttempts[assessment.id.toString()] = false;
            return null;
          }
        });
        await Promise.all(assessmentPromises);
        initializeProgress({
          assessmentCompleted: assessmentProgress,
        });
        setAssessmentAttempts(assessmentAttempts);
      } else {
        setAssessmentAttempts({});
      }
    } catch (error) {
      handleError('Failed to load progress data', error);
    } finally {
      setProgressLoading(false);
    }
  };

  useEffect(() => {
    const fetchClassData = async () => {
      if (!selectedClassId || userLoading || !userId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/api/classes?id=${selectedClassId}`);
        if (response.data.success) {
          const fetchedClassData = response.data.data;
          setClassData(fetchedClassData);
          if (fetchedClassData.videos && fetchedClassData.videos.length > 0) {
            setSelectedVideo(fetchedClassData.videos[0]);
          }
        } else {
          setError(response.data.error || 'Failed to fetch class data');
        }
      } catch (error) {
        handleError('Failed to load class content', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassData();
  }, [selectedClassId, userId, userLoading]);

  useEffect(() => {
    loadProgressData();
  }, [classData, selectedClassId, userId, userLoading]);

  useEffect(() => {
    if (!classData || !classData.assessments.length) return;

    const checkTimers = async () => {
      if (!userId || userLoading || !selectedClassId) {
        showNotification('error', 'User ID or Class ID missing');
        return;
      }

      const timerResponse = await axios.get(`/api/user-progress/class-timers?userId=${userId}&classId=${selectedClassId}`);
      if (timerResponse.data.success && timerResponse.data.data.length > 0) {
        const timer = timerResponse.data.data[0];
        if (timer.timerActive && timer.timerExpiresAt) {
          const now = new Date();
          const expiresAt = new Date(timer.timerExpiresAt);
          if (now >= expiresAt) {
            for (const assessment of classData.assessments) {
              const assessmentId = assessment.id.toString();
              if (!assessmentAttempts[assessmentId] && !assessmentCompleted[assessmentId]) {
                try {
                  const response = await axios.post('/api/user-progress/submit-assessment', {
                    userId,
                    classId: selectedClassId,
                    answers: {},
                    score: 0,
                    isPassed: false,
                  });
                  if (response.data.success) {
                    initializeProgress({
                      assessmentCompleted: { [assessmentId]: false },
                    });
                    setAssessmentAttempts(prev => ({ ...prev, [assessmentId]: true }));
                    showNotification('info', `Assessment ${assessment.title} auto-completed with 0% due to timer expiration.`);
                  }
                } catch (error) {
                  handleError(`Failed to auto-complete assessment ${assessment.title}`, error);
                }
              }
            }
          }
        }
      }
    };

    const interval = setInterval(checkTimers, 1000);
    return () => clearInterval(interval);
  }, [classData, selectedClassId, userId, userLoading, assessmentAttempts, assessmentCompleted]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
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

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleVideoEnd = async () => {
    setIsPlaying(false);
    if (userLoading || !userId || !selectedClassId || !selectedVideo) {
      handleError('User not authenticated or video/data missing', new Error('Authentication or data pending'));
      return;
    }
    try {
      const response = await handleVideoComplete(selectedClassId, selectedVideo.id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update video progress');
      }

      if (response.message === 'Video already completed') {
        showNotification('info', `Video "${selectedVideo.title}" is already completed!`);
        return; // Exit early to skip timer logic
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

      const classResponse = await axios.get('/api/classes');
      if (!classResponse.data.success) {
        throw new Error(classResponse.data.error || 'Failed to fetch classes');
      }
      const classes = classResponse.data.data.sort((a: ClassData, b: ClassData) => a.id - b.id);
      const currentIndex = classes.findIndex((c: ClassData) => c.id.toString() === selectedClassId);
      const nextClass = classes[currentIndex + 1];

      if (nextClass) {
        const timerResponse = await axios.post('/api/user-progress/class-timers', {
          userId,
          classId: nextClass.id,
          timerExpiresAt: expiresAt.toISOString(),
          timerActive: true,
        });
        if (timerResponse.data.success) {
          initializeProgress({
            videoWatched: { [selectedClassId]: true },
          });
          showNotification('success', `Video completed! Next class (${nextClass.title}) unlocks in 5 minutes.`);
        } else {
          throw new Error(timerResponse.data.error || 'Failed to set timer for next class');
        }
      } else {
        initializeProgress({
          videoWatched: { [selectedClassId]: true },
        });
        showNotification('success', 'Video completed! No more classes to unlock.');
      }
    } catch (error) {
      handleError('Failed to save video progress', error);
    }
  };

  const seekTo = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

const handleAssessmentStart = async (assessment: AssessmentData) => {
  console.log('Starting assessment:', assessment); // Debug
  if (userLoading || !userId) {
    handleError('User not authenticated', new Error('User authentication pending'));
    return;
  }
  if (!selectedClassId || !videoWatched[selectedClassId]) {
    showNotification('error', 'Please watch the class video before taking the assessment.');
    return;
  }
  if (!assessment || !assessment.questions || assessment.questions.length === 0) {
    handleError('Assessment has no questions available');
    return;
  }
  setSelectedAssessment(assessment);
  setAssessmentResults(null);
  setIsAssessmentModalOpen(true);
};

  const handleViewResults = async (assessment: AssessmentData) => {
    if (userLoading || !userId) {
      handleError('User not authenticated', new Error('User authentication pending'));
      return;
    }
    setIsLoadingResults(true);
    try {
      const response = await axios.get(`/api/user-progress/assessment-results/${assessment.id}?userId=${userId}`);
      if (response.data.success) {
        const resultData = response.data.data;
        console.log('API response:', response.data); // Debug
        setAssessmentResults(resultData); // Use raw response, no need to map
        setSelectedAssessment(assessment);
        setIsAssessmentModalOpen(true);
      } else {
        throw new Error(response.data.error || 'Failed to load results');
      }
    } catch (error) {
      handleError('Failed to load assessment results', error);
    } finally {
      setIsLoadingResults(false);
    }
  };

  const handleRetakeAssessment = () => {
    setAssessmentResults(null);
  };

  const handleAssessmentButtonClick = (assessment: AssessmentData) => {
    if (userLoading || !userId) {
      handleError('User not authenticated', new Error('User authentication pending'));
      return;
    }
    if (assessmentCompleted[assessment.id.toString()]) {
      handleViewResults(assessment);
    } else {
      handleAssessmentStart(assessment);
    }
  };

  const handleResourceAccess = async (resource: ResourceData) => {
    if (userLoading || !userId) {
      handleError('User not authenticated', new Error('User authentication pending'));
      return;
    }
    try {
      if (!selectedClassId) {
        throw new Error('Class ID missing');
      }
      await axios.post('/api/user-progress/resource-access', {
        userId,
        classId: selectedClassId,
        resourceId: resource.id,
        accessedAt: new Date(),
      });
      showNotification('info', `Accessing ${resource.title}`);
      if (resource.resourceUrl && ['VIDEO', 'LINK'].includes(resource.type)) {
        window.open(resource.resourceUrl, '_blank');
      }
    } catch (error) {
      handleError('Failed to access resource', error);
    }
  };

  const handleEssayUpload = async (resource: ResourceData) => {
    if (userLoading || !userId) {
      handleError('User not authenticated', new Error('User authentication pending'));
      return;
    }
    if (!essayFile) {
      showNotification('error', 'Please select a file to upload.');
      return;
    }
    try {
      if (!selectedClassId) {
        throw new Error('Class ID missing');
      }
      const formData = new FormData();
      formData.append('file', essayFile);
      formData.append('userId', userId);
      formData.append('classId', selectedClassId);
      formData.append('content', essayFile.name);

      const response = await axios.post('/api/user-progress/submit-essay', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.success) {
        showNotification('success', 'Essay submitted successfully!');
        setEssayFile(null);
      } else {
        throw new Error(response.data.error || 'Failed to submit essay');
      }
    } catch (error: any) {
      handleError(error.response?.data?.error || 'Failed to upload essay', error);
    }
  };

  const handleVideoSelect = (video: VideoData) => {
    setSelectedVideo(video);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  if (userLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-400 dark:border-primary-400 mx-auto mb-4"></div>
        <p className="text-neutral-500 dark:text-dark-text-muted desktop_paragraph tablet_paragraph mobile_paragraph">Verifying your session...</p>
      </div>
    );
  }

  if (userError || error) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 dark:text-dark-text-muted desktop_paragraph tablet_paragraph mobile_paragraph">{userError || error || 'An error occurred'}</p>
        <button
          onClick={() => {
            onBack();
            sessionStorage.removeItem('selectedClassId');
          }}
          className="mt-4 px-6 py-2 bg-secondary-500 dark:bg-secondary-600 text-white rounded-lg hover:bg-secondary-600 dark:hover:bg-secondary-700 transition-colors"
        >
          Back to Classes
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-400 dark:border-primary-400 mx-auto mb-4"></div>
        <p className="text-neutral-500 dark:text-dark-text-muted desktop_paragraph tablet_paragraph mobile_paragraph">Loading class content...</p>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 dark:text-dark-text-muted desktop_paragraph tablet_paragraph mobile_paragraph">Class not found</p>
        <button
          onClick={() => {
            onBack();
            sessionStorage.removeItem('selectedClassId');
          }}
          className="mt-4 px-6 py-2 bg-secondary-500 dark:bg-secondary-600 text-white rounded-lg hover:bg-secondary-600 dark:hover:bg-secondary-700 transition-colors"
        >
          Back to Classes
        </button>
      </div>
    );
  }

  const isAssessmentLocked = !selectedClassId || !videoWatched[selectedClassId];

  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-success-500 dark:bg-success-600'
              : notification.type === 'error'
              ? 'bg-error-500 dark:bg-error-600'
              : 'bg-info-500 dark:bg-info-600'
          } text-white`}
        >
          <div className="flex items-center justify-between">
            <span className="desktop_paragraph tablet_paragraph mobile_paragraph">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-2 hover:text-neutral-200">
              ×
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          onBack();
          sessionStorage.removeItem('selectedClassId');
        }}
        className="flex items-center gap-2 px-4 py-2 bg-secondary-500 dark:bg-secondary-600 text-white rounded-lg hover:bg-secondary-600 dark:hover:bg-secondary-700 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Classes
      </button>

      <h2 className="desktop_h2 tablet_h2 mobile_h2 flex items-center gap-2 text-neutral-950 dark:text-dark-text-primary">
        <div className="w-1 h-8 rounded bg-primary-400 dark:bg-primary-400"></div>
        {classData.title}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-neutral-200 dark:border-dark-border-primary overflow-hidden backdrop-blur-sm bg-neutral-50 dark:bg-dark-bg-tertiary">
            <div className="relative">
              {selectedVideo ? (
                <>
                  <video
                    ref={videoRef}
                    className="w-full h-auto md:h-96 bg-black object-cover"
                    src={selectedVideo.videoUrl}
                    poster={selectedVideo.videoPosterUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleVideoEnd}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    controlsList="nodownload"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-4 text-white">
                      <button
                        onClick={togglePlayPause}
                        className="p-2 hover:bg-neutral-200/20 rounded-full transition-colors"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={toggleMute}
                        className="p-2 hover:bg-neutral-200/20 rounded-full transition-colors"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-sm desktop_paragraph tablet_paragraph mobile_paragraph">{formatTime(currentTime)}</span>
                        <div
                          className="flex-1 h-2 bg-neutral-200/30 rounded-full cursor-pointer"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const percent = (e.clientX - rect.left) / rect.width;
                            seekTo(percent * duration);
                          }}
                        >
                          <div
                            className="h-full bg-primary-400 dark:bg-primary-400 rounded-full transition-all"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm desktop_paragraph tablet_paragraph mobile_paragraph">{formatTime(duration)}</span>
                      </div>
                      <button
                        onClick={toggleFullscreen}
                        className="p-2 hover:bg-neutral-200/20 rounded-full transition-colors"
                      >
                        <Maximize className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-96 bg-black flex items-center justify-center">
                  <div className="text-center text-neutral-500 dark:text-dark-text-muted">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl mb-4 mx-auto bg-primary-400 dark:bg-primary-400"
                    >
                      <Play className="w-8 h-8 ml-1" />
                    </div>
                    <p className="text-lg desktop_paragraph tablet_paragraph mobile_paragraph">No video available</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="desktop_h3 tablet_h3 mobile_h3 font-semibold mb-4 text-neutral-950 dark:text-dark-text-primary">
                {selectedVideo?.title || classData.title}
              </h3>
              <p className="text-neutral-500 dark:text-dark-text-muted desktop_paragraph tablet_paragraph mobile_paragraph">{classData.description}</p>
              {selectedClassId && videoWatched[selectedClassId] && (
                <div className="mt-3 flex items-center gap-2 text-success-500 dark:text-success-400">
                  <div className="w-2 h-2 bg-success-500 dark:bg-success-400 rounded-full"></div>
                  <span className="text-sm desktop_paragraph tablet_paragraph mobile_paragraph">Video completed</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {classData.videos && classData.videos.length > 1 && (
          <div className="lg:col-span-1">
            <div className="rounded-lg border border-neutral-200 dark:border-dark-border-primary p-4 backdrop-blur-sm bg-neutral-50 dark:bg-dark-bg-tertiary">
              <h4 className="desktop_h3 tablet_h3 mobile_h3 font-semibold mb-4 text-neutral-950 dark:text-dark-text-primary">Video Playlist</h4>
              <div className="space-y-2">
                {classData.videos.map((video, index) => (
                  <button
                    key={video.id}
                    onClick={() => handleVideoSelect(video)}
                    className={`w-full text-left p-3 rounded-lg transition-colors border ${
                      selectedVideo?.id === video.id ? 'border-primary-400 dark:border-primary-400 bg-primary-50 dark:bg-primary-900' : 'border-neutral-200 dark:border-dark-border-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-bold bg-primary-400 dark:bg-primary-400"
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-950 dark:text-dark-text-primary desktop_paragraph tablet_paragraph mobile_paragraph truncate">
                          {video.title}
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-dark-text-muted desktop_paragraph tablet_paragraph mobile_paragraph">
                          Class {video.classNumber}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-dark-border-primary p-6 backdrop-blur-sm bg-neutral-50 dark:bg-dark-bg-tertiary">
        <div className="flex space-x-6 mb-6 border-b border-neutral-200 dark:border-dark-border-secondary">
          {[
            { id: 'materials', label: 'Course Materials' },
            { id: 'assessments', label: 'Assessments' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveResourceTab(tab.id)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors desktop_paragraph tablet_paragraph mobile_paragraph ${
                activeResourceTab === tab.id ? 'text-primary-400 dark:text-primary-400 border-primary-400 dark:border-primary-400' : 'text-neutral-500 dark:text-dark-text-muted hover:text-neutral-950 dark:hover:text-dark-text-primary border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeResourceTab === 'materials' && (
          <div className="space-y-4">
            {classData.resources && classData.resources.length > 0 ? (
              classData.resources.map((resource) => (
                <div
                  key={resource.id}
                  className="p-4 rounded-lg border border-neutral-200 dark:border-dark-border-secondary bg-neutral-100 dark:bg-dark-bg-secondary"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold bg-primary-400 dark:bg-primary-400"
                      >
                        {resource.type === 'NOTE' ? <FileText className="w-6 h-6" /> :
                         resource.type === 'ASSIGNMENT' ? <FileText className="w-6 h-6" /> :
                         resource.type === 'VIDEO' ? <Video className="w-6 h-6" /> :
                         resource.type === 'LINK' ? <Link2 className="w-6 h-6" /> :
                         resource.type === 'ESSAY' ? <Upload className="w-6 h-6" /> :
                         resource.type === 'READ' ? <FileText className="w-6 h-6" /> : '📚'}
                      </div>
                      <div>
                        <h4 className="font-medium text-neutral-950 dark:text-dark-text-primary desktop_paragraph tablet_paragraph mobile_paragraph">{resource.title}</h4>
                        <p className="text-sm text-neutral-500 dark:text-dark-text-muted desktop_paragraph tablet_paragraph mobile_paragraph">
                          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1).toLowerCase()} Resource
                        </p>
                      </div>
                    </div>
                  </div>

                  {resource.type === 'NOTE' && resource.content && (
                    <div className="mt-2 p-3 bg-neutral-50 dark:bg-dark-bg-tertiary rounded-lg">
                      <p className="text-neutral-700 dark:text-dark-text-muted desktop_paragraph tablet_paragraph mobile_paragraph">{resource.content}</p>
                    </div>
                  )}

                  {resource.type === 'ASSIGNMENT' && resource.content && (
                    <div className="mt-2 p-3 bg-neutral-50 dark:bg-dark-bg-tertiary rounded-lg">
                      <p className="font-semibold text-neutral-950 dark:text-dark-text-primary desktop_paragraph tablet_paragraph mobile_paragraph">Assignment Instructions:</p>
                      <p className="text-neutral-700 dark:text-dark-text-muted desktop_paragraph tablet_paragraph mobile_paragraph">{resource.content}</p>
                    </div>
                  )}

                  {resource.type === 'READ' && (
                    <div className="mt-2">
                      {resource.content && (
                        <p className="text-neutral-700 dark:text-dark-text-muted desktop_paragraph tablet_paragraph mobile_paragraph">{resource.content}</p>
                      )}
                      {resource.resourceUrl && (
                        <button
                          onClick={() => handleResourceAccess(resource)}
                          className="mt-2 px-4 py-2 bg-success-500 dark:bg-success-600 text-white rounded-lg hover:bg-success-600 dark:hover:bg-success-700 transition-colors desktop_paragraph tablet_paragraph mobile_paragraph"
                        >
                          Read Now
                        </button>
                      )}
                    </div>
                  )}

                  {(resource.type === 'VIDEO' || resource.type === 'LINK') && resource.resourceUrl && (
                    <button
                      onClick={() => handleResourceAccess(resource)}
                      className="px-4 py-2 bg-success-500 dark:bg-success-600 text-white rounded-lg hover:bg-success-600 dark:hover:bg-success-700 transition-colors desktop_paragraph tablet_paragraph mobile_paragraph"
                    >
                      {resource.type === 'VIDEO' ? 'Watch Video' : 'Visit Link'}
                    </button>
                  )}

                  {resource.type === 'ESSAY' && (
                    <div className="mt-2 flex items-center gap-4">
                      {/* <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setEssayFile(e.target.files ? e.target.files[0] : null)}
                        className="text-neutral-700 dark:text-dark-text-muted desktop_paragraph tablet_paragraph mobile_paragraph"
                      /> */}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => setEssayFile(e.target.files ? e.target.files[0] : null)}
                        className="text-neutral-700 dark:text-dark-text-muted desktop_paragraph tablet_paragraph mobile_paragraph w-full sm:w-auto"
                      />
                      <button
                        onClick={() => handleEssayUpload(resource)}
                        disabled={!essayFile}
                        className={`px-4 py-2 text-white rounded-lg transition-colors desktop_paragraph tablet_paragraph mobile_paragraph ${
                          essayFile ? 'bg-primary-400 dark:bg-primary-400 hover:bg-primary-500' : 'bg-neutral-400 dark:bg-neutral-500 cursor-not-allowed'
                        }`}
                      >
                        Upload Essay
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-neutral-500 dark:text-dark-text-muted desktop_paragraph tablet_paragraph mobile_paragraph">No materials available for this class.</p>
            )}
          </div>
        )}

        {activeResourceTab === 'assessments' && (
          <div className="space-y-4">
            {progressLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400 dark:border-primary-400 mx-auto mb-2"></div>
                <p className="text-neutral-500 dark:text-dark-text-muted desktop_paragraph tablet_paragraph mobile_paragraph">Loading assessments...</p>
              </div>
            ) : classData.assessments && classData.assessments.length > 0 ? (
              classData.assessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="p-4 rounded-lg border border-neutral-200 dark:border-dark-border-secondary bg-neutral-100 dark:bg-dark-bg-secondary"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-neutral-950 dark:text-dark-text-primary desktop_h3 tablet_h3 mobile_h3">{assessment.title}</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1 desktop_paragraph tablet_paragraph mobile_paragraph ${
                        isAssessmentLocked
                          ? 'bg-error-500 dark:bg-error-600'
                          : assessmentCompleted[assessment.id.toString()]
                          ? 'bg-success-500 dark:bg-success-600'
                          : 'bg-warning-500 dark:bg-warning-600'
                      }`}
                    >
                      {isAssessmentLocked ? (
                        <>
                          <Lock className="w-3 h-3" />
                          Locked
                        </>
                      ) : assessmentCompleted[assessment.id.toString()] ? (
                        'Completed (100%)'
                      ) : (
                        'Available'
                      )}
                    </span>
                  </div>
                  <p className="text-sm mb-3 text-neutral-500 dark:text-dark-text-muted desktop_paragraph tablet_paragraph mobile_paragraph">
                    {assessment.questions.length} questions • Must score 100% to complete
                  </p>
                  <div className="flex gap-2">
                    <button
                      className={`px-4 py-2 text-white rounded-lg transition-colors hover:opacity-80 desktop_paragraph tablet_paragraph mobile_paragraph ${
                        assessmentCompleted[assessment.id.toString()] ? 'bg-primary-400 dark:bg-primary-400' : 'bg-success-500 dark:bg-success-600'
                      } ${isAssessmentLocked && !assessmentCompleted[assessment.id.toString()] ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleAssessmentButtonClick(assessment)}
                      disabled={isLoadingResults || (isAssessmentLocked && !assessmentCompleted[assessment.id.toString()])}
                    >
                      {isLoadingResults
                        ? 'Loading...'
                        : assessmentCompleted[assessment.id.toString()]
                        ? 'View Results'
                        : 'Take Assessment'}
                    </button>
                    {assessmentAttempts[assessment.id.toString()] &&
                      !assessmentCompleted[assessment.id.toString()] &&
                      !isAssessmentLocked && (
                        <button
                          className="px-4 py-2 bg-secondary-500 dark:bg-secondary-600 text-white rounded-lg hover:bg-secondary-600 dark:hover:bg-secondary-700 transition-colors desktop_paragraph tablet_paragraph mobile_paragraph"
                          onClick={() => handleAssessmentStart(assessment)}
                        >
                          Retake Assessment
                        </button>
                      )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-neutral-500 dark:text-dark-text-muted desktop_paragraph tablet_paragraph mobile_paragraph">No assessments available for this class.</p>
            )}
          </div>
        )}
      </div>

    {selectedAssessment && (
      <AssessmentModal
        isOpen={isAssessmentModalOpen}
        onClose={() => {
          setIsAssessmentModalOpen(false);
          setSelectedAssessment(null);
        }}
        assessment={selectedAssessment}
        onComplete={async (answers: Record<string, number>) => {
          if (selectedAssessment) {
            await handleAssessmentComplete(selectedAssessment.id.toString(), answers);
            await handleViewResults(selectedAssessment); // Refresh results
          }
        }}
        assessmentResults={assessmentResults}
        onRetake={handleRetakeAssessment}
      />
    )}
    </div>
  );
};

export default ClassView;