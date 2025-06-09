// app/api/user-progress/submit-examination/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const { userId, answers } = await request.json();

        // Get the exam (assuming there's only one exam)
        const exam = await prisma.exam.findFirst({
            include: { questions: true }
        });

        if (!exam) {
            return NextResponse.json(
                { success: false, error: 'Exam not found' },
                { status: 404 }
            );
        }

        // Calculate score
        let correctAnswers = 0;
        const totalQuestions = exam.questions.length;

        exam.questions.forEach(question => {
            const answerObj = answers.find((a: any) => a.questionId === question.id);
            if (answerObj) {
                const options = Array.isArray(question.options)
                    ? question.options
                    : JSON.parse(question.options as string);

                if (options[answerObj.answer] === question.correctAnswer) {
                    correctAnswers++;
                }
            }
        });

        const score = Math.round((correctAnswers / totalQuestions) * 100);

        // Save the exam result
        await prisma.userExam.create({
            data: {
                userId,
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