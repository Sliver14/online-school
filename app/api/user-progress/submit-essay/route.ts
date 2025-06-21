import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string;
    const classId = formData.get('classId') as string;
    const content = formData.get('content') as string;

    // Validate inputs
    if (!file || !userId || !classId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Validate file type and size
    const allowedTypes = ['application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid file type. Only PDF allowed.' }, { status: 400 });
    }
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: 'File size exceeds 5MB limit.' }, { status: 400 });
    }

    // Save file (local storage; consider S3 for production)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(process.cwd(), 'uploads', `${Date.now()}_${file.name}`);
    await writeFile(filePath, buffer);

    // Update UserProgress
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_classId: {
          userId: parseInt(userId),
          classId: parseInt(classId),
        },
      },
      update: {
        essaySubmitted: true,
        essayFilePath: filePath,
        updatedAt: new Date(),
      },
      create: {
        userId: parseInt(userId),
        classId: parseInt(classId),
        essaySubmitted: true,
        essayFilePath: filePath,
        videoWatched: false,
        assessmentCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Essay submitted successfully',
      data: {
        fileName: file.name,
        filePath,
        progressId: progress.id,
      },
    });
  } catch (error) {
    console.error('Error submitting essay:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit essay' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
