// import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// // Define request body type
// interface VideoWatchedRequest {
//   userId: number;
//   classId: number;
//   videoId?: number;
//   watchedAt?: string | Date;
// }

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json() as VideoWatchedRequest;
//     const { userId, classId, videoId, watchedAt } = body;

//     if (!userId || !classId) {
//       return NextResponse.json(
//         { success: false, error: 'userId and classId are required' },
//         { status: 400 }
//       );
//     }

//     let targetVideoId = videoId;

//     // If no specific videoId provided, find the first video of the class
//     if (!targetVideoId) {
//       const video = await prisma.video.findFirst({
//         where: { classId },
//         orderBy: { order: 'asc' },
//       });

//       if (!video) {
//         return NextResponse.json(
//           { success: false, error: 'Video not found' },
//           { status: 404 }
//         );
//       }
//       targetVideoId = video.id;
//     }

//     // Verify the video exists
//     const video = await prisma.video.findUnique({
//       where: { id: targetVideoId },
//       include: {
//         class: {
//           select: { id: true, title: true },
//         },
//       },
//     });

//     if (!video) {
//       return NextResponse.json(
//         { success: false, error: 'Video not found' },
//         { status: 404 }
//       );
//     }

//     // Check if progress already exists
//     const existingProgress = await prisma.userProgress.findFirst({
//       where: {
//         userId,
//         videoId: targetVideoId,
//       },
//     });

//     let progressData;

//     if (!existingProgress) {
//       // Create new progress entry
//       progressData = await prisma.userProgress.create({
//         data: {
//           userId,
//           videoId: targetVideoId,
//           watchedAt: watchedAt ? new Date(watchedAt) : undefined, // Use undefined for default
//         },
//       });
//     } else {
//       // Update existing progress
//       const updateData: { watchedAt?: Date } = {};
//       if (watchedAt && !existingProgress.watchedAt) {
//         updateData.watchedAt = new Date(watchedAt);
//       }

//       if (Object.keys(updateData).length > 0) {
//         progressData = await prisma.userProgress.update({
//           where: { id: existingProgress.id },
//           data: updateData,
//         });
//       } else {
//         progressData = existingProgress;
//       }
//     }

//     // Get updated progress with video info
//     const updatedProgress = await prisma.userProgress.findUnique({
//       where: { id: progressData.id },
//       include: {
//         video: {
//           select: {
//             id: true,
//             title: true,
//             classNumber: true,
//             order: true,
//           },
//         },
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: 'Video progress updated',
//       data: {
//         id: updatedProgress!.id,
//         userId: updatedProgress!.userId,
//         videoId: updatedProgress!.videoId,
//         watchedAt: updatedProgress!.watchedAt,
//         video: updatedProgress!.video,
//       },
//     });
//   } catch (error) {
//     console.error('Error updating video progress:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to update video progress' },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const userId = searchParams.get('userId');
//     const videoId = searchParams.get('videoId');
//     const classId = searchParams.get('classId');

//     if (!userId) {
//       return NextResponse.json(
//         { success: false, error: 'UserId is required' },
//         { status: 400 }
//       );
//     }

//     const userIdNum = parseInt(userId);
//     if (isNaN(userIdNum)) {
//       return NextResponse.json(
//         { success: false, error: 'Invalid userId' },
//         { status: 400 }
//       );
//     }

//     const whereClause: any = { userId: userIdNum };

//     if (videoId) {
//       const videoIdNum = parseInt(videoId);
//       if (isNaN(videoIdNum)) {
//         return NextResponse.json(
//           { success: false, error: 'Invalid videoId' },
//           { status: 400 }
//         );
//       }
//       whereClause.videoId = videoIdNum;
//     }

//     if (classId) {
//       const classIdNum = parseInt(classId);
//       if (isNaN(classIdNum)) {
//         return NextResponse.json(
//           { success: false, error: 'Invalid classId' },
//           { status: 400 }
//         );
//       }
//       whereClause.video = {
//         classId: classIdNum,
//       };
//     }

