import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const { userId, classId, timerExpiresAt, timerActive } = await request.json();

        if (!userId || !classId) {
            return NextResponse.json(
                { success: false, error: 'userId and classId are required' },
                { status: 400 }
            );
        }

        // Verify the class exists
        const classData = await prisma.class.findUnique({
            where: { id: classId },
            select: { id: true, title: true }
        });

        if (!classData) {
            return NextResponse.json(
                { success: false, error: 'Class not found' },
                { status: 404 }
            );
        }

        // Check if timer already exists
        const existingTimer = await prisma.classTimers.findUnique({
            where: { userId_classId: { userId, classId } }
        });

        let timerData;

        if (!existingTimer) {
            // Create new timer entry
            timerData = await prisma.classTimers.create({
                data: {
                    userId,
                    classId,
                    timerExpiresAt: timerExpiresAt ? new Date(timerExpiresAt) : null,
                    timerActive: timerActive || false
                }
            });
        } else {
            // Update existing timer
            const updateData: any = {};
            if (timerExpiresAt) {
                updateData.timerExpiresAt = new Date(timerExpiresAt);
            }
            if (typeof timerActive !== 'undefined') {
                updateData.timerActive = timerActive;
            }

            if (Object.keys(updateData).length > 0) {
                timerData = await prisma.classTimers.update({
                    where: { userId_classId: { userId, classId } },
                    data: updateData
                });
            } else {
                timerData = existingTimer;
            }
        }

        return NextResponse.json({
            success: true,
            message: timerActive ? 'Timer activated' : 'Timer updated',
            data: {
                id: timerData.id,
                userId: timerData.userId,
                classId: timerData.classId,
                timerActive: timerData.timerActive,
                timerExpiresAt: timerData.timerExpiresAt,
                timeRemaining: timerData.timerExpiresAt
                    ? Math.max(0, timerData.timerExpiresAt.getTime() - Date.now())
                    : null
            }
        });
    } catch (error) {
        console.error('Error updating class timer:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update class timer' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const classId = searchParams.get('classId');

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'UserId is required' },
                { status: 400 }
            );
        }

        let whereClause: any = { userId: parseInt(userId) };

        if (classId) {
            whereClause.classId = parseInt(classId);
        }

        const timers = await prisma.classTimers.findMany({
            where: whereClause,
            include: {
                class: {
                    select: { id: true, title: true }
                }
            }
        });

        const processedTimers = timers.map(timer => {
            const now = Date.now();
            const isTimerExpired = timer.timerExpiresAt && timer.timerExpiresAt.getTime() < now;
            const timeRemaining = timer.timerExpiresAt
                ? Math.max(0, timer.timerExpiresAt.getTime() - now)
                : null;

            return {
                id: timer.id,
                userId: timer.userId,
                classId: timer.classId,
                timerActive: timer.timerActive && !isTimerExpired,
                timerExpiresAt: timer.timerExpiresAt,
                timeRemaining,
                isTimerExpired,
                class: timer.class
            };
        });

        return NextResponse.json({
            success: true,
            data: processedTimers
        });
    } catch (error) {
        console.error('Error fetching class timers:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch class timers' },
            { status: 500 }
        );
    }
}