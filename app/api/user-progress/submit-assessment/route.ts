// app/api/user-progress/submit-assessment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SubmitAssessmentRequest = {
    userId: string;
    classId: string;
    answers: Record<string, number>; // questionId as string, user-selected option index as number
};

export async function POST(request: NextRequest) {
    try {
        const body: SubmitAssessmentRequest = await request.json();
        const { userId, classId, answers } = body;

        // ✅ Convert string IDs to numbers
        const userIdNum = parseInt(userId);
        const classIdNum = parseInt(classId);

        // ✅ Add validation for conversion
        if (isNaN(userIdNum) || isNaN(classIdNum)) {
            return NextResponse.json(
                { success: false, error: 'Invalid user ID or class ID' },
                { status: 400 }
            );
        }

        // Get the assessment for this class
        const assessment = await prisma.assessment.findFirst({
            where: { classId: classIdNum },
            include: { questions: true }
        });

        if (!assessment) {
            return NextResponse.json(
                { success: false, error: 'Assessment not found' },
                { status: 404 }
            );
        }

        // Calculate score
        let correctAnswers = 0;
        const totalQuestions = assessment.questions.length;
        const detailedResults: Array<{
            questionId: number;
            userAnswer: number;
            correctAnswer: string;
            isCorrect: boolean;
        }> = [];

        assessment.questions.forEach(question => {
            const userAnswer = answers[question.id.toString()];
            const options = Array.isArray(question.options)
                ? question.options
                : JSON.parse(question.options as string);

            const isCorrect = userAnswer !== undefined && options[userAnswer] === question.correctAnswer;
            
            if (isCorrect) {
                correctAnswers++;
            }

            detailedResults.push({
                questionId: question.id,
                userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect
            });
        });

        const score = Math.round((correctAnswers / totalQuestions) * 100);
        const isPassed = score === 100; // Only 100% passes

        // Check if user has already submitted this assessment
        const existingSubmission = await prisma.userAssessment.findFirst({
            where: {
                userId: userIdNum,
                assessmentId: assessment.id
            }
        });

        if (existingSubmission) {
            if (existingSubmission.isPassed) {
                // User already passed, don't allow retake
                return NextResponse.json({
                    success: false,
                    error: 'Assessment already completed with perfect score',
                    existingResult: {
                        score: existingSubmission.score,
                        isPassed: existingSubmission.isPassed,
                        completedAt: existingSubmission.completedAt
                    }
                }, { status: 400 });
            } else {
                // Update existing submission (retake)
                const updatedSubmission = await prisma.userAssessment.update({
                    where: { id: existingSubmission.id },
                    data: {
                        score,
                        isPassed,
                        answers: JSON.stringify(answers),
                        detailedResults: JSON.stringify(detailedResults),
                        attemptCount: existingSubmission.attemptCount + 1,
                        completedAt: new Date()
                    }
                });

                return NextResponse.json({
                    success: true,
                    score,
                    correctAnswers,
                    totalQuestions,
                    isPassed,
                    canRetake: !isPassed,
                    attemptCount: updatedSubmission.attemptCount,
                    message: isPassed ? 'Perfect score! Assessment completed.' : 'You can retake this assessment to achieve 100%.'
                });
            }
        } else {
            // Create new assessment result
            const newSubmission = await prisma.userAssessment.create({
                data: {
                    userId: userIdNum,
                    assessmentId: assessment.id,
                    score,
                    isPassed,
                    answers: JSON.stringify(answers),
                    detailedResults: JSON.stringify(detailedResults),
                    attemptCount: 1,
                    completedAt: new Date()
                }
            });

            return NextResponse.json({
                success: true,
                score,
                correctAnswers,
                totalQuestions,
                isPassed,
                canRetake: !isPassed,
                attemptCount: 1,
                message: isPassed ? 'Perfect score! Assessment completed.' : 'You need 100% to complete this assessment. You can retake it.'
            });
        }

    } catch (error) {
        console.error('Error submitting assessment:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to submit assessment' },
            { status: 500 }
        );
    }
}