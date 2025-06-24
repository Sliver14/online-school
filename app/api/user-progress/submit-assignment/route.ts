import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;
    const classId = formData.get('classId') as string | null;
    const resourceId = formData.get('resourceId') as string | null;
    const content = formData.get('content') as string | null;

    // Validate inputs
    if (!file || !userId || !classId || !resourceId || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: file, userId, classId, resourceId, content' },
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

    // Validate file type and size
    const allowedTypes = ['application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only PDF allowed.' },
        { status: 400 }
      );
    }
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 5MB limit.' },
        { status: 400 }
      );
    }

    // Save file (local storage; consider Cloudinary/S3 for production)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = join(process.cwd(), 'uploads', fileName);
    await writeFile(filePath, buffer);

    // Create ClassAssignmentSubmission
    const submission = await prisma.classAssignmentSubmission.create({
      data: {
        userId: userIdNum,
        classId: classIdNum,
        content,
        filePath,
        submittedAt: new Date(),
        reviewed: false,
        remarks: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Assignment submitted successfully',
      data: {
        fileName,
        filePath,
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