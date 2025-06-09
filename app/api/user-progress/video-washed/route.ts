// app/api/user-progress/video-watched/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const { userId, classId } = await request.json();

        // Find the first video of the class
        const video = await prisma.video.findFirst({
            where: { classId },
            orderBy: { order: 'asc' }
        });

        if (!video) {
            return NextResponse.json(
                { success: false, error: 'Video not found' },
                { status: 404 }
            );
        }

        // Check if progress already exists
        const existingProgress = await prisma.userProgress.findFirst({
            where: {
                userId,
                videoId: video.id
            }
        });

        if (!existingProgress) {
            await prisma.userProgress.create({
                data: {
                    userId,
                    videoId: video.id
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Video progress updated'
        });
    } catch (error) {
        console.error('Error updating video progress:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update video progress' },
            { status: 500 }
        );
    }
}