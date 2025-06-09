// app/api/user-progress/submit-assessment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// app/api/user-progress/submit-assessment/route.ts
export async function POST(request: NextRequest) {
    try {
        const { userId, classId, answers } = await request.json();

        // Get the assessment for this class
        const assessment = await prisma.assessment.findFirst({
            where: { classId },
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

        assessment.questions.forEach(question => {
            const userAnswer = answers[question.id];
            const options = Array.isArray(question.options)
                ? question.options
                : JSON.parse(question.options as string);

            if (userAnswer !== undefined && options[userAnswer] === question.correctAnswer) {
                correctAnswers++;
            }
        });

        const score = Math.round((correctAnswers / totalQuestions) * 100);

        // Save the assessment result
        await prisma.userAssessment.create({
            data: {
                userId,
                assessmentId: assessment.id,
                score
            }
        });

        return NextResponse.json({
            success: true,
            score,
            correctAnswers,
            totalQuestions
        });
    } catch (error) {
        console.error('Error submitting assessment:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to submit assessment' },
            { status: 500 }
        );
    }
}