'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useAppContext } from '../context/AppContext';
import axios from 'axios';
import ClassCard from './ClassCard';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

const Classes: React.FC = () => {
  const { userId } = useUser();
  const {
    classes,
    setClasses,
    videoWatched,
    assessmentCompleted,
    initializeProgress,
    setSelectedClassId,
  } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timers, setTimers] = useState<{ [classId: string]: { expiresAt: string; active: boolean } }>({});

  useEffect(() => {
    const fetchClasses = async () => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get('/api/classes');
        if (response.data.success) {
          const fetchedClasses: ClassData[] = response.data.data;
          setClasses(fetchedClasses);
        } else {
          setError(response.data.error || 'Failed to fetch classes');
        }
      } catch (err) {
        setError('Failed to load classes');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [userId, setClasses]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!userId || !classes.length) return;

      try {
        const videoProgressResponse = await axios.get(`/api/user-progress/video-watched?userId=${userId}`);
        const assessmentProgressResponse = await axios.get(`/api/user-progress/assessment-results?userId=${userId}`);
        const timersResponse = await axios.get(`/api/user-progress/class-timers?userId=${userId}`);

        if (videoProgressResponse.data.success) {
          const videoProgress = videoProgressResponse.data.data.reduce((acc: any, progress: any) => {
            acc[progress.classId] = !!progress.watchedAt;
            return acc;
          }, {});
          initializeProgress({ videoWatched: videoProgress });
        }

        if (assessmentProgressResponse.data.success) {
          const assessmentProgress = assessmentProgressResponse.data.data.reduce((acc: any, result: any) => {
            acc[result.assessmentId] = result.isPassed;
            return acc;
          }, {});
          initializeProgress({ assessmentCompleted: assessmentProgress });
        }

        if (timersResponse.data.success) {
          const fetchedTimers = timersResponse.data.data.reduce((acc: any, timer: any) => {
            acc[timer.classId] = { expiresAt: timer.timerExpiresAt, active: timer.timerActive };
            return acc;
          }, {});
          setTimers(fetchedTimers);
        }
      } catch (err) {
        toast.error('Failed to load progress');
      }
    };

    fetchProgress();
  }, [userId, classes, initializeProgress]);

  useEffect(() => {
    const checkTimers = () => {
      const updatedTimers = { ...timers };
      let hasChanges = false;

      Object.keys(timers).forEach((classId) => {
        const timer = timers[classId];
        if (timer.active && timer.expiresAt) {
          const now = new Date();
          const expiresAt = new Date(timer.expiresAt);
          if (now >= expiresAt) {
            updatedTimers[classId] = { ...timer, active: false };
            hasChanges = true;
          }
        }
      });

      if (hasChanges) {
        setTimers(updatedTimers);
      }
    };

    const interval = setInterval(checkTimers, 1000);
    return () => clearInterval(interval);
  }, [timers]);

  const isClassLocked = (classItem: ClassData, index: number): { locked: boolean; reason: string } => {
    if (index === 0) return { locked: false, reason: '' };

    const previousClass = classes[index - 1];
    if (!previousClass) return { locked: true, reason: 'No previous class found' };

    const hasWatchedPreviousVideo = videoWatched[previousClass.id.toString()];
    const hasCompletedPreviousAssessments = previousClass.assessments.every(
      (assessment) => assessmentCompleted[assessment.id.toString()]
    );

    const timer = timers[classItem.id.toString()];
    const isTimerActive = timer?.active && new Date(timer.expiresAt) > new Date();

    if (!hasWatchedPreviousVideo) {
      return { locked: true, reason: 'Complete the previous class video' };
    }
    if (!hasCompletedPreviousAssessments) {
      return { locked: true, reason: 'Complete the previous class assessments' };
    }
    if (isTimerActive) {
      return { locked: true, reason: `Locked until ${new Date(timer.expiresAt).toLocaleString()}` };
    }

    return { locked: false, reason: '' };
  };

  const handleClassClick = (classId: string, isLocked: { locked: boolean; reason: string }) => {
    if (isLocked.locked) {
      toast.error(isLocked.reason);
      return;
    }

    setSelectedClassId(classId);
    sessionStorage.setItem('selectedClassId', classId);
    window.location.href = `/class/${classId}`;
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 dark:text-dark-text-muted">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-400 dark:border-primary-400 mx-auto mb-4"></div>
        <p className="text-neutral-500 dark:text-dark-text-muted">Loading classes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-950 dark:text-dark-text-primary">
        Classes
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.length > 0 ? (
          classes.map((classItem, index) => {
            const lockStatus = isClassLocked(classItem, index);
            return (
              <ClassCard
                key={classItem.id}
                classItem={classItem}
                index={index}
                isLocked={lockStatus}
                // onClick={() => handleClassClick(classItem.id.toString(), lockStatus)}
              />
            );
          })
        ) : (
          <p className="text-neutral-500 dark:text-dark-text-muted col-span-full">
            No classes available.
          </p>
        )}
      </div>
    </div>
  );
};

export default Classes;