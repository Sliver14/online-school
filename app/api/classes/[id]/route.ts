import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // ✅ Fixed: params is now a Promise
) {
    try {
        // ✅ Await the params Promise
        const resolvedParams = await params;
        const classId = parseInt(resolvedParams.id);

        const classData = await prisma.class.findUnique({
            where: { id: classId },
            include: {
                videos: {
                    orderBy: { order: 'asc' }
                },
                assessments: {
                    include: {
                        questions: true
                    }
                }
            }
        });

        if (!classData) {
            return NextResponse.json(
                { success: false, error: 'Class not found' },
                { status: 404 }
            );
        }

        const transformedClass = {
            id: classData.id,
            title: classData.title,
            description: classData.description,
            duration: '45 min',
            videoUrl: classData.videos[0]?.videoUrl || '',
            posterUrl: classData.videos[0]?.title || '',
            assessment: classData.assessments.map((assessment) => ({
                id: assessment.id,
                title: assessment.title,
                questions: assessment.questions.map((q) => ({
                    id: q.id,
                    question: q.text,
                    options: Array.isArray(q.options)
                        ? q.options
                        : JSON.parse(q.options as string),
                    correctAnswer: q.correctAnswer
                }))
            }))
        };

        return NextResponse.json({
            success: true,
            data: transformedClass
        });
    } catch (error) {
        console.error('Error fetching class:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch class' },
            { status: 500 }
        );
    }
}