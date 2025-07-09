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
  const renderCount = useRef(0);

  // Use React Query for data fetching
  const { data: classes = [], isLoading: classesLoading, error: classesError } = useClasses();
  const { data: userProgress, isLoading: progressLoading, error: progressError } = useUserProgress(userId || undefined);

  useEffect(() => {
    renderCount.current += 1;
    console.log(`Classes component rendered ${renderCount.current} times`);
  });

  // Update context when data is loaded
  useEffect(() => {
    if (classes.length > 0) {
      setClasses(classes);
    }
  }, [classes, setClasses]);

  useEffect(() => {
    if (userProgress) {
      console.log('User progress loaded:', userProgress);
      initializeProgress({
        videoWatched: userProgress.videoWatched,
        assessmentCompleted: userProgress.assessmentCompleted,
      });
    }
  }, [userProgress, initializeProgress]);

  // Debug logging
  useEffect(() => {
    if (userProgress && classes.length > 0) {
      console.log('=== DEBUG: Classes and Progress Data ===');
      console.log('Classes:', classes.map(c => ({ id: c.id, title: c.title })));
      console.log('Video Watched:', userProgress.videoWatched);
      console.log('Assessment Completed:', userProgress.assessmentCompleted);
      console.log('Class Timers:', userProgress.classTimers);
      console.log('=====================================');
    }
  }, [userProgress, classes]);

  // Periodic cache refresh to ensure real-time updates
  useEffect(() => {
    if (!userId) return;
    
    const interval = setInterval(() => {
      // Refresh cache every 30 seconds to catch timer updates
      invalidateProgressCache();
    }, 30000);

    return () => clearInterval(interval);
  }, [userId, invalidateProgressCache]);

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
          console.log(`Class ${classId} - Assessment ${assessment.id} passed (100%):`, assessmentPassed);
          return assessmentPassed;
        })
      : true;
    
    const isCompleted = isVideoWatched && allAssessmentsCompleted;

    console.log(`Class ${classId} (${classItem.title}) status:`, {
      index,
      isVideoWatched,
      allAssessmentsCompleted,
      isCompleted,
      assessments: classItem.assessments.map((a: any) => ({ 
        id: a.id, 
        title: a.title,
        passed: userProgress?.assessmentCompleted[a.id.toString()] 
      }))
    });

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
          console.log(`Previous class assessment ${assessment.id} passed (100%):`, assessmentPassed);
          return assessmentPassed;
        })
      : true;
    const prevCompleted = prevVideoWatched && prevAssessmentsCompleted;
    
    console.log(`Previous class ${prevClassId} status:`, {
      prevVideoWatched,
      prevAssessmentsCompleted,
      prevCompleted
    });

    if (isCompleted) {
      return { locked: false, reason: '' };
    }

    if (!prevCompleted) {
      return { 
        locked: true, 
        reason: `Complete Class ${index} first (video + 100% on all assessments)` 
      };
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
        <div className="flex gap-2">
          <button
            onClick={() => {
              invalidateProgressCache();
              console.log('Manual cache refresh triggered');
            }}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
          >
            🔄 Refresh
          </button>
          <button
            onClick={async () => {
              if (userId) {
                try {
                  const response = await fetch(`/api/user-progress/assessment-results?userId=${userId}`);
                  const data = await response.json();
                  console.log('Assessment results API response:', data);
                } catch (error) {
                  console.error('Error fetching assessment results:', error);
                }
              }
            }}
            className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors text-sm"
          >
            🧪 Test API
          </button>
          <button
            onClick={async () => {
              if (userId) {
                try {
                  const response = await fetch(`/api/user-progress/video-watched?userId=${userId}`);
                  const data = await response.json();
                  console.log('Video progress API response:', data);
                } catch (error) {
                  console.error('Error fetching video progress:', error);
                }
              }
            }}
            className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors text-sm"
          >
            🎥 Test Video
          </button>
          <button
            onClick={async () => {
              if (userId) {
                try {
                  const response = await fetch(`/api/user-progress/class-timers?userId=${userId}`);
                  const data = await response.json();
                  console.log('Class timers API response:', data);
                } catch (error) {
                  console.error('Error fetching class timers:', error);
                }
              }
            }}
            className="px-4 py-2 bg-warning-500 text-white rounded-lg hover:bg-warning-600 transition-colors text-sm"
          >
            ⏰ Test Timers
          </button>
        </div>
      </div>

      {/* Debug Panel */}
      {userProgress && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm">
          <h3 className="font-bold mb-2">Debug Info (Strict Mode - 100% Required):</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <strong>Video Watched:</strong>
              <pre className="text-xs mt-1">{JSON.stringify(userProgress.videoWatched, null, 2)}</pre>
            </div>
            <div>
              <strong>Assessment Passed (100%):</strong>
              <pre className="text-xs mt-1">{JSON.stringify(userProgress.assessmentCompleted, null, 2)}</pre>
            </div>
            <div>
              <strong>Class Timers:</strong>
              <pre className="text-xs mt-1">{JSON.stringify(userProgress.classTimers, null, 2)}</pre>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            <strong>Note:</strong> Assessments must be passed with 100% score to unlock next class.
          </div>
        </div>
      )}

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
                console.log(`Class ${classId} - Assessment ${assessment.id} passed (100%):`, assessmentPassed);
                return assessmentPassed;
              })
            : true;
          const isCompleted = isVideoWatched && allAssessmentsCompleted;
          const isLocked = getClassStatus(classItem, index);

          console.log(`Class ${classId} (${classItem.title}) status:`, {
            index,
            isVideoWatched,
            allAssessmentsCompleted,
            isCompleted,
            isLocked,
            assessments: classItem.assessments.map((a: any) => ({ 
              id: a.id, 
              title: a.title,
              passed: userProgress?.assessmentCompleted[a.id.toString()] 
            }))
          });

          // Calculate timer value
          const timer = userProgress?.classTimers[classId];
          const timeLeft = timer?.timerActive && timer.timerExpiresAt
            ? Math.max(0, Math.floor((new Date(timer.timerExpiresAt).getTime() - new Date().getTime()) / 1000))
            : null;

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