//     const userProgress = await prisma.userProgress.findMany({
//       where: whereClause,
//       include: {
//         video: {
//           select: {
//             id: true,
//             title: true,
//             classNumber: true,
//             order: true,
//             classId: true,
//           },
//         },
//       },
//       orderBy: {
//         video: {
//           order: 'asc',
//         },
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       data: userProgress.map((progress) => ({
//         id: progress.id,
//         userId: progress.userId,
//         videoId: progress.videoId,
//         watchedAt: progress.watchedAt,
//         video: progress.video,
//       })),
//     });
//   } catch (error) {
//     console.error('Error fetching video progress:', error);
//     return NextResponse.json(
//       { success: false, error: 'Failed to fetch video progress' },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define request body type
interface VideoWatchedRequest {
  userId: number;
  classId: number;
  videoId?: number;
  watchedAt?: string | Date;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as VideoWatchedRequest;
    const { userId, classId, videoId, watchedAt } = body;

    if (!userId || !classId) {
      return NextResponse.json(
        { success: false, error: 'userId and classId are required' },
        { status: 400 }
      );
    }

    let targetVideoId = videoId;

    // If no specific videoId provided, find the first video of the class
    if (!targetVideoId) {
      const video = await prisma.video.findFirst({
        where: { classId },
        orderBy: { order: 'asc' },
      });

      if (!video) {
        return NextResponse.json(
          { success: false, error: 'Video not found' },
          { status: 404 }
        );
      }
      targetVideoId = video.id;
    }

    // Verify the video exists
    const video = await prisma.video.findUnique({
      where: { id: targetVideoId },
      include: {
        class: {
          select: { id: true, title: true },
        },
      },
    });

    if (!video) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    // Check if progress already exists and is watched
    const existingProgress = await prisma.userProgress.findFirst({
      where: {
        userId,
        videoId: targetVideoId,
      },
    });

    if (existingProgress?.watchedAt) {
      // Video is already marked as watched, return early
      const updatedProgress = await prisma.userProgress.findUnique({
        where: { id: existingProgress.id },
        include: {
          video: {
            select: {
              id: true,
              title: true,
              classNumber: true,
              order: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Video already completed',
        data: {
          id: updatedProgress!.id,
          userId: updatedProgress!.userId,
          videoId: updatedProgress!.videoId,
          watchedAt: updatedProgress!.watchedAt,
          video: updatedProgress!.video,
        },
      });
    }

    // Create new progress entry if not watched
    const progressData = await prisma.userProgress.create({
      data: {
        userId,
        videoId: targetVideoId,
        watchedAt: watchedAt ? new Date(watchedAt) : new Date(), // Set watchedAt if provided, otherwise use now
      },
    });

    // Get updated progress with video info
    const updatedProgress = await prisma.userProgress.findUnique({
      where: { id: progressData.id },
      include: {
        video: {
          select: {
            id: true,
            title: true,
            classNumber: true,
            order: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Video progress updated',
      data: {
        id: updatedProgress!.id,
        userId: updatedProgress!.userId,
        videoId: updatedProgress!.videoId,
        watchedAt: updatedProgress!.watchedAt,
        video: updatedProgress!.video,
      },
    });
  } catch (error) {
    console.error('Error updating video progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update video progress' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const videoId = searchParams.get('videoId');
    const classId = searchParams.get('classId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'UserId is required' },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid userId' },
        { status: 400 }
      );
    }

    const whereClause: any = { userId: userIdNum };

    if (videoId) {
      const videoIdNum = parseInt(videoId);
      if (isNaN(videoIdNum)) {
        return NextResponse.json(
          { success: false, error: 'Invalid videoId' },
          { status: 400 }
        );
      }
      whereClause.videoId = videoIdNum;
    }

    if (classId) {
      const classIdNum = parseInt(classId);
      if (isNaN(classIdNum)) {
        return NextResponse.json(
          { success: false, error: 'Invalid classId' },
          { status: 400 }
        );
      }
      whereClause.video = {
        classId: classIdNum,
      };
    }

    const userProgress = await prisma.userProgress.findMany({
      where: whereClause,
      include: {
        video: {
          select: {
            id: true,
            title: true,
            classNumber: true,
            order: true,
            classId: true,
          },
        },
      },
      orderBy: {
        video: {
          order: 'asc',
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: userProgress.map((progress) => ({
        id: progress.id,
        userId: progress.userId,
        videoId: progress.videoId,
        watchedAt: progress.watchedAt,
        video: progress.video,
      })),
    });
  } catch (error) {
    console.error('Error fetching video progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch video progress' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}