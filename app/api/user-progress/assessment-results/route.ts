import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Cache responses for 1 hour
export const revalidate = 3600;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId, 10);

    if (isNaN(userIdNum) || userIdNum <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const assessmentResults = await prisma.class.findMany({
      include: {
        assessments: {
          include: {
            submissions: {
              where: { userId: userIdNum },
              orderBy: { completedAt: 'desc' },
              select: {
                id: true,
                score: true,
                isPassed: true,
                completedAt: true,
              },
            },
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    const data = assessmentResults.map((cls) => ({
      classId: cls.id,
      assessments: cls.assessments.map((assessment) => ({
        assessmentId: assessment.id,
        title: assessment.title,
        isPassed: assessment.submissions[0]?.isPassed || false,
        score: assessment.submissions[0]?.score || null,
        completedAt: assessment.submissions[0]?.completedAt || null,
      })),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching assessment results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessment results', details: error.message },
      { status: 500 }
    );
  }
}