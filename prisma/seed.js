const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create 8 classes without explicit IDs
  const classData = [
    {
      title: 'The New Creature',
      description: 'Understanding the transformation and identity of a born-again believer.',
      order: 1,
    },
    {
      title: 'The Holy Spirit',
      description: 'Exploring the role and power of the Holy Spirit in the life of a Christian.',
      order: 2,
    },
    {
      title: 'Christian Doctrines',
      description: 'Foundational teachings and beliefs of the Christian faith.',
      order: 3,
    },
    {
      title: 'Evangelism',
      description: 'Learning effective methods to share the Gospel with others.',
      order: 4,
    },
    {
      title: 'Introduction To Cell Ministry',
      description: 'An overview of cell group structures and their role in church growth.',
      order: 5,
    },
    {
      title: 'Christian Character And Prosperity',
      description: 'Developing godly character and understanding biblical prosperity.',
      order: 6,
    },
    {
      title: 'The Local Assembly And Loveworld Inc. (Christ Embassy)',
      description: 'Exploring the importance of the local church and the vision of Loveworld Inc.',
      order: 7,
    },
    {
      title: 'Introduction To Mobile Technology For Personal Growth, Evangelism And Church Growth',
      description: 'Using mobile technology for spiritual development and ministry outreach.',
      order: 8,
    },
  ];

  console.log('Seeding classes...');
  await prisma.class.createMany({
    data: classData,
    skipDuplicates: true, // Skip if a class with the same unique field (e.g., title, if unique) exists
  });

  // Fetch the created classes to get their generated IDs
  const createdClasses = await prisma.class.findMany({
    where: { title: { in: classData.map(c => c.title) } },
    select: { id: true, title: true },
    orderBy: { order: 'asc' },
  });

  // Map class titles to their generated IDs
  const classIdMap = createdClasses.reduce((map, cls, index) => {
    map[cls.title] = cls.id;
    map[index + 1] = cls.id; // Also map original order (1-based) to IDs for convenience
    return map;
  }, {});

  // Create videos, using the generated class IDs
  const videoData = [
    {
      classId: classIdMap['The New Creature'],
      title: 'The New Creature',
      videoUrl: 'https://d1ent1.loveworldcloud.com/~lwcgi/F.Sch%20C%201-6/Class%201.mp4',
      classNumber: 'Class One',
      videoPosterUrl: 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1750698646/bhxqutynfwmzvwav9qvn.jpg',
      order: 1,
    },
    {
      classId: classIdMap['The Holy Spirit'],
      title: 'The Holy Spirit',
      videoUrl: 'https://d1ent1.loveworldcloud.com/~lwcgi/F.Sch%20C%201-6/Class%202.mp4',
      classNumber: 'Class Two',
      videoPosterUrl: 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1750698644/tm6dab2ppv9dfrjorduh.jpg',
      order: 1,
    },
    {
      classId: classIdMap['Christian Doctrines'],
      title: 'Christian Doctrines',
      videoUrl: 'https://lwfoundationschool.org/online/wp-content/uploads/2025/02/FOUNDATION%20SHCHOOL%20CLASS%203.mp4',
      classNumber: 'Class Three',
      videoPosterUrl: 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1750698681/yshuzdtxjciwio6umqvx.jpg',
      order: 1,
    },
    {
      classId: classIdMap['Evangelism'],
      title: 'Evangelism',
      videoUrl: 'https://res.cloudinary.com/dfi8bpolg/video/upload/v1736329275/samples/cld-sample-video.mp4',
      classNumber: 'Class Four(A)',
      videoPosterUrl: 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1750698680/rzggefjjb6flfpgzqxpd.jpg',
      order: 1,
    },
    {
      classId: classIdMap['Introduction To Cell Ministry'],
      title: 'Introduction To Cell Ministry',
      videoUrl: 'https://d1ent1.loveworldcloud.com/~lwcgi/F.Sch%20C%201-6/Class%204B.mp4',
      classNumber: 'Class Four(B)',
      videoPosterUrl: 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1750698680/ums5dbfsot0bvuxcg6e9.jpg',
      order: 1,
    },
    {
      classId: classIdMap['Christian Character And Prosperity'],
      title: 'Christian Character And Prosperity',
      videoUrl: 'https://d1ent1.loveworldcloud.com/~lwcgi/F.Sch%20C%201-6/Class%205.mp4',
      classNumber: 'Class Five',
      videoPosterUrl: 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1750698673/kgckhesywqt2uiysbzqw.jpg',
      order: 1,
    },
    {
      classId: classIdMap['The Local Assembly And Loveworld Inc. (Christ Embassy)'],
      title: 'The Local Assembly And Loveworld Inc.(Christ Embassy)',
      videoUrl: 'https://d1ent1.loveworldcloud.com/~lwcgi/F.Sch%20C%201-6/Class%206.mp4',
      classNumber: 'Class Six',
      videoPosterUrl: 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1750698668/mz35ut5sxtg5y0cui9yt.jpg',
      order: 1,
    },
    {
      classId: classIdMap['Introduction To Mobile Technology For Personal Growth, Evangelism And Church Growth'],
      title: 'Introduction To Mobile Technology For Personal Growth, Evangelism And Church Growth',
      videoUrl: 'https://lwfoundationschool.org/online/wp-content/uploads/2023/08/LWFS%20CLASS%207%20TUTORIAL.mp4',
      classNumber: 'Class Seven',
      videoPosterUrl: 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1750698674/kfznhzvnd9uyxpk3fa7l.jpg',
      order: 1,
    },
  ];

  console.log('Seeding videos...');
  await prisma.video.createMany({
    data: videoData,
    skipDuplicates: true,
  });

  // Create resources, using the generated class IDs
  const resourceData = [
    // Class 1 Resources
    { classId: classIdMap['The New Creature'], title: 'Now That You Are Born Again', type: 'READ', resourceUrl: '#', order: 1 },
    { classId: classIdMap['The New Creature'], title: 'Recreating Your World', type: 'READ', resourceUrl: '#', order: 2 },
    { classId: classIdMap['The New Creature'], title: 'Jesus The Overcoming Life', type: 'VIDEO', resourceUrl: '#', order: 3 },
    { classId: classIdMap['The New Creature'], title: 'Explain your understanding of “if any man be in Christ he is a new creation” as stated in 2 Cor 5:17 using yourself as an example.', type: 'ESSAY', content: 'Explain your understanding of “if any man be in Christ he is a new creation” as stated in 2 Cor 5:17 using yourself as an example.', requiresUpload: true, order: 4 },
    { classId: classIdMap['The New Creature'], title: 'Will I be continually assured of my salvation despite what I feel or see?', type: 'ESSAY', content: 'Will I be continually assured of my salvation despite what I feel or see?', requiresUpload: true, order: 5 },

    // Class 2 Resources
    { classId: classIdMap['The Holy Spirit'], title: 'The Seven Spirits of God', type: 'READ', resourceUrl: '#', order: 1 },
    { classId: classIdMap['The Holy Spirit'], title: 'Seven Things the Holy Spirit will do in You', type: 'READ', resourceUrl: '#', order: 2 },
    { classId: classIdMap['The Holy Spirit'], title: 'Seven Things the Holy Spirit will do for You', type: 'READ', resourceUrl: '#', order: 3 },
    { classId: classIdMap['The Holy Spirit'], title: 'The Holy Spirit and You', type: 'READ', resourceUrl: '#', order: 4 },
    { classId: classIdMap['The Holy Spirit'], title: 'The Oil and the Mantle', type: 'READ', resourceUrl: '#', order: 5 },
    { classId: classIdMap['The Holy Spirit'], title: 'Read the Book “The Seven Spirits of God”', type: 'ASSIGNMENT', content: 'Read the Book “The Seven Spirits of God”', requiresUpload: false, order: 6 },
    { classId: classIdMap['The Holy Spirit'], title: 'Speak in Tongues for at least 10 Minutes each Day till the next class. Note observations or changes you notice about yourself, or specific thoughts or direction that you received as you prayed.', type: 'ESSAY', content: 'Speak in Tongues for at least 10 Minutes each Day till the next class. Note observations or changes you notice about yourself, or specific thoughts or direction that you received as you prayed.', requiresUpload: true, order: 7 },

    // Class 3 Resources
    { classId: classIdMap['Christian Doctrines'], title: 'Understanding Righteousness', type: 'VIDEO', resourceUrl: '#', order: 1 },
    { classId: classIdMap['Christian Doctrines'], title: '3 Important Laws', type: 'VIDEO', resourceUrl: '#', order: 2 },
    { classId: classIdMap['Christian Doctrines'], title: 'Apologetics vs Activism', type: 'VIDEO', resourceUrl: '#', order: 3 },
    { classId: classIdMap['Christian Doctrines'], title: 'Listen to the following Messages:\n1. Understanding Righteousness\n2. 3 Important Laws\n3. Apologetics vs Activism\n\nWrite 3 Striking things you learned and which you will put to work, from each message.', type: 'ESSAY', content: 'Listen to the following Messages:\n1. Understanding Righteousness\n2. 3 Important Laws\n3. Apologetics vs Activism\n\nWrite 3 Striking things you learned and which you will put to work, from each message.', requiresUpload: true, order: 4 },

    // Class 4 Resources
    { classId: classIdMap['Evangelism'], title: 'Join This Chariot', type: 'READ', resourceUrl: '#', order: 1 },
    { classId: classIdMap['Evangelism'], title: 'Seven Steps to Perfecting Soulwinning', type: 'READ', resourceUrl: '#', order: 2 },
    { classId: classIdMap['Evangelism'], title: 'Read the explanations of the Seven Steps to Perfecting Soulwinning', type: 'ASSIGNMENT', content: 'Read the explanations of the Seven Steps to Perfecting Soulwinning', requiresUpload: false, order: 3 },
    { classId: classIdMap['Evangelism'], title: 'Get your Personal Copy of “Join This Chariot”, read it, and answer the questions at end of each Chapter (in the Book).', type: 'ESSAY', content: 'Get your Personal Copy of “Join This Chariot”, read it, and answer the questions at end of each Chapter (in the Book).', requiresUpload: true, order: 4 },
    { classId: classIdMap['Evangelism'], title: 'Reach out to 2 people and bring them to church next week. Submit their names at the next class. Note any challenge or testimony you encountered, and share with us.', type: 'ESSAY', content: 'Reach out to 2 people and bring them to church next week. Submit their names at the next class. Note any challenge or testimony you encountered, and share with us.', requiresUpload: true, order: 5 },

    // Class 5 Resources
    { classId: classIdMap['Introduction To Cell Ministry'], title: 'Power of Your Mind', type: 'READ', resourceUrl: '#', order: 1 },
    { classId: classIdMap['Introduction To Cell Ministry'], title: 'Topical Teaching Highlights on Christian Growth and Maturity', type: 'VIDEO', resourceUrl: '#', order: 2 },
    { classId: classIdMap['Introduction To Cell Ministry'], title: 'Tithes and Offerings', type: 'VIDEO', resourceUrl: '#', order: 3 },
    { classId: classIdMap['Introduction To Cell Ministry'], title: 'Get Your Personal Copy of the Book “Power of Your Mind” and read it. Discuss 2 striking thoughts you received as you studied the Book and submit. It should be at least 1 page long.', type: 'ESSAY', content: 'Get Your Personal Copy of the Book “Power of Your Mind” and read it. Discuss 2 striking thoughts you received as you studied the Book and submit. It should be at least 1 page long.', requiresUpload: true, order: 4 },
    { classId: classIdMap['Introduction To Cell Ministry'], title: 'Download from PCDL and listen to “Topical Teaching Highlights on Christian Growth and Maturity”', type: 'ASSIGNMENT', content: 'Download from PCDL and listen to “Topical Teaching Highlights on Christian Growth and Maturity”', requiresUpload: false, order: 5 },
    { classId: classIdMap['Introduction To Cell Ministry'], title: 'Listen to the Message “Tithes and Offerings”. Sign up for at least one Partnership Arm', type: 'ESSAY', content: 'Listen to the Message “Tithes and Offerings”. Sign up for at least one Partnership Arm', requiresUpload: true, order: 6 },

    // Class 6 Resources (should map to 'Christian Character And Prosperity')
    { classId: classIdMap['Christian Character And Prosperity'], title: 'Power of Your Mind', type: 'READ', resourceUrl: '#', order: 1 },
    { classId: classIdMap['Christian Character And Prosperity'], title: 'Topical Teaching Highlights on Christian Growth and Maturity', type: 'VIDEO', resourceUrl: '#', order: 2 },
    { classId: classIdMap['Christian Character And Prosperity'], title: 'Tithes and Offerings', type: 'VIDEO', resourceUrl: '#', order: 3 },
    { classId: classIdMap['Christian Character And Prosperity'], title: 'Get Your Personal Copy of the Book “Power of Your Mind” and read it. Discuss 2 striking thoughts you received as you studied the Book and submit. It should be at least 1 page long.', type: 'ESSAY', content: 'Get Your Personal Copy of the Book “Power of Your Mind” and read it. Discuss 2 striking thoughts you received as you studied the Book and submit. It should be at least 1 page long.', requiresUpload: true, order: 4 },
    { classId: classIdMap['Christian Character And Prosperity'], title: 'Download from PCDL and listen to “Topical Teaching Highlights on Christian Growth and Maturity”', type: 'ASSIGNMENT', content: 'Download from PCDL and listen to “Topical Teaching Highlights on Christian Growth and Maturity”', requiresUpload: false, order: 5 },
    { classId: classIdMap['Christian Character And Prosperity'], title: 'Listen to the Message “Tithes and Offerings”. Sign up for at least one Partnership Arm', type: 'ESSAY', content: 'Listen to the Message “Tithes and Offerings”. Sign up for at least one Partnership Arm', requiresUpload: true, order: 6 },

    // Class 7 Resources
    { classId: classIdMap['The Local Assembly And Loveworld Inc. (Christ Embassy)'], title: 'Why We Must Go To Church (Pamphlet)', type: 'READ', resourceUrl: '#', order: 1 },
    { classId: classIdMap['The Local Assembly And Loveworld Inc. (Christ Embassy)'], title: 'The Church, Yesterday, Today and Forever', type: 'VIDEO', resourceUrl: '#', order: 2 },
    { classId: classIdMap['The Local Assembly And Loveworld Inc. (Christ Embassy)'], title: 'Special Study on “Why We Must Go To Church” and provide answers to the questions in the Pamphlet.', type: 'ESSAY', content: 'Special Study on “Why We Must Go To Church” and provide answers to the questions in the Pamphlet.', requiresUpload: true, order: 3 },
    { classId: classIdMap['The Local Assembly And Loveworld Inc. (Christ Embassy)'], title: 'Listen to the Special Message “The Church, Yesterday, Today and Forever”', type: 'ASSIGNMENT', content: 'Listen to the Special Message “The Church, Yesterday, Today and Forever”', requiresUpload: false, order: 4 },
  ];

  console.log('Seeding class resources...');
  await prisma.classResource.createMany({
    data: resourceData,
    skipDuplicates: true,
  });

  // Create 1 exam
  console.log('Seeding exam...');
  const exam = await prisma.exam.create({
    data: {
      title: 'Final Foundation School Exam',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create 10 exam questions
  const examQuestionData = [
    {
      examId: exam.id,
      text: 'What is the primary identity of the new creature in Christ?',
      options: ['A new spiritual being', 'A reformed sinner', 'A church member', 'A religious scholar'],
      correctAnswer: 'A new spiritual being',
    },
    {
      examId: exam.id,
      text: 'Who baptizes believers into the body of Christ according to the Holy Spirit class?',
      options: ['The Pastor', 'The Holy Spirit', 'Jesus Christ', 'The Apostles'],
      correctAnswer: 'The Holy Spirit',
    },
    {
      examId: exam.id,
      text: 'Which doctrine emphasizes that Jesus is both fully God and fully man?',
      options: ['Trinity', 'Atonement', 'Hypostatic Union', 'Resurrection'],
      correctAnswer: 'Hypostatic Union',
    },
    {
      examId: exam.id,
      text: 'What is the main purpose of evangelism?',
      options: ['Raising funds', 'Sharing the Gospel', 'Building churches', 'Teaching doctrine'],
      correctAnswer: 'Sharing the Gospel',
    },
    {
      examId: exam.id,
      text: 'What is the primary function of cell groups in church ministry?',
      options: ['Organizing events', 'Fellowship and discipleship', 'Fundraising', 'Construction'],
      correctAnswer: 'Fellowship and discipleship',
    },
    {
      examId: exam.id,
      text: 'Which characteristic is emphasized as key to Christian character?',
      options: ['Wealth', 'Humility', 'Popularity', 'Power'],
      correctAnswer: 'Humility',
    },
    {
      examId: exam.id,
      text: 'What is the core mission of Loveworld Inc.?',
      options: ['Education', 'Global ministry and evangelism', 'Healthcare', 'Technology'],
      correctAnswer: 'Global ministry and evangelism',
    },
    {
      examId: exam.id,
      text: 'How does mobile technology support evangelism?',
      options: ['Building websites', 'Spreading the Gospel via apps', 'Hosting concerts', 'Printing books'],
      correctAnswer: 'Spreading the Gospel via apps',
    },
    {
      examId: exam.id,
      text: 'What is one way to receive the Holy Spirit?',
      options: ['Fasting for 40 days', 'Praying with faith to receive Him', 'Joining a choir', 'Reading the Bible daily'],
      correctAnswer: 'Praying with faith to receive Him',
    },
    {
      examId: exam.id,
      text: 'What does the term "new creature" signify in Christian doctrine?',
      options: ['A new physical body', 'A transformed spiritual identity', 'A new church role', 'A new career path'],
      correctAnswer: 'A transformed spiritual identity',
    },
  ];

  console.log('Seeding exam questions...');
  await prisma.examQuestion.createMany({
    data: examQuestionData,
    skipDuplicates: true,
  });

  // Create 8 assessments
  const assessmentData = [
    { classId: classIdMap['The New Creature'], title: 'New Creature Quiz' },
    { classId: classIdMap['The Holy Spirit'], title: 'Holy Spirit Assessment' },
    { classId: classIdMap['Christian Doctrines'], title: 'Christian Doctrines Quiz' },
    { classId: classIdMap['Evangelism'], title: 'Evangelism Assessment' },
    { classId: classIdMap['Introduction To Cell Ministry'], title: 'Cell Ministry Quiz' },
    { classId: classIdMap['Christian Character And Prosperity'], title: 'Christian Character Quiz' },
    { classId: classIdMap['The Local Assembly And Loveworld Inc. (Christ Embassy)'], title: 'Local Assembly Assessment' },
    { classId: classIdMap['Introduction To Mobile Technology For Personal Growth, Evangelism And Church Growth'], title: 'Mobile Technology Quiz' },
  ];

  console.log('Seeding assessments...');
  await prisma.assessment.createMany({
    data: assessmentData,
    skipDuplicates: true,
  });

  // Fetch created assessments to map their IDs
  const createdAssessments = await prisma.assessment.findMany({
    where: { title: { in: assessmentData.map(a => a.title) } },
    select: { id: true, title: true },
  });

  const assessmentIdMap = createdAssessments.reduce((map, ass) => {
    map[ass.title] = ass.id;
    return map;
  }, {});

  // Create questions
  const questionData = [
    // Question for Class 1
    {
      assessmentId: assessmentIdMap['New Creature Quiz'],
      text: 'What does it mean to be a "new creature" in Christ?',
      options: ['A new spiritual identity', 'A physical transformation', 'Joining a new church', 'Learning new skills'],
      correctAnswer: 'A new spiritual identity',
    },
    // Questions for Class 2 (Holy Spirit)
    {
      assessmentId: assessmentIdMap['Holy Spirit Assessment'],
      text: 'The Pentecost is not a Christian feast but rather refers to a _______ celebration.',
      options: ['Greek', 'Jewish', 'English', 'German'],
      correctAnswer: 'Jewish',
    },
    {
      assessmentId: assessmentIdMap['Holy Spirit Assessment'],
      text: '___________ baptizes you into the body of Christ.',
      options: ['The Holy Spirit', 'God', 'Our Lord Jesus', 'Your Pastor'],
      correctAnswer: 'The Holy Spirit',
    },
    {
      assessmentId: assessmentIdMap['Holy Spirit Assessment'],
      text: 'Being baptized into the Holy Spirit and receiving the Holy Spirit are the same experience?',
      options: ['True', 'False', 'Not really', 'None of the above'],
      correctAnswer: 'False',
    },
    {
      assessmentId: assessmentIdMap['Holy Spirit Assessment'],
      text: 'You can’t receive a double anointing because',
      options: [
        'The Holy Spirit is given in fullness once',
        'The one who gives the anointing is in you in His fullness',
        'It is reserved for pastors only',
        'It is not biblical',
      ],
      correctAnswer: 'The one who gives the anointing is in you in His fullness',
    },
    {
      assessmentId: assessmentIdMap['Holy Spirit Assessment'],
      text: 'The Holy Spirit Proceeds _____________ the father',
      options: ['With', 'To', 'From', 'Away'],
      correctAnswer: 'From',
    },
    {
      assessmentId: assessmentIdMap['Holy Spirit Assessment'],
      text: 'How does God live in you?',
      options: ['By His Grace', 'By His mercy', 'By His Spirit', 'By His love'],
      correctAnswer: 'By His Spirit',
    },
    {
      assessmentId: assessmentIdMap['Holy Spirit Assessment'],
      text: 'One of the ways to receive the Holy Spirit is',
      options: [
        'By studying the Word voraciously',
        'By fasting consistently',
        'By praying with faith to receive Him',
        'By attending church regularly',
      ],
      correctAnswer: 'By praying with faith to receive Him',
    },
    {
      assessmentId: assessmentIdMap['Holy Spirit Assessment'],
      text: 'Speaking in tongues is all but one of the following',
      options: [
        'A way to edify oneself',
        'A sign of the Holy Spirit',
        'A human language not understood by the speaker',
        'A way to glorify God',
      ],
      correctAnswer: 'A human language not understood by the speaker',
    },
    {
      assessmentId: assessmentIdMap['Holy Spirit Assessment'],
      text: 'The Seven Spirits of God include all but',
      options: ['Spirit of Peace', 'Spirit of Might', 'Spirit of Counsel', 'Spirit of Knowledge'],
      correctAnswer: 'Spirit of Peace',
    },
    {
      assessmentId: assessmentIdMap['Holy Spirit Assessment'],
      text: 'One of these is a gift of the Spirit as listed in 1 Cor. 12: 8 - 10',
      options: ['Word of Wisdom', 'New levels of Grace', 'Peace of mind', 'Greater Anointing'],
      correctAnswer: 'Word of Wisdom',
    },
    // Question for Class 3
    {
      assessmentId: assessmentIdMap['Christian Doctrines Quiz'],
      text: 'Which doctrine teaches that Jesus is both God and man?',
      options: ['Trinity', 'Hypostatic Union', 'Salvation', 'Baptism'],
      correctAnswer: 'Hypostatic Union',
    },
    // Question for Class 4
    {
      assessmentId: assessmentIdMap['Evangelism Assessment'],
      text: 'What is the primary goal of evangelism?',
      options: ['Selling books', 'Sharing the Gospel', 'Building churches', 'Hosting events'],
      correctAnswer: 'Sharing the Gospel',
    },
    // Question for Class 5
    {
      assessmentId: assessmentIdMap['Cell Ministry Quiz'],
      text: 'What is the main purpose of a cell group in church ministry?',
      options: ['Fundraising', 'Fellowship and discipleship', 'Organizing concerts', 'Building facilities'],
      correctAnswer: 'Fellowship and discipleship',
    },
    // Question for Class 6
    {
      assessmentId: assessmentIdMap['Christian Character Quiz'],
      text: 'What is a key aspect of Christian character according to the Bible?',
      options: ['Wealth accumulation', 'Humility', 'Fame', 'Power'],
      correctAnswer: 'Humility',
    },
    // Question for Class 7
    {
      assessmentId: assessmentIdMap['Local Assembly Assessment'],
      text: 'What is Loveworld Inc. primarily focused on?',
      options: ['Real estate', 'Global ministry and evangelism', 'Manufacturing', 'Education'],
      correctAnswer: 'Global ministry and evangelism',
    },
    // Question for Class 8
    {
      assessmentId: assessmentIdMap['Mobile Technology Quiz'],
      text: 'How can mobile technology aid evangelism?',
      options: ['Cooking meals', 'Spreading the Gospel via apps', 'Building houses', 'Driving outreach'],
      correctAnswer: 'Spreading the Gospel via apps',
    },
  ];

  console.log('Seeding questions...');
  await prisma.question.createMany({
    data: questionData,
    skipDuplicates: true,
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });