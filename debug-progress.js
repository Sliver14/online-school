const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugProgress() {
  try {
    console.log('=== DEBUGGING PROGRESS DATA ===');
    
    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, firstName: true, lastName: true }
    });
    console.log('Users:', users);
    
    if (users.length > 0) {
      const userId = users[0].id;
      console.log(`\nChecking progress for user ${userId} (${users[0].email})`);
      
      // Get video progress
      const videoProgress = await prisma.userProgress.findMany({
        where: { userId },
        include: { video: { include: { class: true } } }
      });
      console.log('\nVideo Progress:', videoProgress.map(vp => ({
        videoId: vp.videoId,
        classId: vp.video.classId,
        classTitle: vp.video.class.title,
        watchedAt: vp.watchedAt
      })));
      
      // Get assessment progress
      const assessmentProgress = await prisma.userAssessment.findMany({
        where: { userId },
        include: { assessment: { include: { class: true } } }
      });
      console.log('\nAssessment Progress:', assessmentProgress.map(ap => ({
        assessmentId: ap.assessmentId,
        classId: ap.assessment.classId,
        classTitle: ap.assessment.class.title,
        score: ap.score,
        isPassed: ap.isPassed,
        completedAt: ap.completedAt
      })));
      
      // Get class timers
      const classTimers = await prisma.classTimers.findMany({
        where: { userId },
        include: { class: true }
      });
      console.log('\nClass Timers:', classTimers.map(ct => ({
        classId: ct.classId,
        classTitle: ct.class.title,
        timerActive: ct.timerActive,
        timerExpiresAt: ct.timerExpiresAt
      })));
      
      // Get all classes
      const classes = await prisma.class.findMany({
        include: {
          videos: true,
          assessments: true
        },
        orderBy: { order: 'asc' }
      });
      console.log('\nClasses:', classes.map(c => ({
        id: c.id,
        title: c.title,
        order: c.order,
        videoCount: c.videos.length,
        assessmentCount: c.assessments.length
      })));
    }
    
  } catch (error) {
    console.error('Error debugging progress:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugProgress(); 