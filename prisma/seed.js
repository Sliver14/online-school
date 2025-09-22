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
    skipDuplicates: true,
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
    map[index + 1] = cls.id;
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
    { classId: classIdMap['The New Creature'], title: 'The Overcoming Life', type: 'VIDEO', resourceUrl: '#', order: 3 },
    { classId: classIdMap['The New Creature'], title: 'Jesus', type: 'VIDEO', resourceUrl: '#', order: 4 },
    { classId: classIdMap['The New Creature'], title: 'Explain your understanding of “if any man be in Christ he is a new creation” as stated in 2 Cor 5:17 using yourself as an example.', type: 'ESSAY', content: 'Explain your understanding of “if any man be in Christ he is a new creation” as stated in 2 Cor 5:17 using yourself as an example.', requiresUpload: true, order: 5 },
    { classId: classIdMap['The New Creature'], title: 'Will I be continually assured of my salvation despite what I feel or see?', type: 'ESSAY', content: 'Will I be continually assured of my salvation despite what I feel or see?', requiresUpload: true, order: 6 },

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

    // Class 6 Resources
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

  // Create updated questions
  const questionData = [
    // Class 1: The New Creature
    {
      assessmentId: assessmentIdMap['New Creature Quiz'],
      text: 'The term “New Creature” is directly from which of these scriptures?',
      options: ['Gal 5:16', '1 Cor 10:10', '2 Cor 5:17'],
      correctAnswer: '2 Cor 5:17',
    },
    {
      assessmentId: assessmentIdMap['New Creature Quiz'],
      text: 'The New Creature has a brand-new nature and therefore a new life.',
      options: ['True', 'False'],
      correctAnswer: 'True',
    },
    {
      assessmentId: assessmentIdMap['New Creature Quiz'],
      text: 'Your believe and acceptance of Jesus Christ as Lord and Savior made it possible for you to have-------,  -------- and ---------',
      options: [
        'Good Education, Character of God and Confidence',
        'Wealth, Friends and good neighbors',
        'Eternal Life, Righteousness and Fellowship with God',
      ],
      correctAnswer: 'Eternal Life, Righteousness and Fellowship with God',
    },
    {
      assessmentId: assessmentIdMap['New Creature Quiz'],
      text: 'According to Romans 10:9-10, You received salvation by…………',
      options: [
        'Giving alms to the poor and needy',
        'Believe and Confession of the Lord Jesus',
        'Obeying the 10 commandment and confession of your sins',
      ],
      correctAnswer: 'Believe and Confession of the Lord Jesus',
    },
    {
      assessmentId: assessmentIdMap['New Creature Quiz'],
      text: '“Rom 12: (NIV) says ……Do not conform to the pattern of this world, but be transformed by the renewing of your mind.” This produces for you all of these except',
      options: [
        'It brings about a transformation of the old man',
        'It helps you to bear fruits of the recreated human spirit',
        'To remind you of your former memories',
      ],
      correctAnswer: 'To remind you of your former memories',
    },
    {
      assessmentId: assessmentIdMap['New Creature Quiz'],
      text: 'Because of the new life you now have, sin shall not have -------- over you',
      options: ['Limitation', 'Deficiency', 'Dominion'],
      correctAnswer: 'Dominion',
    },
    {
      assessmentId: assessmentIdMap['New Creature Quiz'],
      text: 'The new creature sits in the place of power in Christ',
      options: ['True', 'False'],
      correctAnswer: 'True',
    },

    // Class 2: The Holy Spirit
    {
      assessmentId: assessmentIdMap['Holy Spirit Assessment'],
      text: 'And, behold, I send the promise of my Father upon you: but tarry ye in the city of Jerusalem, until ye be endued with power from on high. This statement was made by………',
      options: ['Peter', 'Lord Jesus', 'The Holy Spirit'],
      correctAnswer: 'Lord Jesus',
    },
    {
      assessmentId: assessmentIdMap['Holy Spirit Assessment'],
      text: 'The above scripture can be found in…………',
      options: ['Luke 24:49', 'John 15:10', '2 Cor 5:17'],
      correctAnswer: 'Luke 24:49',
    },
    {
      assessmentId: assessmentIdMap['Holy Spirit Assessment'],
      text: 'Who is the Holy Spirit?',
      options: ['God’s Creation', 'A mighty Angel', 'God Himself'],
      correctAnswer: 'God Himself',
    },
    {
      assessmentId: assessmentIdMap['Holy Spirit Assessment'],
      text: 'On the day of Pentecost, in the upper room the Disciples of the Lord Jesus received ........',
      options: ['Peace', 'Fortification', 'The Holy Spirit'],
      correctAnswer: 'The Holy Spirit',
    },
    {
      assessmentId: assessmentIdMap['Holy Spirit Assessment'],
      text: 'The Indwelling of the Holy Spirit and infilling of the Holy Spirit are two separate experiences.',
      options: ['True', 'False'],
      correctAnswer: 'True',
    },
    {
      assessmentId: assessmentIdMap['Holy Spirit Assessment'],
      text: 'You can receive the Holy Spirit by………',
      options: [
        'Faith and laying on of hands of someone who already received the Holy Spirit',
        'Doing good works and begging God to give you the Spirit',
        'Fasting and prayer',
      ],
      correctAnswer: 'Faith and laying on of hands of someone who already received the Holy Spirit',
    },
    {
      assessmentId: assessmentIdMap['Holy Spirit Assessment'],
      text: 'Which of these is not an advantage of speaking in tongues………',
      options: [
        'It helps you to operate at your highest level of faith',
        'Fellowship with God in Mysteries unknown to Man',
        'Judge and condemn people that are not born again',
      ],
      correctAnswer: 'Judge and condemn people that are not born again',
    },

    // Class 3: Christian Doctrines
    {
      assessmentId: assessmentIdMap['Christian Doctrines Quiz'],
      text: '“All scripture is given by inspiration of God, and is profitable for doctrine, for reproof, for correction, for instruction in righteousness”. This can be found in……..',
      options: ['John 3:16', 'Eph 1:17', '2 Tim 3:16'],
      correctAnswer: '2 Tim 3:16',
    },
    {
      assessmentId: assessmentIdMap['Christian Doctrines Quiz'],
      text: 'As a Christian, you are in the part of God’s Kingdom established in the earth, also called the kingdom of Heaven, and headed by ………. ',
      options: ['God the Father', 'the Holy Spirit', 'the Lord Jesus Christ'],
      correctAnswer: 'the Lord Jesus Christ',
    },
    {
      assessmentId: assessmentIdMap['Christian Doctrines Quiz'],
      text: 'Doctrines are transferable through….',
      options: ['Impartation', 'Teaching', 'Grace'],
      correctAnswer: 'Teaching',
    },
    {
      assessmentId: assessmentIdMap['Christian Doctrines Quiz'],
      text: 'Our Doctrines are of God and provide us a sound, unshakable and tested pattern to follow, based on …….',
      options: [
        'the infallible and indestructible Word of God',
        'The structure of our Ministry',
        'The grace of God that has appeared to all Men',
      ],
      correctAnswer: 'the infallible and indestructible Word of God',
    },
    {
      assessmentId: assessmentIdMap['Christian Doctrines Quiz'],
      text: '………. refers to a systematic argumentative discourse in defense of the gospel or defense of a doctrine',
      options: ['Activism', 'Debate', 'Apologetics'],
      correctAnswer: 'Apologetics',
    },
    {
      assessmentId: assessmentIdMap['Christian Doctrines Quiz'],
      text: 'Loveworld Perfectionism is the ideology or disposition to regard anything short of ……….and………as unacceptable.',
      options: ['perfect, excellent', 'True, just', 'holy, righteous'],
      correctAnswer: 'perfect, excellent',
    },

    // Class 4A: Evangelism
    {
      assessmentId: assessmentIdMap['Evangelism Assessment'],
      text: 'There is no difference between “Soul Winning” and “Soul Saving”.',
      options: ['True', 'False'],
      correctAnswer: 'False',
    },
    {
      assessmentId: assessmentIdMap['Evangelism Assessment'],
      text: 'The important focus of Evangelism in these last days is not just to witness but to ………those we reach with the gospel',
      options: ['teach and disciple', 'exhort and edify', 'heal and deliver'],
      correctAnswer: 'teach and disciple',
    },
    {
      assessmentId: assessmentIdMap['Evangelism Assessment'],
      text: 'When God saves you, He makes you …….. in saving others',
      options: ['His servant', 'His Partner', 'His friend'],
      correctAnswer: 'His Partner',
    },
    {
      assessmentId: assessmentIdMap['Evangelism Assessment'],
      text: 'The ministry of reconciliation, is for every Christian.',
      options: ['True', 'False'],
      correctAnswer: 'True',
    },
    {
      assessmentId: assessmentIdMap['Evangelism Assessment'],
      text: 'How many steps were given by our man of God to help us bring our work of soulwinning to perfection?',
      options: ['10', '15', '7'],
      correctAnswer: '7',
    },
    {
      assessmentId: assessmentIdMap['Evangelism Assessment'],
      text: 'The first step to Perfecting Soul Winning is……….',
      options: ['Be filled with the Spirit', 'Introduce the church’s mentorship program', 'Explain the Gospel'],
      correctAnswer: 'Be filled with the Spirit',
    },
    {
      assessmentId: assessmentIdMap['Evangelism Assessment'],
      text: 'The final step to Perfecting Soul Winning is……….',
      options: ['Be filled with the Spirit', 'Introduce the church’s mentorship program', 'Release them into Leadership'],
      correctAnswer: 'Release them into Leadership',
    },

    // Class 4B: Cell Ministry
    {
      assessmentId: assessmentIdMap['Cell Ministry Quiz'],
      text: 'A Cell is ……….',
      options: [
        'The basic Fellowship and Outreach Unit of the Church',
        'The Charity arm of the Church',
        'The administrative and Operational Unit of the Church',
      ],
      correctAnswer: 'The basic Fellowship and Outreach Unit of the Church',
    },
    {
      assessmentId: assessmentIdMap['Cell Ministry Quiz'],
      text: 'The Cell Ministry provides a tested, proven and scripturally based Roadmap to………',
      options: [
        'win new converts, build and send them',
        'Keep track of the offerings and tithes received by the church',
        'Organize Church Meetings',
      ],
      correctAnswer: 'win new converts, build and send them',
    },
    {
      assessmentId: assessmentIdMap['Cell Ministry Quiz'],
      text: 'The Cell Ministry is optional.',
      options: ['True', 'False'],
      correctAnswer: 'False',
    },
    {
      assessmentId: assessmentIdMap['Cell Ministry Quiz'],
      text: 'Participation in the Cell Ministry is a pre-requisite for a member to be considered for leadership responsibilities in the Church.',
      options: ['True', 'False'],
      correctAnswer: 'True',
    },
    {
      assessmentId: assessmentIdMap['Cell Ministry Quiz'],
      text: 'The Cell Ministry is the same across all our Churches in the Loveworld Nation.',
      options: ['True', 'False'],
      correctAnswer: 'True',
    },
    {
      assessmentId: assessmentIdMap['Cell Ministry Quiz'],
      text: '…….... and ................ are some of the activities that take place in a cell.',
      options: ['Prayer and Bible Study', 'Music and Recreation', 'Planning and Playing'],
      correctAnswer: 'Prayer and Bible Study',
    },
    {
      assessmentId: assessmentIdMap['Cell Ministry Quiz'],
      text: 'Which meeting is missing in the link?[Image of a meeting schedule](https://res.cloudinary.com/dfi8bpolg/image/upload/v1752082439/tvdootqcwqogtd0oowxb.png)',
      options: ['Prayer and Planning', 'Mid-week Service', 'Sunday Service'],
      correctAnswer: 'Prayer and Planning',
    },

    // Class 5: Christian Character And Prosperity
    {
      assessmentId: assessmentIdMap['Christian Character Quiz'],
      text: 'The new Creature has a new life, which makes it possible to develop a new character and lifestyle that is consistent with his calling in Christ.',
      options: ['True', 'False'],
      correctAnswer: 'True',
    },
    {
      assessmentId: assessmentIdMap['Christian Character Quiz'],
      text: 'Which of these is not required for a Christian to grow as God has planned?',
      options: ['Avoid wrong associations', 'Cultivate a Culture of Prayer', 'Attend organizational functions'],
      correctAnswer: 'Attend organizational functions',
    },
    {
      assessmentId: assessmentIdMap['Christian Character Quiz'],
      text: 'As a Christian, you have become a joint-heir with Christ. This alone makes it impossible for you to be in lack.',
      options: ['True', 'False'],
      correctAnswer: 'True',
    },
    {
      assessmentId: assessmentIdMap['Christian Character Quiz'],
      text: 'Prosperity starts with….',
      options: ['Giving', 'Confession', 'Receiving'],
      correctAnswer: 'Giving',
    },
    {
      assessmentId: assessmentIdMap['Christian Character Quiz'],
      text: '…………….. refers to the one tenth of the value of your income',
      options: ['Tithe', 'Seed Offering', 'First Fruits'],
      correctAnswer: 'Tithe',
    },
    {
      assessmentId: assessmentIdMap['Christian Character Quiz'],
      text: '…………….. is given with expectation of a specific outcome or just to sow into a special grace.',
      options: ['Tithe', 'Seed Offering', 'First Fruits'],
      correctAnswer: 'Seed Offering',
    },
    {
      assessmentId: assessmentIdMap['Christian Character Quiz'],
      text: '………… refers to the first and the best of all your increase.',
      options: ['Partnership Seeds', 'Seed Offering', 'First Fruits'],
      correctAnswer: 'First Fruits',
    },

    // Class 6: The Local Assembly And Loveworld Inc.
    {
      assessmentId: assessmentIdMap['Local Assembly Assessment'],
      text: 'The word Church is translated from the Greek word ECCLESIA which means the……',
      options: ['gathering of the called-out people', 'Gathering of the same family', 'Gathering of friends'],
      correctAnswer: 'gathering of the called-out people',
    },
    {
      assessmentId: assessmentIdMap['Local Assembly Assessment'],
      text: 'The Universal Church refers to…………',
      options: [
        'the entire Body of Christ in the earth',
        'Christian Denominations based on region',
        'The devout Christians who call on the name of the lord',
      ],
      correctAnswer: 'the entire Body of Christ in the earth',
    },
    {
      assessmentId: assessmentIdMap['Local Assembly Assessment'],
      text: 'Being a member of the Local Assembly, your first and most important personal responsibility is to………',
      options: ['Cultivate a culture of prayer', 'attend the corporate Services', 'Invite others to Church'],
      correctAnswer: 'attend the corporate Services',
    },
    {
      assessmentId: assessmentIdMap['Local Assembly Assessment'],
      text: 'The vision of Christ Embassy is to take the divine presence of God to the nations and peoples of the World and to demonstrate the ----------',
      options: ['character of the spirit', 'good moral character', 'excellence in preaching'],
      correctAnswer: 'character of the spirit',
    },
    {
      assessmentId: assessmentIdMap['Local Assembly Assessment'],
      text: 'In Christ Embassy our Statements of Faith have their source in the ……',
      options: ['research analysis', 'Bible', 'personal experience'],
      correctAnswer: 'Bible',
    },

    // Class 7: Introduction To Mobile Technology
    {
      assessmentId: assessmentIdMap['Mobile Technology Quiz'],
      text: 'In Christ Embassy, we believe strongly that Technology is primarily for the propagation of ............',
      options: ['academic curriculum', 'the gospel', 'news on social media'],
      correctAnswer: 'the gospel',
    },
    {
      assessmentId: assessmentIdMap['Mobile Technology Quiz'],
      text: 'It is desirable for all members of our Church to have sufficient knowledge of our Ministry Technology Platforms and Apps, and how to use them for personal growth, access information, contribute and share information, and how to use them to reach souls and disciple others.',
      options: ['True', 'False'],
      correctAnswer: 'True',
    },
    {
      assessmentId: assessmentIdMap['Mobile Technology Quiz'],
      text: '..........is the Ministry mobile application that allows users access to an array of life transforming audio and video messages by Pastor Chris spanning various life issues',
      options: ['PCDL', 'Loveworld Sat', 'SoulTracker'],
      correctAnswer: 'PCDL',
    },
    {
      assessmentId: assessmentIdMap['Mobile Technology Quiz'],
      text: '……is a Ministry platform available for recording your work of soul winning',
      options: ['PCDL', 'SoulTracker', 'Loveworld App store'],
      correctAnswer: 'SoulTracker',
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