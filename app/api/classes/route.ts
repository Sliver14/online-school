// app/api/classes/route.ts
import { NextResponse } from 'next/server';
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
        const transformedClasses = classes.map(cls => {
            const firstVideo = cls.videos[0];

            // You can add duration if you later have a field like `lengthInMinutes` in the Video model
            // const totalDuration = cls.videos.length * 5; // assuming 5 minutes per video

            return {
                id: cls.id,
                title: cls.title,
                description: cls.description,
                classNumber: firstVideo?.classNumber || "", // ✅ classNumber from Video
                duration: ``,           //
                videoUrl: firstVideo?.videoUrl || "",
                posterUrl: firstVideo?.videoPosterUrl || "", // ✅ using videoPosterUrl from Video
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
            };
        });

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
