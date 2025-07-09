import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const exam = await prisma.exam.findFirst({
            include: {
                questions: {
                    select: {
                        id: true,
                        text: true,
                        options: true,
                    },
                },
            },
        });

        if (!exam) {
            return NextResponse.json(
                { success: false, error: 'Exam not found' },
                { status: 404 }
            );
        }

        // Ensure options are parsed if stored as JSON string
        const formattedExam = {
            ...exam,
            questions: exam.questions.map((question) => ({
                ...question,
                options: Array.isArray(question.options)
                    ? question.options
                    : JSON.parse(question.options as string),
            })),
        };

        return NextResponse.json({
            success: true,
            exam: {
                id: formattedExam.id,
                title: formattedExam.title,
                questions: formattedExam.questions,
            },
        });
    } catch (error) {
        console.error('Error fetching examination:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch examination' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}