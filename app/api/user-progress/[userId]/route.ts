// app/api/user-progress/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> } // ✅ Fixed: params is now a Promise
) {
    try {
        // ✅ Await the params Promise
        const resolvedParams = await params;
        const userId = parseInt(resolvedParams.userId);

        // Get all classes
        const classes = await prisma.class.findMany({
            include: {
                videos: true,
                assessments: {
                    include: {
                        questions: true,
                        submissions: {
                            where: { userId },
                            orderBy: { completedAt: 'desc' }
                        }
                    }
                }
            },
            orderBy: { order: 'asc' }
        });

        // Get user's video progress
        const userProgress = await prisma.userProgress.findMany({
            where: { userId },
            include: { video: true }
        });

        // Transform data to match expected format
        const progressData = classes.map(cls => {
            const videoProgress = userProgress.filter(up =>
                cls.videos.some(v => v.id === up.videoId)
            );

            const hasWatchedVideo = videoProgress.length > 0;
            const assessmentScores = cls.assessments.map(assessment => {
                const latestSubmission = assessment.submissions[0];
                return latestSubmission ? latestSubmission.score : null;
            });

            const hasPassedAssessment = assessmentScores.some(score => score && score >= 80);
            const completed = hasWatchedVideo && hasPassedAssessment;

            return {
                classId: cls.id,
                course: {
                    id: cls.id,
                    title: cls.title,
                    description: cls.description,
                    duration: "45 min",
                    videoUrl: cls.videos[0]?.videoUrl || "",
                    posterUrl: cls.videos[0]?.videoPosterUrl || "",
                    assessment: cls.assessments.map(assessment => ({
                        id: assessment.id,
                        title: assessment.title,
                        questions: assessment.questions.map(q => ({
                            id: q.id,
                            question: q.text,
                            options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
                            correctAnswer: q.correctAnswer
                        }))
                    }))
                },
                hasWatchedVideo,
                assessmentScores: assessmentScores.filter(score => score !== null),
                completed
            };
        });

        return NextResponse.json(progressData);
    } catch (error) {
        console.error('Error fetching user progress:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch user progress' },
            { status: 500 }
        );
    }
}