'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Play, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useAppContext } from '../context/AppContext';
import ClassCard from './ClassCard';
import { useClasses } from '../hooks/useClasses';
import { useUserProgress, useAssessmentProgress } from '../hooks/useUserProgress';
import { ClassCardSkeleton } from './LoadingSkeleton';

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

interface ClassTimer {
  timerExpiresAt: string;
  timerActive: boolean;
}

const Classes: React.FC = () => {
  const { userId } = useUser();
  const { setClasses, videoWatched, assessmentCompleted, initializeProgress, invalidateProgressCache } = useAppContext();

  // Use React Query for data fetching
  const { data: classes = [], isLoading: classesLoading, error: classesError } = useClasses();
  const { data: userProgress, isLoading: progressLoading, error: progressError } = useUserProgress(userId || undefined);

  // Update context when data is loaded
  useEffect(() => {
    if (classes.length > 0) {
      setClasses(classes);
    }
  }, [classes, setClasses]);

  useEffect(() => {
    if (userProgress) {
      initializeProgress({
        videoWatched: userProgress.videoWatched,
        assessmentCompleted: userProgress.assessmentCompleted,
      });
    }
  }, [userProgress, initializeProgress]);

  // Periodic cache refresh to ensure real-time updates
  useEffect(() => {
    if (!userId) return;
    
    const interval = setInterval(() => {
      // Refresh cache every 30 seconds to catch timer updates
      invalidateProgressCache();
    }, 30000);

    return () => clearInterval(interval);
  }, [userId, invalidateProgressCache]);

  // Real-time timer countdown effect
  const [timerUpdate, setTimerUpdate] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerUpdate(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getClassStatus = (classItem: any, index: number) => {
    // Add null check for classItem.id
    if (!classItem || classItem.id == null) {
      return { locked: true, reason: 'Invalid class data' };
    }
    
    const classId = classItem.id.toString();
    const isVideoWatched = userProgress?.videoWatched[classId] || false;
    
    // Check if all assessments for this class are completed (100% required)
    const allAssessmentsCompleted = classItem.assessments.length > 0
      ? classItem.assessments.every((assessment: any) => {
          // Add null check for assessment.id
          if (!assessment || assessment.id == null) return false;
          const assessmentPassed = userProgress?.assessmentCompleted[assessment.id.toString()] || false;
          return assessmentPassed;
        })
      : true;
    
    const isCompleted = isVideoWatched && allAssessmentsCompleted;

    // For the first class, it's always available
    if (index === 0) {
      return { locked: false, reason: '' };
    }

    // Check if previous class is completed
    const previousClass = classes[index - 1];
    if (!previousClass || previousClass.id == null) {
      return { locked: true, reason: 'Previous class not found' };
    }
    
    const prevClassId = previousClass.id.toString();
    const prevVideoWatched = userProgress?.videoWatched[prevClassId] || false;
    const prevAssessmentsCompleted = previousClass.assessments.length > 0
      ? previousClass.assessments.every((assessment: any) => {
          // Add null check for assessment.id
          if (!assessment || assessment.id == null) return false;
          const assessmentPassed = userProgress?.assessmentCompleted[assessment.id.toString()] || false;
          return assessmentPassed;
        })
      : true;
    const prevCompleted = prevVideoWatched && prevAssessmentsCompleted;
    
    if (isCompleted) {
      return { locked: false, reason: '' };
    }

    if (!prevCompleted) {
      return { 
        locked: true, 
        reason: `Complete Class ${index} (video and 100% on all assessments)` 
      };
    }

    // Check for active timer that hasn't expired yet
    const classTimer = userProgress?.classTimers[classId];
    if (classTimer && classTimer.timerActive && classTimer.timerExpiresAt) {
      const now = new Date();
      const expiresAt = new Date(classTimer.timerExpiresAt);
      const timeRemaining = expiresAt.getTime() - now.getTime();
      
      if (timeRemaining > 0) {
        const minutes = Math.floor(timeRemaining / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        return { 
          locked: true, 
          reason: `Timer active - unlocks in ${minutes}m ${seconds}s` 
        };
      }
    }

    return { locked: false, reason: '' };
  };

  const isLoading = classesLoading || progressLoading;
  const error = classesError || progressError;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="desktop_h2 tablet_h2 mobile_h2 flex items-center gap-2 text-neutral-950 dark:text-dark-text-primary">
          <div className="w-1 h-8 rounded bg-primary-400 dark:bg-primary-400"></div>
          My Classes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ClassCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <h2 className="desktop_h2 tablet_h2 mobile_h2 flex items-center gap-2 text-neutral-950 dark:text-dark-text-primary">
          <div className="w-1 h-8 rounded bg-primary-400 dark:bg-primary-400"></div>
          My Classes
        </h2>

        <div className="bg-error-50 dark:bg-error-dark border border-error-200 dark:border-error-600 rounded-lg p-6 text-center">
          <div className="text-error-500 dark:text-error-400 text-lg mb-2 desktop_h3 tablet_h3 mobile_h3">⚠️ Error</div>
          <p className="text-neutral-500 dark:text-dark-text-muted desktop_paragraph tablet_paragraph mobile_paragraph">
            {error instanceof Error ? error.message : 'Failed to load classes'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-error-500 dark:bg-error-600 text-white rounded-lg hover:bg-error-600 dark:hover:bg-error-700 transition-colors desktop_paragraph tablet_paragraph mobile_paragraph"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="desktop_h2 tablet_h2 mobile_h2 flex items-center gap-2 text-neutral-950 dark:text-dark-text-primary">
          <div className="w-1 h-8 rounded bg-primary-400 dark:bg-primary-400"></div>
          My Classes
        </h2>

        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="desktop_h3 tablet_h3 mobile_h3 font-semibold mb-2 text-neutral-950 dark:text-dark-text-primary">
            No Classes Available
          </h3>
          <p className="text-neutral-500 dark:text-dark-text-muted desktop_paragraph tablet_paragraph mobile_paragraph">
            Classes will appear here once they are assigned to you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="desktop_h2 tablet_h2 mobile_h2 flex items-center gap-2 text-neutral-950 dark:text-dark-text-primary">
          <div className="w-1 h-8 rounded bg-primary-400 dark:bg-primary-400"></div>
          My Classes
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem, index) => {
          // Add null check for classItem.id
          if (!classItem || classItem.id == null) {
            return null; // Skip invalid class items
          }
          
          const classId = classItem.id.toString();
          const isVideoWatched = userProgress?.videoWatched[classId] || false;
          const allAssessmentsCompleted = classItem.assessments.length > 0
            ? classItem.assessments.every((assessment: any) => {
                // Add null check for assessment.id
                if (!assessment || assessment.id == null) return false;
                const assessmentPassed = userProgress?.assessmentCompleted[assessment.id.toString()] || false;
                return assessmentPassed;
              })
            : true;
          const isCompleted = isVideoWatched && allAssessmentsCompleted;
          const isLocked = getClassStatus(classItem, index);

          // Calculate timer value (using timerUpdate to trigger re-renders)
          const timer = userProgress?.classTimers[classId];
          const timeLeft = timer?.timerActive && timer.timerExpiresAt
            ? Math.max(0, Math.floor((new Date(timer.timerExpiresAt).getTime() - new Date().getTime()) / 1000))
            : null;

          // Force re-render when timer updates
          timerUpdate; // This line ensures the component re-renders when timerUpdate changes

          return (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              index={index}
              isLocked={isLocked}
              timer={timeLeft}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Classes;