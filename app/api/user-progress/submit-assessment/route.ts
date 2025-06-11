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
            where: { classId: classIdNum }, // ✅ Use converted number
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
            const userAnswer = answers[question.id.toString()]; // ✅ Convert question ID to string for lookup
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
                userId: userIdNum, // ✅ Use converted number
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