'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useUser } from './UserContext';
import { useQueryClient } from '@tanstack/react-query';

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

interface VideoData {
  id: number;
  title: string;
  videoUrl: string;
  classNumber: number;
  videoPosterUrl?: string;
  order: number;
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
  classNumber: string;
  duration: string;
  videoUrl: string;
  posterUrl: string;
  videos: VideoData[];
  assessments: AssessmentData[];
  resources: ResourceData[];
}

interface AppContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;          // ✅ new state
  setSidebarCollapsed: (collapsed: boolean) => void; // ✅ new setter
  handleNavClick: (tab: string) => void;
  classes: ClassData[];
  setClasses: (classes: ClassData[]) => void;
  selectedClassId: string | null;
  setSelectedClassId: (classId: string | null) => void;
  activeResourceTab: string;
  setActiveResourceTab: (tab: string) => void;
  videoWatched: { [classId: string]: boolean };
  assessmentCompleted: { [assessmentId: string]: boolean };
  initializeProgress: (progress: {
    videoWatched?: { [classId: string]: boolean };
    assessmentCompleted?: { [assessmentId: string]: boolean };
  }) => void;
  handleVideoComplete: (classId: string, videoId?: number) => Promise<HandleVideoCompleteResponse>;
  handleAssessmentComplete: (assessmentId: string, answers: Record<string, number>) => Promise<any>;
  invalidateProgressCache: () => void;
}

type HandleVideoCompleteResponse = {
  success: boolean;
  error?: string;
  message?: string;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('classes');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [classes, setClassesInternal] = useState<ClassData[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false); // ✅ new state
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [activeResourceTab, setActiveResourceTab] = useState<string>('materials');
  const [videoWatched, setVideoWatched] = useState<{ [classId: string]: boolean }>({});
  const [assessmentCompleted, setAssessmentCompleted] = useState<{ [assessmentId: string]: boolean }>({});
  const { userId, userLoading, userError } = useUser();
  const queryClient = useQueryClient();

  const setClasses = useCallback((newClasses: ClassData[]) => {
    setClassesInternal((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(newClasses)) {
        console.log('Updating classes in context');
        return newClasses;
      }
      return prev;
    });
  }, []);

  const handleNavClick = useCallback((tab: string) => {
    // If we're in ClassView (selectedClassId exists), clear it first
    if (selectedClassId) {
      setSelectedClassId(null);
      sessionStorage.removeItem('selectedClassId');
      // Update URL to home page
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', '/');
      }
    }
    
    setActiveTab(tab);
    setSidebarOpen(false);
  }, [selectedClassId]);

  const initializeProgress = useCallback((progress: {
    videoWatched?: { [classId: string]: boolean };
    assessmentCompleted?: { [assessmentId: string]: boolean };
  }) => {
    if (progress.videoWatched) {
      setVideoWatched((prev) => {
        const newProgress = { ...prev, ...progress.videoWatched };
        console.log('Updating videoWatched:', newProgress);
        return newProgress;
      });
    }
    if (progress.assessmentCompleted) {
      setAssessmentCompleted((prev) => {
        const newProgress = { ...prev, ...progress.assessmentCompleted };
        console.log('Updating assessmentCompleted:', newProgress);
        return newProgress;
      });
    }
  }, []);

  const invalidateProgressCache = useCallback(() => {
    if (userId) {
      // Invalidate both classes and user progress caches
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['userProgress', userId] });
      console.log('Invalidated progress cache');
    }
  }, [queryClient, userId]);

  type HandleVideoCompleteResponse = {
    success: boolean;
    error?: string;
    message?: string;
  };

  const handleVideoComplete = useCallback(
    async (classId: string, videoId?: number): Promise<HandleVideoCompleteResponse> => {
      if (userLoading) {
        toast('ℹ️ Please wait while we verify your session');
        return { success: false, error: 'User loading' };
      }

      if (userError || !userId) {
        toast.error(userError || 'Please sign in');
        return { success: false, error: userError || 'User not authenticated' };
      }

      try {
        const response = await axios.post('/api/user-progress/video-watched', {
          userId: parseInt(userId, 10),
          classId: parseInt(classId, 10),
          videoId,
          watchedAt: new Date().toISOString(),
        });

        // Invalidate cache after video completion
        invalidateProgressCache();

        return response.data; // ✅ return API response object here
      } catch (err: any) {
        toast.error('Error saving video progress');
        return { success: false, error: err.message };
      }
    },
    [userId, userLoading, userError, invalidateProgressCache]
  );

  const handleAssessmentComplete = useCallback(
    async (assessmentId: string, answers: Record<string, number>) => {
      if (userLoading) {
        console.log('Waiting for user authentication...');
        toast('ℹ️ Please wait while we verify your session');
        return null;
      }
      if (userError || !userId) {
        console.error('User error or not authenticated:', userError);
        toast.error(userError || 'Please sign in to mark assessment as completed');
        return null;
      }
      if (!selectedClassId) {
        console.error('No class selected');
        toast.error('No class selected');
        return null;
      }

      try {
        const response = await axios.post('/api/user-progress/submit-assessment', {
          userId: parseInt(userId, 10),
          classId: parseInt(selectedClassId, 10),
          answers,
        });
        if (response.data.success) {
          setAssessmentCompleted((prev) => ({ ...prev, [assessmentId]: response.data.isPassed }));
          console.log(`Assessment marked as completed for ${assessmentId}`);
          
          // Invalidate cache after assessment completion
          invalidateProgressCache();
          
          // Return the assessment results for the modal
          return {
            score: response.data.score,
            correctAnswers: response.data.correctAnswers,
            totalQuestions: response.data.totalQuestions,
            isPassed: response.data.isPassed,
            canRetake: response.data.canRetake,
            attemptCount: response.data.attemptCount,
            answers: answers,
            detailedResults: response.data.detailedResults || [],
            completedAt: new Date().toISOString()
          };
        } else {
          console.error('Failed to mark assessment as completed:', response.data.error);
          toast.error(response.data.message || 'Failed to save assessment progress');
          return null;
        }
      } catch (err) {
        console.error('Error marking assessment as completed:', err);
        toast.error('Error saving assessment progress');
        return null;
      }
    },
    [userId, userLoading, userError, selectedClassId, invalidateProgressCache]
  );

  const value: AppContextType = {
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    handleNavClick,
    classes,
    setClasses,
    selectedClassId,
    setSelectedClassId,
    activeResourceTab,
    setActiveResourceTab,
    videoWatched,
    assessmentCompleted,
    initializeProgress,
    handleVideoComplete,
    handleAssessmentComplete,
    invalidateProgressCache,
    sidebarCollapsed,          // ✅ expose it
    setSidebarCollapsed,       // ✅ expose setter
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};