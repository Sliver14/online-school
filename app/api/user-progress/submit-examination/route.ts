import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type SubmitExaminationRequest = {
    userId: string;
    answers: Record<string, number>; // questionId -> selected option index
};

export async function POST(request: NextRequest) {
    try {
        const body: SubmitExaminationRequest = await request.json();
        const { userId, answers } = body;

        // ✅ Convert userId to number
        const userIdNum = parseInt(userId);

        // ✅ Add validation for conversion
        if (isNaN(userIdNum)) {
            return NextResponse.json(
                { success: false, error: 'Invalid user ID' },
                { status: 400 }
            );
        }

        const exam = await prisma.exam.findFirst({
            include: { questions: true }
        });

        if (!exam) {
            return NextResponse.json(
                { success: false, error: 'Exam not found' },
                { status: 404 }
            );
        }

        let correctAnswers = 0;
        const totalQuestions = exam.questions.length;

        exam.questions.forEach(question => {
            // ✅ Convert question ID to string for lookup in answers object
            const userAnswer = answers[question.id.toString()];
            if (userAnswer !== undefined) {
                const options = Array.isArray(question.options)
                    ? question.options
                    : JSON.parse(question.options as string);

                if (options[userAnswer] === question.correctAnswer) {
                    correctAnswers++;
                }
            }
        });

        const score = Math.round((correctAnswers / totalQuestions) * 100);

        await prisma.userExam.create({
            data: {
                userId: userIdNum, // ✅ Use converted number
                examId: exam.id,
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
        console.error('Error submitting examination:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to submit examination' },
            { status: 500 }
        );
    }
}