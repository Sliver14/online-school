import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Cache responses for 1 hour
export const revalidate = 3600;

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> } // Correct type
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const { assessmentId } = await params; // Await params

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId);
    const assessmentIdNum = parseInt(assessmentId); // Use awaited assessmentId

    if (isNaN(userIdNum) || isNaN(assessmentIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID or assessment ID' },
        { status: 400 }
      );
    }

    // Get assessment details for totalQuestions
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentIdNum },
      include: { questions: true },
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Get user's assessment result
    const userAssessment = await prisma.userAssessment.findFirst({
      where: {
        userId: userIdNum,
        assessmentId: assessmentIdNum,
      },
      include: {
        assessment: {
          include: {
            questions: true,
          },
        },
      },
    });

    // Return default data if no result exists
    if (!userAssessment) {
      return NextResponse.json({
        success: true,
        data: {
          id: null,
          score: 0,
          isPassed: false,
          attemptCount: 0,
          completedAt: null,
          answers: {},
          detailedResults: [],
          canRetake: true,
          totalQuestions: assessment.questions.length,
          correctAnswers: 0,
          message: 'No attempts made yet.',
          assessment: {
            id: assessment.id,
            title: assessment.title,
            questions: assessment.questions,
          },
        },
      });
    }

    // Parse stored results
    const answers = userAssessment.answers ? JSON.parse(userAssessment.answers as string) : {};
    const detailedResults = userAssessment.detailedResults
      ? JSON.parse(userAssessment.detailedResults as string)
      : [];

    console.log('User assessment from DB:', {
      id: userAssessment.id,
      score: userAssessment.score,
      isPassed: userAssessment.isPassed,
      answers: userAssessment.answers,
      detailedResults: userAssessment.detailedResults,
      parsedAnswers: answers,
      parsedDetailedResults: detailedResults
    });

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
          questions: userAssessment.assessment.questions,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching assessment results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessment results' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}