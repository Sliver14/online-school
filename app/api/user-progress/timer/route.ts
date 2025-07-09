// app/api/user-progress/timer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Start/Reset timer for a specific video progress
export async function POST(request: NextRequest) {
    try {
        const { userId, videoId, timerDurationHours = 24 } = await request.json();

        if (!userId || !videoId) {
            return NextResponse.json(
                { success: false, error: 'UserId and videoId are required' },
                { status: 400 }
            );
        }

        // Find the user progress entry
        const userProgress = await prisma.userProgress.findFirst({
            where: {
                userId: parseInt(userId),
                videoId: parseInt(videoId)
            }
        });

        if (!userProgress) {
            return NextResponse.json(
                { success: false, error: 'Video progress not found. User must watch video first.' },
                { status: 404 }
            );
        }

        // Calculate new expiration time
        const timerExpiresAt = new Date(Date.now() + (timerDurationHours * 60 * 60 * 1000));

        // Update timer
        const updatedProgress = await prisma.userProgress.update({
            where: { id: userProgress.id },
            data: {
                timerActive: true,
                timerExpiresAt: timerExpiresAt
            },
            include: {
                video: {
                    select: {
                        id: true,
                        title: true,
                        classNumber: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Timer started successfully',
            data: {
                id: updatedProgress.id,
                userId: updatedProgress.userId,
                videoId: updatedProgress.videoId,
                timerActive: updatedProgress.timerActive,
                timerExpiresAt: updatedProgress.timerExpiresAt,
                timeRemaining: timerExpiresAt.getTime() - Date.now(),
                video: updatedProgress.video
            }
        });
    } catch (error) {
        console.error('Error starting timer:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to start timer' },
            { status: 500 }
        );
    }
}

// PUT - Extend or modify existing timer
export async function PUT(request: NextRequest) {
    try {
        const { userId, videoId, additionalHours, newDurationHours } = await request.json();

        if (!userId || !videoId) {
            return NextResponse.json(
                { success: false, error: 'UserId and videoId are required' },
                { status: 400 }
            );
        }

        // Find the user progress entry
        const userProgress = await prisma.userProgress.findFirst({
            where: {
                userId: parseInt(userId),
                videoId: parseInt(videoId)
            }
        });

        if (!userProgress) {
            return NextResponse.json(
                { success: false, error: 'Video progress not found' },
                { status: 404 }
            );
        }

        let newExpirationTime: Date;

        if (newDurationHours) {
            // Set completely new duration from now
            newExpirationTime = new Date(Date.now() + (newDurationHours * 60 * 60 * 1000));
        } else if (additionalHours) {
            // Add time to existing expiration (or from now if expired)
            const currentExpiration = userProgress.timerExpiresAt?.getTime() || Date.now();
            const baseTime = Math.max(currentExpiration, Date.now());
            newExpirationTime = new Date(baseTime + (additionalHours * 60 * 60 * 1000));
        } else {
            return NextResponse.json(
                { success: false, error: 'Either additionalHours or newDurationHours is required' },
                { status: 400 }
            );
        }

        // Update timer
        const updatedProgress = await prisma.userProgress.update({
            where: { id: userProgress.id },
            data: {
                timerActive: true,
                timerExpiresAt: newExpirationTime
            },
            include: {
                video: {
                    select: {
                        id: true,
                        title: true,
                        classNumber: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Timer updated successfully',
            data: {
                id: updatedProgress.id,
                userId: updatedProgress.userId,
                videoId: updatedProgress.videoId,
                timerActive: updatedProgress.timerActive,
                timerExpiresAt: updatedProgress.timerExpiresAt,
                timeRemaining: newExpirationTime.getTime() - Date.now(),
                video: updatedProgress.video
            }
        });
    } catch (error) {
        console.error('Error updating timer:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update timer' },
            { status: 500 }
        );
    }
}

// DELETE - Stop/Deactivate timer
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const videoId = searchParams.get('videoId');

        if (!userId || !videoId) {
            return NextResponse.json(
                { success: false, error: 'UserId and videoId are required' },
                { status: 400 }
            );
        }

        // Find the user progress entry
        const userProgress = await prisma.userProgress.findFirst({
            where: {
                userId: parseInt(userId),
                videoId: parseInt(videoId)
            }
        });

        if (!userProgress) {
            return NextResponse.json(
                { success: false, error: 'Video progress not found' },
                { status: 404 }
            );
        }

        // Deactivate timer
        const updatedProgress = await prisma.userProgress.update({
            where: { id: userProgress.id },
            data: {
                timerActive: false,
                timerExpiresAt: null
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Timer stopped successfully',
            data: {
                id: updatedProgress.id,
                userId: updatedProgress.userId,
                videoId: updatedProgress.videoId,
                timerActive: updatedProgress.timerActive,
                timerExpiresAt: updatedProgress.timerExpiresAt
            }
        });
    } catch (error) {
        console.error('Error stopping timer:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to stop timer' },
            { status: 500 }
        );
    }
}

// GET - Check timer status and cleanup expired timers
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const cleanupExpired = searchParams.get('cleanup') === 'true';

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'UserId is required' },
                { status: 400 }
            );
        }

        // Get all active timers for the user
        const userProgress = await prisma.userProgress.findMany({
            where: {
                userId: parseInt(userId),
                timerActive: true
            },
            include: {
                video: {
                    select: {
                        id: true,
                        title: true,
                        classNumber: true,
                        classId: true
                    }
                }
            }
        });

        const now = Date.now();
        const activeTimers = [];
        const expiredTimers = [];

        for (const progress of userProgress) {
            const isExpired = progress.timerExpiresAt && progress.timerExpiresAt.getTime() < now;
            const timeRemaining = progress.timerExpiresAt 
                ? Math.max(0, progress.timerExpiresAt.getTime() - now)
                : 0;

            const timerData = {
                id: progress.id,
                userId: progress.userId,
                videoId: progress.videoId,
                watchedAt: progress.watchedAt,
                timerExpiresAt: progress.timerExpiresAt,
                timeRemaining,
                isExpired,
                video: progress.video
            };

            if (isExpired) {
                expiredTimers.push(timerData);
                
                // Auto-cleanup expired timers if requested
                if (cleanupExpired) {
                    await prisma.userProgress.update({
                        where: { id: progress.id },
                        data: { timerActive: false }
                    });
                }
            } else {
                activeTimers.push(timerData);
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                activeTimers,
                expiredTimers,
                totalActiveTimers: activeTimers.length,
                totalExpiredTimers: expiredTimers.length,
                cleanedUp: cleanupExpired ? expiredTimers.length : 0
            }
        });
    } catch (error) {
        console.error('Error checking timer status:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to check timer status' },
            { status: 500 }
        );
    }
}