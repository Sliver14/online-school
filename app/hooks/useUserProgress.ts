import { useQuery, useQueryClient, QueryClient } from '@tanstack/react-query';
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
  const [timerResponse, videoResponse, assessmentResponse] = await Promise.all([
    axios.get(`/api/user-progress/class-timers?userId=${userId}`),
    axios.get(`/api/user-progress/video-watched?userId=${userId}`),
    axios.get(`/api/user-progress/assessment-results?userId=${userId}`),
  ]);

  const timers = timerResponse.data.success ? timerResponse.data.data : [];
  const videos = videoResponse.data.success ? videoResponse.data.data : [];
  const assessmentResults = assessmentResponse.data.success ? assessmentResponse.data.data : [];

  const classTimers = timers.reduce((acc: { [key: string]: ClassTimer }, timer: any) => {
    if (timer && timer.classId != null) {
      return {
        ...acc,
        [timer.classId.toString()]: {
          timerExpiresAt: timer.timerExpiresAt,
          timerActive: timer.timerActive,
        },
      };
    }
    return acc;
  }, {});

  const videoWatched = videos.reduce((acc: { [key: string]: boolean }, video: any) => {
    if (video && video.video && video.video.classId != null) {
      return {
        ...acc,
        [video.video.classId.toString()]: !!video.watchedAt,
      };
    }
    return acc;
  }, {});

  // Process assessment results
  const assessmentCompleted = assessmentResults.reduce((acc: { [assessmentId: string]: boolean }, classResult: any) => {
    if (classResult && classResult.assessments) {
      classResult.assessments.forEach((assessment: any) => {
        if (assessment && assessment.assessmentId != null) {
          // Use isPassed for strict assessment completion (100% required)
          acc[assessment.assessmentId.toString()] = assessment.isPassed || false;
        }
      });
    }
    return acc;
  }, {});

  console.log('Processed assessment results (100% required):', assessmentCompleted);
  console.log('Raw assessment results:', assessmentResults);

  return {
    classTimers,
    videoWatched,
    assessmentCompleted,
  };
};

const fetchAssessmentProgress = async (userId: string, classId: string): Promise<{ [assessmentId: string]: boolean }> => {
  try {
    const response = await axios.get(`/api/user-progress/assessment-results?userId=${userId}&classId=${classId}`);
    if (response.data.success) {
      const assessments = response.data.data;
      return assessments.reduce((acc: { [assessmentId: string]: boolean }, assessment: any) => {
        if (assessment && assessment.assessmentId != null) {
          return {
            ...acc,
            [assessment.assessmentId.toString()]: assessment.isPassed || false, // Use isPassed for strict requirement
          };
        }
        return acc;
      }, {});
    }
    return {};
  } catch (error) {
    console.error('Error fetching assessment progress:', error);
    return {};
  }
};

export const useUserProgress = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['userProgress', userId],
    queryFn: () => fetchUserProgress(userId!),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds - reduced for more frequent updates
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
    refetchInterval: 10 * 1000, // Refetch every 10 seconds for timer updates
  });
};

export const useAssessmentProgress = (userId: string | undefined, classId: string | undefined) => {
  return useQuery({
    queryKey: ['assessmentProgress', userId, classId],
    queryFn: () => fetchAssessmentProgress(userId!, classId!),
    enabled: !!userId && !!classId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};

// Export a function to invalidate user progress cache
export const invalidateUserProgressCache = (userId: string) => {
  const queryClient = new QueryClient();
  return queryClient.invalidateQueries({ queryKey: ['userProgress', userId] });
};

// Export a function to invalidate assessment progress cache
export const invalidateAssessmentProgressCache = (userId: string, classId: string) => {
  const queryClient = new QueryClient();
  return queryClient.invalidateQueries({ queryKey: ['assessmentProgress', userId, classId] });
}; 