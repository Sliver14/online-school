'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ClassCard from './ClassCard';
import { useUser } from '../context/UserContext';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';

interface ClassData {
  id: number;
  title: string;
  description: string;
  classNumber: string;
  duration: string;
  videoUrl: string;
  posterUrl: string;
  assessment: any[];
}

interface ClassTimer {
  timerExpiresAt?: string;
  timerActive: boolean;
}

const Classes: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classTimers, setClassTimers] = useState<{ [classId: string]: ClassTimer }>({});
  const [assessmentAttempts, setAssessmentAttempts] = useState<{ [assessmentId: string]: boolean }>({});
  const { userId } = useUser();
  const { classes, setClasses, videoWatched, assessmentCompleted, initializeProgress } = useAppContext();
  const renderCount = useRef(0);

  // Debug re-renders
  useEffect(() => {
    renderCount.current += 1;
    console.log(`Classes component rendered ${renderCount.current} times`);
  });

  const fetchClassesAndProgress = useCallback(async () => {
    if (!userId) {
      console.warn("User ID not available yet. Skipping initialization.");
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching classes and progress...');
      setLoading(true);

      // Fetch classes
      const classResponse = await axios.get('/api/classes');
      if (classResponse.data.success) {
        const sortedClasses = classResponse.data.data.sort((a: ClassData, b: ClassData) => a.id - b.id);
        setClasses(sortedClasses || []);
        console.log("Classes loaded:", sortedClasses);
      } else {
        throw new Error(classResponse.data.error || 'Failed to fetch classes');
      }

      // Fetch timer data
      const timerResponse = await axios.get(`/api/user-progress/class-timers?userId=${userId}`);
      if (timerResponse.data.success) {
        const timers = timerResponse.data.data;
        const timerMap = timers.reduce((acc: any, timer: any) => ({
          ...acc,
          [timer.classId.toString()]: {
            timerExpiresAt: timer.timerExpiresAt,
            timerActive: timer.timerActive,
          }
        }), {});
        setClassTimers(timerMap);
        console.log('ClassTimers:', timerMap);
      } else {
        throw new Error(timerResponse.data.error || 'Failed to fetch class timers');
      }

      // Fetch video progress
      const videoProgressPromises = classResponse.data.data.map(async (classItem: ClassData) => {
        try {
          const response = await axios.get(`/api/user-progress/video-watched?userId=${userId}&classId=${classItem.id}`);
          if (response.data.success && response.data.data.length > 0) {
            return {
              classId: classItem.id.toString(),
              watched: response.data.data.some((progress: any) => progress.watchedAt),
            };
          }
          return { classId: classItem.id.toString(), watched: false };
        } catch (err) {
          console.error(`Error fetching video progress for class ${classItem.id}:`, err);
          return { classId: classItem.id.toString(), watched: false };
        }
      });

      const videoProgress = await Promise.all(videoProgressPromises);
      const videoWatchedMap = videoProgress.reduce((acc, { classId, watched }) => ({
        ...acc,
        [classId]: watched
      }), {});
      initializeProgress({ videoWatched: videoWatchedMap });

      // Fetch assessment attempts
      const assessmentPromises = classResponse.data.data.flatMap((classItem: ClassData) =>
        classItem.assessment.length > 0
          ? classItem.assessment.map(async (assessment: any) => {
              try {
                const response = await axios.get(`/api/user-progress/assessment-results/${assessment.id}?userId=${userId}`);
                if (response.data.success) {
                  return {
                    assessmentId: assessment.id.toString(),
                    attempted: response.data.data.attemptCount > 0,
                  };
                }
                return { assessmentId: assessment.id.toString(), attempted: false };
              } catch (err) {
                console.error(`Error fetching assessment ${assessment.id} results:`, err);
                return { assessmentId: assessment.id.toString(), attempted: false };
              }
            })
          : []
      );

      const attempts = await Promise.all(assessmentPromises);
      const attemptsMap = attempts.reduce((acc, { assessmentId, attempted }) => ({ ...acc, [assessmentId]: attempted }), {});
      setAssessmentAttempts(attemptsMap);

    } catch (err) {
      console.error('Error fetching classes or progress:', err);
      setError('Failed to load classes. Please try again later.');
    } finally {
      setLoading(false);
      console.log('Fetch completed');
    }
  }, [userId, setClasses, initializeProgress]);

  useEffect(() => {
    fetchClassesAndProgress();
  }, [fetchClassesAndProgress]);

  // Determine if a class is locked
  const isClassLocked = useCallback((classItem: ClassData, index: number) => {
    // First class is always unlocked
    if (index === 0) return { locked: false, reason: '' };

    // Check if current class is completed
    const classId = classItem.id.toString();
    const isVideoWatched = videoWatched[classId];
    const allAssessmentsPassed = classItem.assessment.length > 0
      ? classItem.assessment.every((assessment: any) => assessmentCompleted[assessment.id.toString()])
      : true;

    if (isVideoWatched && allAssessmentsPassed) {
      return { locked: false, reason: '' }; // Completed classes stay unlocked
    }

    // Check previous class
    const prevClass = classes[index - 1];
    const prevClassId = prevClass?.id.toString();

    // Check if previous class video is watched
    if (!prevClass || !videoWatched[prevClassId]) {
      return { locked: true, reason: prevClass ? `Complete video for ${prevClass.title}` : 'Previous class not found' };
    }

    // Check if all assessments in previous class are completed
    if (prevClass.assessment.length > 0) {
      const allPrevAssessmentsPassed = prevClass.assessment.every((assessment: any) =>
        assessmentCompleted[assessment.id.toString()]
      );
      if (!allPrevAssessmentsPassed) {
        return { locked: true, reason: `Complete assessments for ${prevClass.title}` };
      }
    }

    // Check timer for current class
    const timer = classTimers[classId];
    if (timer?.timerActive && timer.timerExpiresAt) {
      const now = new Date();
      const expiresAt = new Date(timer.timerExpiresAt);
      if (now < expiresAt) {
        return { locked: true, reason: `Unlocks in ${formatTimeRemaining(expiresAt)}` };
      }
    }

    return { locked: false, reason: '' };
  }, [classes, videoWatched, assessmentCompleted, classTimers]);

  // Format time remaining for countdown
  const formatTimeRemaining = useCallback((expiresAt: Date) => {
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    if (diffMs <= 0) return '0s';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m ` : ''}${seconds}s`;
  }, []);

  // Update countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      setClassTimers(prev => {
        const updated = { ...prev };
        let changed = false;
        Object.keys(updated).forEach(classId => {
          const timer = updated[classId];
          if (timer.timerActive && timer.timerExpiresAt) {
            const expiresAt = new Date(timer.timerExpiresAt);
            if (new Date() >= expiresAt && timer.timerActive) {
              updated[classId] = { ...timer, timerActive: false };
              changed = true;
            }
          }
        });
        // Only return new object if changed to prevent re-renders
        return changed ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="desktop_h2 tablet_h2 mobile_h2 flex items-center gap-2 text-neutral-950 dark:text-dark-text-primary">
          <div className="w-1 h-8 rounded bg-primary-400 dark:bg-primary-400"></div>
          My Classes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-lg border border-neutral-200 dark:border-dark-border-primary overflow-hidden animate-pulse bg-neutral-50 dark:bg-dark-bg-tertiary">
              <div className="h-16 bg-neutral-200 dark:bg-dark-bg-secondary"></div>
              <div className="p-6">
                <div className="h-6 bg-neutral-200 dark:bg-dark-bg-secondary rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 dark:bg-dark-bg-secondary rounded w-2/3 mb-4"></div>
                <div className="h-2 bg-neutral-200 dark:bg-dark-bg-secondary rounded mb-2"></div>
                <div className="h-3 bg-neutral-200 dark:bg-dark-bg-secondary rounded"></div>
              </div>
            </div>
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
          <p className="text-neutral-500 dark:text-dark-text-muted desktop_paragraph tablet_paragraph mobile_paragraph">{error}</p>
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
      <h2 className="desktop_h2 tablet_h2 mobile_h2 flex items-center gap-2 text-neutral-950 dark:text-dark-text-primary">
        <div className="w-1 h-8 rounded bg-primary-400 dark:bg-primary-400"></div>
        My Classes
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem, index) => (
          <ClassCard
            key={classItem.id}
            classItem={classItem}
            index={index}
            isLocked={isClassLocked(classItem, index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Classes;