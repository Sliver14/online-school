// app/api/user-progress/assessment-results/[assessmentId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
    request: NextRequest,
    { params }: { params: { assessmentId: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User ID is required' },
                { status: 400 }
            );
        }

        const userIdNum = parseInt(userId);
        const assessmentIdNum = parseInt(params.assessmentId);

        if (isNaN(userIdNum) || isNaN(assessmentIdNum)) {
            return NextResponse.json(
                { success: false, error: 'Invalid user ID or assessment ID' },
                { status: 400 }
            );
        }

        // Get user's assessment result
        const userAssessment = await prisma.userAssessment.findFirst({
            where: {
                userId: userIdNum,
                assessmentId: assessmentIdNum
            },
            include: {
                assessment: {
                    include: {
                        questions: true
                    }
                }
            }
        });

        if (!userAssessment) {
            return NextResponse.json(
                { success: false, error: 'Assessment result not found' },
                { status: 404 }
            );
        }

        // Parse stored results
        const answers = userAssessment.answers ? JSON.parse(userAssessment.answers as string) : {};
        const detailedResults = userAssessment.detailedResults ? 
            JSON.parse(userAssessment.detailedResults as string) : [];

        return NextResponse.json({
            success: true,
            data: {
                id: userAssessment.id,
                score: userAssessment.score,
                isPassed: userAssessment.isPassed,
                attemptCount: userAssessment.attemptCount,
                completedAt: userAssessment.completedAt,
                answers,
                detailedResults,
                canRetake: !userAssessment.isPassed,
                totalQuestions: userAssessment.assessment.questions.length,
                correctAnswers: Math.round((userAssessment.score / 100) * userAssessment.assessment.questions.length),
                message: userAssessment.isPassed 
                    ? 'Perfect score! Assessment completed.' 
                    : 'You can retake this assessment to achieve 100%.',
                assessment: {
                    id: userAssessment.assessment.id,
                    title: userAssessment.assessment.title,
                    questions: userAssessment.assessment.questions
                }
            }
        });

    } catch (error) {
        console.error('Error fetching assessment results:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch assessment results' },
            { status: 500 }
        );
    }
}