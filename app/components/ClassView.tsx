import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Play, Pause, Volume2, VolumeX, Maximize, Lock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { colors } from '@/lib/constants';
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
  type: string;
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
  const { userId } = useUser();
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

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleError = (message: string, error?: any) => {
    console.error(message, error);
    showNotification('error', message);
  };

  const loadProgressData = async () => {
    if (!selectedClassId || !userId || !classData) {
      setProgressLoading(false);
      return;
    }

    try {
      setProgressLoading(true);

      // Fetch video progress
      const videoProgressResponse = await axios.get(`/api/user-progress/video-watched?userId=${userId}&classId=${selectedClassId}`);
      if (videoProgressResponse.data.success) {
        const videoProgress = videoProgressResponse.data.data;
        const videoWatchedStatus = videoProgress.some((progress: any) => progress.watchedAt);
        initializeProgress({
          videoWatched: { [selectedClassId]: videoWatchedStatus },
        });
      }

      // Fetch assessment progress
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
      if (!selectedClassId || !userId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/api/classes/${selectedClassId}`);
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
  }, [selectedClassId, userId]);

  useEffect(() => {
    loadProgressData();
  }, [classData, selectedClassId, userId]);

  // Check for timer expiration and auto-complete assessments
  useEffect(() => {
    if (!classData || !classData.assessments.length) return;

    const checkTimers = async () => {
      const timerResponse = await axios.get(`/api/user-progress/class-timers?userId=${userId}&classId=${selectedClassId}`);
      if (timerResponse.data.success && timerResponse.data.data.length > 0) {
        const timer = timerResponse.data.data[0];
        if (timer.timerActive && timer.timerExpiresAt) {
          const now = new Date();
          const expiresAt = new Date(timer.timerExpiresAt);
          if (now >= expiresAt) {
            // Auto-complete assessments that haven't been attempted
            for (const assessment of classData.assessments) {
              const assessmentId = assessment.id.toString();
              if (!assessmentAttempts[assessmentId] && !assessmentCompleted[assessmentId]) {
                try {
                  const response = await axios.post('/api/user-progress/submit-assessment', {
                    userId: parseInt(userId),
                    classId: parseInt(selectedClassId),
                    answers: {}, // Empty answers for 0% score
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
  }, [classData, selectedClassId, userId, assessmentAttempts, assessmentCompleted]);

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
    try {
      await handleVideoComplete(selectedClassId);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours later

      // Mark current class video as watched
      const currentResponse = await axios.post('/api/user-progress/video-watched', {
        userId: parseInt(userId),
        classId: parseInt(selectedClassId),
        videoId: selectedVideo?.id,
        watchedAt: now.toISOString(),
        timerActive: false,
      });
      if (!currentResponse.data.success) {
        throw new Error(currentResponse.data.error || 'Failed to save current video progress');
      }

      // Fetch all classes to find the next class
      const classResponse = await axios.get('/api/classes');
      if (!classResponse.data.success) {
        throw new Error(classResponse.data.error || 'Failed to fetch classes');
      }
      const classes = classResponse.data.data.sort((a: ClassData, b: ClassData) => a.id - b.id);
      const currentIndex = classes.findIndex((c: ClassData) => c.id.toString() === selectedClassId);
      const nextClass = classes[currentIndex + 1];

      if (nextClass) {
        // Set timer for the next class using class-timers endpoint
        const timerResponse = await axios.post('/api/user-progress/class-timers', {
          userId: parseInt(userId),
          classId: nextClass.id,
          timerExpiresAt: expiresAt.toISOString(),
          timerActive: true,
        });
        if (timerResponse.data.success) {
          initializeProgress({
            videoWatched: { [selectedClassId]: true },
          });
          showNotification('success', `Video completed! Next class (${nextClass.title}) is locked for 24 hours.`);
        } else {
          throw new Error(timerResponse.data.error || 'Failed to set timer for next class');
        }
      } else {
        // No next class, mark current as completed
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
    if (!videoWatched[selectedClassId]) {
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

  const handleAssessmentCompleteLocal = async (score: number, answers: string[]) => {
    try {
      const formattedAnswers: Record<string, number> = {};
      if (selectedAssessment?.questions) {
        selectedAssessment.questions.forEach((question, questionIndex) => {
          const userAnswer = answers[questionIndex];
          const optionIndex = question.options.findIndex(option => option === userAnswer);
          formattedAnswers[question.id.toString()] = optionIndex;
        });
      }

      const response = await axios.post('/api/user-progress/submit-assessment', {
        userId: parseInt(userId),
        classId: parseInt(selectedClassId),
        answers: formattedAnswers,
        score,
      });

      if (response.data.success) {
        const { score, isPassed, canRetake, attemptCount, message, correctAnswers } = response.data;
        if (isPassed) {
          await handleAssessmentComplete(selectedAssessment!.id.toString());
        }
        setAssessmentResults({
          score,
          isPassed,
          canRetake,
          attemptCount,
          message,
          answers: formattedAnswers,
          totalQuestions: selectedAssessment?.questions.length || 0,
          correctAnswers: correctAnswers || 0,
        });
        initializeProgress({
          assessmentCompleted: { [selectedAssessment!.id.toString()]: isPassed },
        });
        setAssessmentAttempts(prev => ({
          ...prev,
          [selectedAssessment!.id.toString()]: true,
        }));
      } else {
        throw new Error(response.data.error || 'Submission failed');
      }
    } catch (error) {
      handleError('There was an error submitting your assessment. Please try again.', error);
      setIsAssessmentModalOpen(false);
      setSelectedAssessment(null);
    }
  };

  const handleViewResults = async (assessment: AssessmentData) => {
    setIsLoadingResults(true);
    try {
      const response = await axios.get(`/api/user-progress/assessment-results/${assessment.id}?userId=${userId}`);
      if (response.data.success) {
        setAssessmentResults(response.data.data);
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
    if (assessmentCompleted[assessment.id.toString()]) {
      handleViewResults(assessment);
    } else {
      handleAssessmentStart(assessment);
    }
  };

  const handleResourceAccess = async (resource: ResourceData) => {
    try {
      await axios.post('/api/user/resource-access', {
        userId: parseInt(userId),
        classId: parseInt(selectedClassId),
        resourceId: resource.id,
        accessedAt: new Date(),
      });
      if (resource.resourceUrl) {
        window.open(resource.resourceUrl, '_blank');
      } else if (resource.content) {
        console.log('Display inline content:', resource.content);
      }
      showNotification('info', `Accessing ${resource.title}`);
    } catch (error) {
      handleError('Failed to access resource', error);
    }
  };

  const handleVideoSelect = (video: VideoData) => {
    setSelectedVideo(video);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  if (error) {
    return (
        <div className="text-center py-12">
          <p style={{ color: colors.textMuted }}>{error}</p>
          <button
              onClick={() => setSelectedClassId(null)}
              className="mt-4 px-4 py-2 rounded-lg"
              style={{ backgroundColor: colors.secondary, color: 'white' }}
          >
            Back to Classes
          </button>
        </div>
    );
  }

  if (loading) {
    return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: colors.accent }}></div>
          <p style={{ color: colors.textMuted }}>Loading class content...</p>
        </div>
    );
  }

  if (!classData) {
    return (
        <div className="text-center py-12">
          <p style={{ color: colors.textMuted }}>Class not found</p>
          <button
              onClick={() => setSelectedClassId(null)}
              className="mt-4 px-4 py-2 rounded-lg"
              style={{ backgroundColor: colors.secondary, color: 'white' }}
          >
            Back to Classes
          </button>
        </div>
    );
  }

  const isAssessmentLocked = !videoWatched[selectedClassId];

  return (
      <div className="space-y-6">
        {notification && (
            <div
                className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
                    notification.type === 'success' ? 'bg-green-600' : notification.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
                } text-white`}
            >
              <div className="flex items-center gap-2">
                <span>{notification.message}</span>
                <button onClick={() => setNotification(null)} className="ml-2 text-white hover:text-gray-200">
                  ×
                </button>
              </div>
            </div>
        )}

        <button
            onClick={() => setSelectedClassId(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors hover:opacity-80"
            style={{ backgroundColor: colors.secondary }}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Classes
        </button>

        <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: colors.text }}>
          <div className="w-1 h-8 rounded" style={{ backgroundColor: colors.accent }}></div>
          {classData.title}
        </h2>

        <div className="grid grid-cols-1 gap-6">
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-slate-700 overflow-hidden backdrop-blur-sm" style={{ backgroundColor: colors.tertiary }}>
              <div className="relative">
                {selectedVideo ? (
                    <>
                      <video
                          ref={videoRef}
                          className="w-full h-64 md:h-96 bg-black object-contain"
                          src={selectedVideo.videoUrl}
                          poster={selectedVideo.videoPosterUrl}
                          onTimeUpdate={handleTimeUpdate}
                          onLoadedMetadata={handleLoadedMetadata}
                          onEnded={handleVideoEnd}
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <div className="flex items-center gap-4 text-white">
                          <button
                              onClick={togglePlayPause}
                              className="p-2 hover:bg-white/20 rounded-full transition-colors"
                          >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                          </button>
                          <button
                              onClick={toggleMute}
                              className="p-2 hover:bg-white/20 rounded-full transition-colors"
                          >
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                          </button>
                          <div className="flex-1 flex items-center gap-2">
                            <span className="text-sm">{formatTime(currentTime)}</span>
                            <div
                                className="flex-1 h-2 bg-white/30 rounded-full cursor-pointer"
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const percent = (e.clientX - rect.left) / rect.width;
                                  seekTo(percent * duration);
                                }}
                            >
                              <div
                                  className="h-full rounded-full transition-all"
                                  style={{ width: `${(currentTime / duration) * 100}%`, backgroundColor: colors.accent }}
                              />
                            </div>
                            <span className="text-sm">{formatTime(duration)}</span>
                          </div>
                          <button
                              onClick={toggleFullscreen}
                              className="p-2 hover:bg-white/20 rounded-full transition-colors"
                          >
                            <Maximize className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </>
                ) : (
                    <div className="h-96 bg-black flex items-center justify-center">
                      <div className="text-center" style={{ color: colors.textMuted }}>
                        <div
                            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl mb-4 mx-auto"
                            style={{ backgroundColor: colors.accent }}
                        >
                          <Play className="w-8 h-8 ml-1" />
                        </div>
                        <p className="text-lg">No video available</p>
                      </div>
                    </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>
                  {selectedVideo?.title || classData.title}
                </h3>
                <p style={{ color: colors.textMuted }}>{classData.description}</p>
                {videoWatched[selectedClassId] && (
                    <div className="mt-3 flex items-center gap-2 text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm">Video completed</span>
                    </div>
                )}
              </div>
            </div>
          </div>

          {classData.videos && classData.videos.length > 1 && (
              <div className="lg:col-span-1">
                <div className="rounded-xl border border-slate-700 p-4 backdrop-blur-sm" style={{ backgroundColor: colors.tertiary }}>
                  <h4 className="font-semibold mb-4" style={{ color: colors.text }}>Video Playlist</h4>
                  <div className="space-y-2">
                    {classData.videos.map((video, index) => (
                        <button
                            key={video.id}
                            onClick={() => handleVideoSelect(video)}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                                selectedVideo?.id === video.id ? 'border-2' : 'border border-slate-600'
                            }`}
                            style={{
                              backgroundColor: selectedVideo?.id === video.id ? colors.primary : 'transparent',
                              borderColor: selectedVideo?.id === video.id ? colors.accent : 'rgb(71 85 105)',
                            }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded flex items-center justify-center text-white text-sm font-bold"
                                style={{ backgroundColor: colors.accent }}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate" style={{ color: colors.text }}>
                                {video.title}
                              </p>
                              <p className="text-xs" style={{ color: colors.textMuted }}>
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

        <div className="rounded-xl border border-slate-700 p-6 backdrop-blur-sm" style={{ backgroundColor: colors.tertiary }}>
          <div className="flex space-x-6 mb-6 border-b border-slate-600">
            {[
              { id: 'materials', label: 'Course Materials' },
              { id: 'assessments', label: 'Assessments' },
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveResourceTab(tab.id)}
                    className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                        activeResourceTab === tab.id ? 'text-cyan-400 border-cyan-400' : 'hover:text-white border-transparent'
                    }`}
                    style={{ color: activeResourceTab === tab.id ? colors.accent : colors.textMuted }}
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
                            className="flex items-center justify-between p-4 rounded-lg border border-slate-600"
                            style={{ backgroundColor: colors.primary }}
                        >
                          <div className="flex items-center gap-4">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: colors.accent }}
                            >
                              {resource.type === 'pdf' ? '📄' : resource.type === 'audio' ? '🎵' : resource.type === 'video' ? '🎥' : '📚'}
                            </div>
                            <div>
                              <h4 className="font-medium" style={{ color: colors.text }}>{resource.title}</h4>
                              <p className="text-sm" style={{ color: colors.textMuted }}>
                                {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)} Resource
                              </p>
                            </div>
                          </div>
                          <button
                              onClick={() => handleResourceAccess(resource)}
                              className="px-4 py-2 text-white rounded-lg transition-colors hover:opacity-80"
                              style={{ backgroundColor: colors.success }}
                          >
                            {resource.type === 'pdf' ? 'Download' : resource.type === 'audio' ? 'Listen' : 'View'}
                          </button>
                        </div>
                    ))
                ) : (
                    <p style={{ color: colors.textMuted }}>No materials available for this class.</p>
                )}
              </div>
          )}

          {activeResourceTab === 'assessments' && (
              <div className="space-y-4">
                {progressLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2" style={{ borderColor: colors.accent }}></div>
                      <p style={{ color: colors.textMuted }}>Loading assessments...</p>
                    </div>
                ) : classData.assessments && classData.assessments.length > 0 ? (
                    classData.assessments.map((assessment) => (
                        <div
                            key={assessment.id}
                            className="p-4 rounded-lg border border-slate-600"
                            style={{ backgroundColor: colors.primary }}
                        >
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium" style={{ color: colors.text }}>{assessment.title}</h4>
                            <span
                                className="px-3 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1"
                                style={{
                                  backgroundColor: isAssessmentLocked
                                      ? colors.error
                                      : assessmentCompleted[assessment.id.toString()]
                                          ? colors.success
                                          : colors.warning,
                                }}
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
                          <p className="text-sm mb-3" style={{ color: colors.textMuted }}>
                            {assessment.questions.length} questions • Must score 100% to complete
                          </p>
                          <div className="flex gap-2">
                            <button
                                className="px-4 py-2 text-white rounded-lg transition-colors hover:opacity-80"
                                style={{
                                  backgroundColor: assessmentCompleted[assessment.id.toString()] ? colors.accent : colors.success,
                                  opacity: isAssessmentLocked && !assessmentCompleted[assessment.id.toString()] ? 0.5 : 1,
                                  cursor:
                                      isAssessmentLocked && !assessmentCompleted[assessment.id.toString()]
                                          ? 'not-allowed'
                                          : 'pointer',
                                }}
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
                                        className="px-4 py-2 text-white rounded-lg transition-colors hover:opacity-80"
                                        style={{ backgroundColor: colors.secondary }}
                                        onClick={() => handleAssessmentStart(assessment)}
                                    >
                                      Retake Assessment
                                    </button>
                                )}
                          </div>
                        </div>
                    ))
                ) : (
                    <p style={{ color: colors.textMuted }}>No assessments available for this class.</p>
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
                onComplete={handleAssessmentCompleteLocal}
                assessmentResults={assessmentResults}
                onRetake={handleRetakeAssessment}
            />
        )}
      </div>
  );
};

export default ClassView;