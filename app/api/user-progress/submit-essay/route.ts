import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/essays/submit
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, classId, content } = body;

        // Validate required fields
        if (!userId || !classId || !content) {
            return NextResponse.json(
                { success: false, error: 'UserId, classId, and content are required' },
                { status: 400 }
            );
        }

        // Verify user exists
        const userExists = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            select: { id: true, firstName: true, lastName: true }
        });

        if (!userExists) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Verify class exists
        const classExists = await prisma.class.findUnique({
            where: { id: parseInt(classId) },
            select: { id: true, title: true }
        });

        if (!classExists) {
            return NextResponse.json(
                { success: false, error: 'Class not found' },
                { status: 404 }
            );
        }

        // Check if essay already exists for this user and class
        const existingEssay = await prisma.classEssaySubmission.findFirst({
            where: {
                userId: parseInt(userId),
                classId: parseInt(classId)
            }
        });

        if (existingEssay) {
            // Essay exists - update it
            const updatedEssay = await prisma.classEssaySubmission.update({
                where: { id: existingEssay.id },
                data: {
                    content: content,
                    submittedAt: new Date(),
                    reviewed: false, // Reset review status
                    remarks: null    // Clear previous remarks
                }
            });

            return NextResponse.json({
                success: true,
                message: 'Essay updated successfully',
                data: {
                    id: updatedEssay.id,
                    userId: updatedEssay.userId,
                    classId: updatedEssay.classId,
                    content: updatedEssay.content,
                    submittedAt: updatedEssay.submittedAt,
                    reviewed: updatedEssay.reviewed,
                    remarks: updatedEssay.remarks,
                    isUpdate: true
                }
            });
        } else {
            // Essay doesn't exist - create new one
            const newEssay = await prisma.classEssaySubmission.create({
                data: {
                    userId: parseInt(userId),
                    classId: parseInt(classId),
                    content: content
                }
            });

            return NextResponse.json({
                success: true,
                message: 'Essay submitted successfully',
                data: {
                    id: newEssay.id,
                    userId: newEssay.userId,
                    classId: newEssay.classId,
                    content: newEssay.content,
                    submittedAt: newEssay.submittedAt,
                    reviewed: newEssay.reviewed,
                    remarks: newEssay.remarks,
                    isUpdate: false
                }
            }, { status: 201 });
        }

    } catch (error) {
        console.error('Error submitting essay:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to submit essay' },
            { status: 500 }
        );
    }
}

// GET /api/essays/submit?userId=1&classId=2 - Get user's essay for a specific class
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const classId = searchParams.get('classId');

        if (!userId || !classId) {
            return NextResponse.json(
                { success: false, error: 'UserId and classId are required' },
                { status: 400 }
            );
        }

        const essay = await prisma.classEssaySubmission.findFirst({
            where: {
                userId: parseInt(userId),
                classId: parseInt(classId)
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                class: {
                    select: {
                        id: true,
                        title: true,
                        description: true
                    }
                }
            }
        });

        if (!essay) {
            return NextResponse.json(
                { success: false, error: 'Essay not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                id: essay.id,
                content: essay.content,
                submittedAt: essay.submittedAt,
                reviewed: essay.reviewed,
                remarks: essay.remarks,
                user: essay.user,
                class: essay.class
            }
        });

    } catch (error) {
        console.error('Error fetching essay:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch essay' },
            { status: 500 }
        );
    }
}