//classes
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (id) {
            // Single class logic
            const classId = parseInt(id);
            if (isNaN(classId)) {
                return NextResponse.json(
                    { success: false, error: 'Invalid class ID' },
                    { status: 400 }
                );
            }

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
                    },
                    resources: {
                        orderBy: { order: 'asc' }
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
                posterUrl: classData.videos[0]?.videoPosterUrl || '',
                videos: classData.videos.map((video) => ({
                    id: video.id,
                    title: video.title,
                    videoUrl: video.videoUrl,
                    classNumber: video.classNumber,
                    videoPosterUrl: video.videoPosterUrl,
                    order: video.order
                })),
                assessments: classData.assessments.map((assessment) => ({
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
                })),
                resources: classData.resources
                    .filter(r => ['READ', 'VIDEO', 'LINK', 'NOTE'].includes(r.type))
                    .map((resource) => ({
                        id: resource.id,
                        title: resource.title,
                        type: resource.type,
                        content: resource.content,
                        resourceUrl: resource.resourceUrl,
                        order: resource.order,
                        createdAt: resource.createdAt,
                        updatedAt: resource.updatedAt
                    })),
                assignments: classData.resources
                    .filter(r => ['ESSAY', 'ASSIGNMENT'].includes(r.type))
                    .map((resource) => ({
                        id: resource.id,
                        title: resource.title,
                        type: resource.type,
                        content: resource.content,
                        resourceUrl: resource.resourceUrl,
                        requiresUpload: resource.requiresUpload,
                        order: resource.order,
                        createdAt: resource.createdAt,
                        updatedAt: resource.updatedAt
                    }))
            };

            return NextResponse.json({
                success: true,
                data: transformedClass
            });
        } else {
            // All classes logic
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

            const transformedClasses = classes.map(cls => {
                const firstVideo = cls.videos[0];

                return {
                    id: cls.id,
                    title: cls.title,
                    description: cls.description,
                    classNumber: firstVideo?.classNumber || "",
                    duration: "",
                    videoUrl: firstVideo?.videoUrl || "",
                    posterUrl: firstVideo?.videoPosterUrl || "",
                    assessments: cls.assessments.map(assessment => ({
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
        }
    } catch (error) {
        console.error('Error fetching classes:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch classes' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}