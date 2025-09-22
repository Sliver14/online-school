// lib/auth-utils.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const verifyTokenFromRequest = (req: NextRequest): AuthUser | null => {
  const token = req.cookies.get('authToken')?.value;
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
    
    if (!decoded.email) {
      return null;
    }

    return {
      id: decoded.userId || '',
      email: decoded.email,
      firstName: decoded.firstName || '',
      lastName: decoded.lastName || '',
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

export const isPublicRoute = (pathname: string): boolean => {
  const publicRoutes = ['/welcome', '/auth', '/api/auth'];
  return publicRoutes.some(route => pathname.startsWith(route));
};

export const clearAuthToken = (): void => {
  document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

export const setAuthToken = (token: string): void => {
  document.cookie = `authToken=${token}; path=/; max-age=604800; secure; samesite=strict`;
};

// lib/types.ts
export interface ClassData {
  id: number;
  title: string;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  videos?: VideoData[];
  assessments?: AssessmentData[];
  resources?: ResourceData[];
  essaySubmissions?: EssaySubmissionData[];
}

export interface VideoData {
  id: number;
  classId: number;
  title: string;
  videoUrl: string;
  classNumber: string;
  videoPosterUrl: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentData {
  id: number;
  classId: number;
  title: string;
  questions: QuestionData[];
  createdAt: string;
  updatedAt: string;
}

export interface QuestionData {
  id: number;
  assessmentId: number;
  text: string;
  options: any; // JSON type
  correctAnswer: string;
}

export interface ResourceData {
  id: number;
  classId: number;
  title: string;
  type: 'READ' | 'ESSAY' | 'VIDEO' | 'LINK' | 'ASSIGNMENT' | 'NOTE';
  content: string;
  resourceUrl: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface EssaySubmissionData {
  id: number;
  userId: number;
  classId: number;
  content: string;
  submittedAt: string;
  reviewed: boolean;
  remarks: string | null;
}

export interface UserProgressData {
  classId: number;
  progress: number;
  status: 'completed' | 'locked' | 'countdown' | 'available';
  videosWatched: number;
  totalVideos: number;
  assessmentsCompleted: number;
  totalAssessments: number;
}

// lib/progress-calculator.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProgressCalculator {
  static async calculateClassProgress(userId: number, classId: number): Promise<UserProgressData> {
    try {
      // Get total videos and watched videos
      const totalVideos = await prisma.video.count({
        where: { classId }
      });

      const videosWatched = await prisma.userProgress.count({
        where: {
          userId,
          video: { classId }
        }
      });

      // Get total assessments and completed assessments
      const totalAssessments = await prisma.assessment.count({
        where: { classId }
      });

      const assessmentsCompleted = await prisma.userAssessment.count({
        where: {
          userId,
          assessment: { classId },
          score: { gte: 70 } // Assuming 70% is passing
        }
      });

      // Calculate overall progress
      const totalItems = totalVideos + totalAssessments;
      const completedItems = videosWatched + assessmentsCompleted;
      const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      // Determine status
      const status = await this.determineClassStatus(userId, classId, progress);

      return {
        classId,
        progress,
        status,
        videosWatched,
        totalVideos,
        assessmentsCompleted,
        totalAssessments
      };
    } catch (error) {
      console.error('Error calculating progress:', error);
      throw error;
    }
  }

  static async determineClassStatus(
    userId: number, 
    classId: number, 
    progress: number
  ): Promise<'completed' | 'locked' | 'countdown' | 'available'> {
    try {
      const classData = await prisma.class.findUnique({
        where: { id: classId }
      });

      if (!classData) return 'locked';

      // First class is always available
      if (classData.order === 1) {
        return progress === 100 ? 'completed' : 'available';
      }

      // Check if current class is completed
      if (progress === 100) {
        return 'completed';
      }

      // Check previous class completion
      const previousClass = await prisma.class.findFirst({
        where: { order: classData.order - 1 }
      });

      if (!previousClass) return 'locked';

      const previousProgress = await this.calculateClassProgress(userId, previousClass.id);
      
      if (previousProgress.progress < 100) {
        return 'locked';
      }

      // Check for active countdown timer
      const activeTimer = await prisma.userProgress.findFirst({
        where: {
          userId,
          video: { classId },
          timerActive: true,
          timerExpiresAt: { gt: new Date() }
        }
      });

      if (activeTimer) {
        return 'countdown';
      }

      return 'available';
    } catch (error) {
      console.error('Error determining class status:', error);
      return 'locked';
    }
  }

  static async getAllUserProgress(userId: number): Promise<UserProgressData[]> {
    try {
      const classes = await prisma.class.findMany({
        orderBy: { order: 'asc' }
      });

      const progressPromises = classes.map(classItem => 
        this.calculateClassProgress(userId, classItem.id)
      );

      return await Promise.all(progressPromises);
    } catch (error) {
      console.error('Error getting all user progress:', error);
      throw error;
    }
  }
}

// lib/constants.ts - Update your existing constants file
export interface VideoWatched {
  [classId: string]: boolean;
}

export interface AssessmentCompleted {
  [classId: string]: boolean;
}

export interface CountdownTimers {
  [classId: string]: number | null;
}

// You can remove the hardcoded classes array since it's now coming from the database
export const colors = {
  primary: '#1a1a2e',
  secondary: '#16213e',
  tertiary: '#0f3460',
  accent: '#e94560',
  success: '#2dd4bf',
  warning: '#f59e0b',
  danger: '#ef4444',
  text: '#ffffff',
  textMuted: '#94a3b8'
};

// Migration helper (optional) - helps migrate from old static data to API data
export const migrateToApiData = async () => {
  console.log('Consider creating a data migration script if you have existing user progress data');
  // Implementation would depend on your existing data structure
};