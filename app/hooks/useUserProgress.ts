import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface ClassTimer {
  timerExpiresAt: string;
  timerActive: boolean;
}

interface UserProgress {
  classTimers: { [classId: string]: ClassTimer };
  videoWatched: { [classId: string]: boolean };
  assessmentCompleted: { [assessmentId: string]: boolean };
}

const fetchUserProgress = async (userId: string): Promise<UserProgress> => {
  const [timerResponse, videoResponse] = await Promise.all([
    axios.get(`/api/user-progress/class-timers?userId=${userId}`),
    axios.get(`/api/user-progress/video-watched?userId=${userId}`),
  ]);

  const timers = timerResponse.data.success ? timerResponse.data.data : [];
  const videos = videoResponse.data.success ? videoResponse.data.data : [];

  const classTimers = timers.reduce((acc: { [key: string]: ClassTimer }, timer: any) => ({
    ...acc,
    [timer.classId.toString()]: {
      timerExpiresAt: timer.timerExpiresAt,
      timerActive: timer.timerActive,
    },
  }), {});

  const videoWatched = videos.reduce((acc: { [key: string]: boolean }, video: any) => ({
    ...acc,
    [video.classId.toString()]: video.watched,
  }), {});

  return {
    classTimers,
    videoWatched,
    assessmentCompleted: {}, // Will be fetched separately per class
  };
};

export const useUserProgress = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['userProgress', userId],
    queryFn: () => fetchUserProgress(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}; 