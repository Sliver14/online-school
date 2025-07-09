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

        // Validate userId
        const userIdNum = parseInt(userId);
        if (isNaN(userIdNum)) {
            return NextResponse.json(
                { success: false, error: 'Invalid user ID' },
                { status: 400 }
            );
        }

        // Validate answers
        if (!answers || Object.keys(answers).length === 0) {
            return NextResponse.json(
                { success: false, error: 'Answers cannot be empty' },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await prisma.user.findUnique({ where: { id: userIdNum } });
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if user already submitted this exam
        const exam = await prisma.exam.findFirst({
            include: { questions: true },
        });
        if (!exam) {
            return NextResponse.json(
                { success: false, error: 'Exam not found' },
                { status: 404 }
            );
        }

        const existingSubmission = await prisma.userExam.findFirst({
            where: { userId: userIdNum, examId: exam.id },
        });
        if (existingSubmission) {
            return NextResponse.json(
                { success: false, error: 'Exam already submitted' },
                { status: 400 }
            );
        }

        // Calculate score
        let correctAnswers = 0;
        const totalQuestions = exam.questions.length;
        const invalidQuestionIds: string[] = [];

        for (const question of exam.questions) {
            const userAnswer = answers[question.id.toString()];
            if (userAnswer === undefined) {
                continue; // Skip unanswered questions
            }

            if (!Number.isInteger(userAnswer) || userAnswer < 0) {
                invalidQuestionIds.push(question.id.toString());
                continue;
            }

            let options: string[];
            try {
                options = Array.isArray(question.options)
                    ? question.options
                    : JSON.parse(question.options as string);
            } catch (e) {
                console.error(`Invalid options JSON for question ${question.id}:`, e);
                invalidQuestionIds.push(question.id.toString());
                continue;
            }

            if (userAnswer >= options.length) {
                invalidQuestionIds.push(question.id.toString());
                continue;
            }

            if (options[userAnswer] === question.correctAnswer) {
                correctAnswers++;
            }
        }

        if (invalidQuestionIds.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Invalid answers for question IDs: ${invalidQuestionIds.join(', ')}`,
                },
                { status: 400 }
            );
        }

        const score = Math.round((correctAnswers / totalQuestions) * 100);

        // Save submission
        await prisma.userExam.create({
            data: {
                userId: userIdNum,
                examId: exam.id,
                score,
            },
        });

        return NextResponse.json({
            success: true,
            score,
            correctAnswers,
            totalQuestions,
        });
    } catch (error) {
        console.error('Error submitting examination:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to submit examination' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
