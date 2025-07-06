'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Play, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useAppContext } from '../context/AppContext';
import ClassCard from './ClassCard';
import { useClasses } from '../hooks/useClasses';
import { useUserProgress } from '../hooks/useUserProgress';
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
  const { setClasses, videoWatched, assessmentCompleted, initializeProgress } = useAppContext();
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
      initializeProgress({
        videoWatched: userProgress.videoWatched,
        assessmentCompleted: userProgress.assessmentCompleted,
      });
    }
  }, [userProgress, initializeProgress]);

  const getClassStatus = (classItem: any, index: number) => {
    const classId = classItem.id.toString();
    const isVideoWatched = userProgress?.videoWatched[classId] || false;
    const allAssessmentsCompleted = classItem.assessments.length > 0
      ? classItem.assessments.every((assessment: any) => 
          userProgress?.assessmentCompleted[assessment.id.toString()]
        )
      : true;
    const isCompleted = isVideoWatched && allAssessmentsCompleted;

    // Check if previous class is completed
    const previousClass = index > 0 ? classes[index - 1] : null;
    const isPreviousCompleted = !previousClass || (() => {
      const prevClassId = previousClass.id.toString();
      const prevVideoWatched = userProgress?.videoWatched[prevClassId] || false;
      const prevAssessmentsCompleted = previousClass.assessments.length > 0
        ? previousClass.assessments.every((assessment: any) => 
            userProgress?.assessmentCompleted[assessment.id.toString()]
          )
        : true;
      return prevVideoWatched && prevAssessmentsCompleted;
    })();

    if (isCompleted) {
      return { locked: false, reason: '' };
    }

    if (!isPreviousCompleted) {
      return { 
        locked: true, 
        reason: `Complete Class ${index} first` 
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
      <h2 className="desktop_h2 tablet_h2 mobile_h2 flex items-center gap-2 text-neutral-950 dark:text-dark-text-primary">
        <div className="w-1 h-8 rounded bg-primary-400 dark:bg-primary-400"></div>
        My Classes
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((classItem, index) => {
          const classId = classItem.id.toString();
          const isVideoWatched = userProgress?.videoWatched[classId] || false;
          const allAssessmentsCompleted = classItem.assessments.length > 0
            ? classItem.assessments.every((assessment: any) => 
                userProgress?.assessmentCompleted[assessment.id.toString()]
              )
            : true;
          const isCompleted = isVideoWatched && allAssessmentsCompleted;
          const isLocked = getClassStatus(classItem, index);

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