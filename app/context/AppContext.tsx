'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useUser } from './UserContext';

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
  handleVideoComplete: (classId: string, videoId?: number) => Promise<void>;
  handleAssessmentComplete: (assessmentId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('classes');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [classes, setClassesInternal] = useState<ClassData[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [activeResourceTab, setActiveResourceTab] = useState<string>('materials');
  const [videoWatched, setVideoWatched] = useState<{ [classId: string]: boolean }>({});
  const [assessmentCompleted, setAssessmentCompleted] = useState<{ [assessmentId: string]: boolean }>({});
  const { userId, userLoading, userError } = useUser();

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
    setActiveTab(tab);
    setSidebarOpen(false);
  }, []);

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

  const handleVideoComplete = useCallback(async (classId: string, videoId?: number) => {
    if (userLoading) {
      console.log('Waiting for user authentication...');
      toast.info('Please wait while we verify your session');
      return;
    }
    if (userError || !userId) {
      console.error('User error or not authenticated:', userError);
      toast.error(userError || 'Please sign in to mark video as watched');
      return;
    }

    try {
      const response = await axios.post('/api/user-progress/video-watched', {
        userId: parseInt(userId, 10), // Convert string userId to number
        classId: parseInt(classId, 10),
        videoId,
        watchedAt: new Date().toISOString(),
      });
      if (response.data.success) {
        setVideoWatched((prev) => ({ ...prev, [classId]: true }));
        console.log(`Video marked as watched for class ${classId}, video ${videoId}`);
        toast.success('Video progress saved');
      } else {
        console.error('Failed to mark video as watched:', response.data.error);
        toast.error('Failed to save video progress');
      }
    } catch (err) {
      console.error('Error marking video as watched:', err);
      toast.error('Error saving video progress');
    }
  }, [userId, userLoading, userError]);

  const handleAssessmentComplete = useCallback(async (assessmentId: string) => {
    if (userLoading) {
      console.log('Waiting for user authentication...');
      toast.info('Please wait while we verify your session');
      return;
    }
    if (userError || !userId) {
      console.error('User error or not authenticated:', userError);
      toast.error(userError || 'Please sign in to mark assessment as completed');
      return;
    }

    try {
      const response = await axios.post('/api/user-progress/assessment-results', {
        userId: parseInt(userId, 10), // Convert string userId to number
        assessmentId,
        isPassed: true,
        completedAt: new Date().toISOString(),
      });
      if (response.data.success) {
        setAssessmentCompleted((prev) => ({ ...prev, [assessmentId]: true }));
        console.log(`Assessment marked as completed for ${assessmentId}`);
        toast.success('Assessment progress saved');
      } else {
        console.error('Failed to mark assessment as completed:', response.data.error);
        toast.error('Failed to save assessment progress');
      }
    } catch (err) {
      console.error('Error marking assessment as completed:', err);
      toast.error('Error saving assessment progress');
    }
  }, [userId, userLoading, userError]);

  return (
    <AppContext.Provider
      value={{
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};