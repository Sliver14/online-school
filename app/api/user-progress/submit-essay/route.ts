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
    const content = formData.get('content') as string | null;

    // Validate inputs
    if (!file || !userId || !classId || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: file, userId, classId, content' },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId);
    const classIdNum = parseInt(classId);

    if (isNaN(userIdNum) || isNaN(classIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid userId or classId' },
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

    // Save file (local storage; consider S3 for production)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = join(process.cwd(), 'uploads', fileName);
    await writeFile(filePath, buffer);

    // Create ClassEssaySubmission
    const submission = await prisma.classEssaySubmission.create({
      data: {
        userId: userIdNum,
        classId: classIdNum,
        content,
        submittedAt: new Date(),
        reviewed: false,
        remarks: null,
        // Store file path as part of content or add a new field if needed
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Essay submitted successfully',
      data: {
        fileName,
        filePath,
        submissionId: submission.id,
      },
    });
  } catch (error) {
    console.error('Error submitting essay:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit essay' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}