// app/api/classes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const classes = await prisma.class.findMany({
            include: {
                videos: {
                    orderBy: { order: 'asc' }
                },
                assessments: {
                    include: {
                        questions: true
                    }
                }
            },
            orderBy: { order: 'asc' }
        });

        // Transform the data to match the expected format
        const transformedClasses = classes.map(cls => ({
            id: cls.id,
            title: cls.title,
            description: cls.description,
            duration: "45 min", // You might want to calculate this based on video length
            videoUrl: cls.videos[0]?.videoUrl || "",
            posterUrl: cls.videos[0]?.title || "",
            assessment: cls.assessments.map(assessment => ({
                id: assessment.id,
                title: assessment.title,
                questions: assessment.questions.map(q => ({
                    id: q.id,
                    question: q.text,
                    options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
                    correctAnswer: q.correctAnswer
                }))
            }))
        }));

        return NextResponse.json({
            success: true,
            data: transformedClasses
        });
    } catch (error) {
        console.error('Error fetching classes:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch classes' },
            { status: 500 }
        );
    }
}