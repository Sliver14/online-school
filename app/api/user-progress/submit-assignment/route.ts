import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId, classId, resourceId, content, text } = await request.json();

    // Validate inputs
    if (!userId || !classId || !resourceId || !content || !text) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userId, classId, resourceId, content, text' },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId);
    const classIdNum = parseInt(classId);
    const resourceIdNum = parseInt(resourceId);

    if (isNaN(userIdNum) || isNaN(classIdNum) || isNaN(resourceIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid userId, classId, or resourceId' },
        { status: 400 }
      );
    }

    // Validate resource
    const resource = await prisma.classResource.findUnique({
      where: { id: resourceIdNum },
    });

    if (!resource || resource.classId !== classIdNum || resource.type !== 'ESSAY' || !resource.requiresUpload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or non-uploadable resource' },
        { status: 400 }
      );
    }

    // Validate text length (optional, adjust as needed)
    if (text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Text submission cannot be empty' },
        { status: 400 }
      );
    }
    if (text.length > 10000) { // Example max length
      return NextResponse.json(
        { success: false, error: 'Text submission exceeds maximum length of 10,000 characters' },
        { status: 400 }
      );
    }

    // Create ClassAssignmentSubmission
    const submission = await prisma.classAssignmentSubmission.create({
      data: {
        userId: userIdNum,
        classId: classIdNum,
        content,
        text,
        submittedAt: new Date(),
        reviewed: false,
        remarks: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Assignment submitted successfully',
      data: {
        submissionId: submission.id,
        resourceId: resourceIdNum,
      },
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit assignment' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}