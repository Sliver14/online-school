const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Create 8 classes
    const classes = await prisma.class.createMany({
        data: [
            {
                id: 1,
                title: 'The New Creature',
                description: 'Understanding the transformation and identity of a born-again believer.',
                order: 1,
            },
            {
                id: 2,
                title: 'The Holy Spirit',
                description: 'Exploring the role and power of the Holy Spirit in the life of a Christian.',
                order: 2,
            },
            {
                id: 3,
                title: 'Christian Doctrines',
                description: 'Foundational teachings and beliefs of the Christian faith.',
                order: 3,
            },
            {
                id: 4,
                title: 'Evangelism',
                description: 'Learning effective methods to share the Gospel with others.',
                order: 4,
            },
            {
                id: 5,
                title: 'Introduction To Cell Ministry',
                description: 'An overview of cell group structures and their role in church growth.',
                order: 5,
            },
            {
                id: 6,
                title: 'Christian Character And Prosperity',
                description: 'Developing godly character and understanding biblical prosperity.',
                order: 6,
            },
            {
                id: 7,
                title: 'The Local Assembly And Loveworld Inc. (Christ Embassy)',
                description: 'Exploring the importance of the local church and the vision of Loveworld Inc.',
                order: 7,
            },
            {
                id: 8,
                title: 'Introduction To Mobile Technology For Personal Growth, Evangelism And Church Growth',
                description: 'Using mobile technology for spiritual development and ministry outreach.',
                order: 8,
            },
        ],
        // skipDuplicates: true,
    });

    // Create 8 videos (1 per class)
    const videos = await prisma.video.createMany({
        data: [
            {
                id: 1,
                classId: 1,
                title: 'Who is the New Creature?',
                videoUrl: 'https://res.cloudinary.com/dfi8bpolg/video/upload/v1736329275/samples/cld-sample-video.mp4',
                classNumber: 'Class One',
                videoPosterUrl: 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1749024298/igjvdxvzizghd1vbrfoh.jpg',
                order: 1,
            },
            {
                id: 2,
                classId: 2,
                title: 'The Power of the Holy Spirit',
                videoUrl: 'https://res.cloudinary.com/dfi8bpolg/video/upload/v1736329275/samples/cld-sample-video.mp4',
                classNumber: 'Class Two',
                videoPosterUrl: 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1749733689/pm4ss9lhtw8nwf3aedct.jpg',
                order: 1,
            },
            {
                id: 3,
                classId: 3,
                title: 'Core Christian Beliefs',
                videoUrl: 'https://res.cloudinary.com/dfi8bpolg/video/upload/v1736329275/samples/cld-sample-video.mp4',
                classNumber: 'Class Three',
                videoPosterUrl: 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1749733689/pm4ss9lhtw8nwf3aedct.jpg',
                order: 1,
            },
            {
                id: 4,
                classId: 4,
                title: 'Sharing the Gospel Effectively',
                videoUrl: 'https://res.cloudinary.com/dfi8bpolg/video/upload/v1736329275/samples/cld-sample-video.mp4',
                classNumber: 'Class Four(A)',
                videoPosterUrl: 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1749733689/pm4ss9lhtw8nwf3aedct.jpg',
                order: 1,
            },
            {
                id: 5,
                classId: 5,
                title: 'Building Cell Groups',
                videoUrl: 'https://res.cloudinary.com/dfi8bpolg/video/upload/v1736329275/samples/cld-sample-video.mp4',
                classNumber: 'Class Four(B)',
                videoPosterUrl: 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1749733689/pm4ss9lhtw8nwf3aedct.jpg',
                order: 1,
            },
            {
                id: 6,
                classId: 6,
                title: 'Godly Character and Prosperity',
                videoUrl: 'https://res.cloudinary.com/dfi8bpolg/video/upload/v1736329275/samples/cld-sample-video.mp4',
                classNumber: 'Class Five',
                videoPosterUrl: 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1749733689/pm4ss9lhtw8nwf3aedct.jpg',
                order: 1,
            },
            {
                id: 7,
                classId: 7,
                title: 'The Role of the Local Church',
                videoUrl: 'https://res.cloudinary.com/dfi8bpolg/video/upload/v1736329275/samples/cld-sample-video.mp4',
                classNumber: 'Class Six',
                videoPosterUrl: 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1749733689/pm4ss9lhtw8nwf3aedct.jpg',
                order: 1,
            },
            {
                id: 8,
                classId: 8,
                title: 'Mobile Tech for Ministry',
                videoUrl: 'https://res.cloudinary.com/dfi8bpolg/video/upload/v1736329275/samples/cld-sample-video.mp4',
                classNumber: 'Class Seven',
                videoPosterUrl: 'https://res.cloudinary.com/dfi8bpolg/image/upload/v1749733689/pm4ss9lhtw8nwf3aedct.jpg',
                order: 1,
            },
        ],
        // skipDuplicates: true,
    });

    // Create 16 resources (2 per class)
    const resources = await prisma.classResource.createMany({
        data: [
            // Class 1 Resources
            {
                id: 1,
                classId: 1,
                title: 'New Creature Study Guide',
                type: 'READ',
                content: 'A comprehensive guide summarizing the key points about the new creature in Christ.',
                resourceUrl: 'https://res.cloudinary.com/dfi8bpolg/raw/upload/v1750331234/sample.pdf',
                order: 1,
            },
            {
                id: 9,
                classId: 1,
                title: 'New Creature Essay',
                type: 'ESSAY',
                content: 'Write a 400-word essay on what it means to be a new creature in Christ.',
                order: 2,
            },
            // Class 2 Resources
            {
                id: 2,
                classId: 2,
                title: 'Holy Spirit Reflection Essay',
                type: 'ESSAY',
                content: 'Write a 500-word essay on how the Holy Spirit influences your daily life as a Christian.',
                order: 1,
            },
            {
                id: 10,
                classId: 2,
                title: 'Holy Spirit Key Points',
                type: 'NOTE',
                content: 'Summary of the roles and gifts of the Holy Spirit in the believer’s life.',
                order: 2,
            },
            // Class 3 Resources
            {
                id: 3,
                classId: 3,
                title: 'Christian Doctrines Notes',
                type: 'NOTE',
                content: 'Key notes on foundational Christian doctrines, including the Trinity and Salvation.',
                order: 1,
            },
            {
                id: 11,
                classId: 3,
                title: 'Doctrines Study Guide',
                type: 'READ',
                content: 'Detailed guide on core Christian doctrines for deeper understanding.',
                resourceUrl: 'https://res.cloudinary.com/dfi8bpolg/raw/upload/v1750331234/sample.pdf',
                order: 2,
            },
            // Class 4 Resources
            {
                id: 4,
                classId: 4,
                title: 'Evangelism Strategies Guide',
                type: 'READ',
                content: 'Practical strategies for effective evangelism in your community.',
                resourceUrl: 'https://res.cloudinary.com/dfi8bpolg/raw/upload/v1750331234/sample.pdf',
                order: 1,
            },
            {
                id: 12,
                classId: 4,
                title: 'Evangelism Outreach Plan',
                type: 'ASSIGNMENT',
                content: 'Develop a plan for a local evangelism outreach event in 300 words.',
                order: 2,
            },
            // Class 5 Resources
            {
                id: 5,
                classId: 5,
                title: 'Cell Ministry Essay Assignment',
                type: 'ESSAY',
                content: 'Describe in 300 words the benefits of cell groups for church growth.',
                order: 1,
            },
            {
                id: 13,
                classId: 5,
                title: 'Cell Ministry Resources',
                type: 'LINK',
                content: 'Explore online resources for effective cell group management.',
                resourceUrl: 'https://www.cellministry.org/resources',
                order: 2,
            },
            // Class 6 Resources
            {
                id: 6,
                classId: 6,
                title: 'Character and Prosperity Summary',
                type: 'NOTE',
                content: 'Summary of biblical principles for developing Christian character and prosperity.',
                order: 1,
            },
            {
                id: 14,
                classId: 6,
                title: 'Prosperity Reflection Essay',
                type: 'ESSAY',
                content: 'Write a 400-word essay on biblical prosperity and its role in Christian life.',
                order: 2,
            },
            // Class 7 Resources
            {
                id: 7,
                classId: 7,
                title: 'Loveworld Inc. Vision',
                type: 'LINK',
                content: 'Learn more about the vision and mission of Loveworld Inc.',
                resourceUrl: 'https://www.loveworld.org/about',
                order: 1,
            },
            {
                id: 15,
                classId: 7,
                title: 'Local Church Guide',
                type: 'READ',
                content: 'Guide on the role and importance of the local church in a believer’s life.',
                resourceUrl: 'https://res.cloudinary.com/dfi8bpolg/raw/upload/v1750331234/sample.pdf',
                order: 2,
            },
            // Class 8 Resources
            {
                id: 8,
                classId: 8,
                title: 'Mobile Technology Tools',
                type: 'READ',
                content: 'List of mobile apps and tools for evangelism and personal growth.',
                order: 1,
            },
            {
                id: 16,
                classId: 8,
                title: 'Mobile App Development Task',
                type: 'ASSIGNMENT',
                content: 'Propose a mobile app idea for evangelism in 250 words.',
                order: 2,
            },
        ],
    });

    // Create 1 exam
    const exam = await prisma.exam.create({
        data: {
            id: 1,
            title: 'Final Foundation School Exam',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });

    // Create 10 exam questions
    const examQuestions = await prisma.examQuestion.createMany({
        data: [
            {
                id: 1,
                examId: 1,
                text: 'What is the primary identity of the new creature in Christ?',
                options: ['A new spiritual being', 'A reformed sinner', 'A church member', 'A religious scholar'],
                correctAnswer: 'A new spiritual being',
            },
            {
                id: 2,
                examId: 1,
                text: 'Who baptizes believers into the body of Christ according to the Holy Spirit class?',
                options: ['The Pastor', 'The Holy Spirit', 'Jesus Christ', 'The Apostles'],
                correctAnswer: 'The Holy Spirit',
            },
            {
                id: 3,
                examId: 1,
                text: 'Which doctrine emphasizes that Jesus is both fully God and fully man?',
                options: ['Trinity', 'Atonement', 'Hypostatic Union', 'Resurrection'],
                correctAnswer: 'Hypostatic Union',
            },
            {
                id: 4,
                examId: 1,
                text: 'What is the main purpose of evangelism?',
                options: ['Raising funds', 'Sharing the Gospel', 'Building churches', 'Teaching doctrine'],
                correctAnswer: 'Sharing the Gospel',
            },
            {
                id: 5,
                examId: 1,
                text: 'What is the primary function of cell groups in church ministry?',
                options: ['Organizing events', 'Fellowship and discipleship', 'Fundraising', 'Construction'],
                correctAnswer: 'Fellowship and discipleship',
            },
            {
                id: 6,
                examId: 1,
                text: 'Which characteristic is emphasized as key to Christian character?',
                options: ['Wealth', 'Humility', 'Popularity', 'Power'],
                correctAnswer: 'Humility',
            },
            {
                id: 7,
                examId: 1,
                text: 'What is the core mission of Loveworld Inc.?',
                options: ['Education', 'Global ministry and evangelism', 'Healthcare', 'Technology'],
                correctAnswer: 'Global ministry and evangelism',
            },
            {
                id: 8,
                examId: 1,
                text: 'How does mobile technology support evangelism?',
                options: ['Building websites', 'Spreading the Gospel via apps', 'Hosting concerts', 'Printing books'],
                correctAnswer: 'Spreading the Gospel via apps',
            },
            {
                id: 9,
                examId: 1,
                text: 'What is one way to receive the Holy Spirit?',
                options: ['Fasting for 40 days', 'Praying with faith to receive Him', 'Joining a choir', 'Reading the Bible daily'],
                correctAnswer: 'Praying with faith to receive Him',
            },
            {
                id: 10,
                examId: 1,
                text: 'What does the term "new creature" signify in Christian doctrine?',
                options: ['A new physical body', 'A transformed spiritual identity', 'A new church role', 'A new career path'],
                correctAnswer: 'A transformed spiritual identity',
            },
        ],
    });

    // Create 8 assessments (1 per class)
    const assessments = await prisma.assessment.createMany({
        data: [
            { id: 1, classId: 1, title: 'New Creature Quiz' },
            { id: 2, classId: 2, title: 'Holy Spirit Assessment' },
            { id: 3, classId: 3, title: 'Christian Doctrines Quiz' },
            { id: 4, classId: 4, title: 'Evangelism Assessment' },
            { id: 5, classId: 5, title: 'Cell Ministry Quiz' },
            { id: 6, classId: 6, title: 'Christian Character Quiz' },
            { id: 7, classId: 7, title: 'Local Assembly Assessment' },
            { id: 8, classId: 8, title: 'Mobile Technology Quiz' },
        ],
        // skipDuplicates: true,
    });

    // Create questions (10 for Class 2's assessment, 1 for each other assessment)
    const questions = await prisma.question.createMany({
        data: [
            // Question for Class 1
            {
                id: 1,
                assessmentId: 1,
                text: 'What does it mean to be a "new creature" in Christ?',
                options: ['A new spiritual identity', 'A physical transformation', 'Joining a new church', 'Learning new skills'],
                correctAnswer: 'A new spiritual identity',
            },
            // Questions for Class 2 (Holy Spirit)
            {
                id: 2,
                assessmentId: 2,
                text: 'The Pentecost is not a Christian feast but rather refers to a _______ celebration.',
                options: ['Greek', 'Jewish', 'English', 'German'],
                correctAnswer: 'Jewish',
            },
            {
                id: 3,
                assessmentId: 2,
                text: '___________ baptizes you into the body of Christ.',
                options: ['The Holy Spirit', 'God', 'Our Lord Jesus', 'Your Pastor'],
                correctAnswer: 'The Holy Spirit',
            },
            {
                id: 4,
                assessmentId: 2,
                text: 'Being baptized into the Holy Spirit and receiving the Holy Spirit are the same experience?',
                options: ['True', 'False', 'Not really', 'None of the above'],
                correctAnswer: 'False',
            },
            {
                id: 5,
                assessmentId: 2,
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
                id: 6,
                assessmentId: 2,
                text: 'The Holy Spirit Proceeds _____________ the father',
                options: ['With', 'To', 'From', 'Away'],
                correctAnswer: 'From',
            },
            {
                id: 7,
                assessmentId: 2,
                text: 'How does God live in you?',
                options: ['By His Grace', 'By His mercy', 'By His Spirit', 'By His love'],
                correctAnswer: 'By His Spirit',
            },
            {
                id: 8,
                assessmentId: 2,
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
                id: 9,
                assessmentId: 2,
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
                id: 10,
                assessmentId: 2,
                text: 'The Seven Spirits of God include all but',
                options: ['Spirit of Peace', 'Spirit of Might', 'Spirit of Counsel', 'Spirit of Knowledge'],
                correctAnswer: 'Spirit of Peace',
            },
            {
                id: 11,
                assessmentId: 2,
                text: 'One of these is a gift of the Spirit as listed in 1 Cor. 12: 8 - 10',
                options: ['Word of Wisdom', 'New levels of Grace', 'Peace of mind', 'Greater Anointing'],
                correctAnswer: 'Word of Wisdom',
            },
            // Question for Class 3
            {
                id: 12,
                assessmentId: 3,
                text: 'Which doctrine teaches that Jesus is both God and man?',
                options: ['Trinity', 'Hypostatic Union', 'Salvation', 'Baptism'],
                correctAnswer: 'Hypostatic Union',
            },
            // Question for Class 4
            {
                id: 13,
                assessmentId: 4,
                text: 'What is the primary goal of evangelism?',
                options: ['Selling books', 'Sharing the Gospel', 'Building churches', 'Hosting events'],
                correctAnswer: 'Sharing the Gospel',
            },
            // Question for Class 5
            {
                id: 14,
                assessmentId: 5,
                text: 'What is the main purpose of a cell group in church ministry?',
                options: ['Fundraising', 'Fellowship and discipleship', 'Organizing concerts', 'Building facilities'],
                correctAnswer: 'Fellowship and discipleship',
            },
            // Question for Class 6
            {
                id: 15,
                assessmentId: 6,
                text: 'What is a key aspect of Christian character according to the Bible?',
                options: ['Wealth accumulation', 'Humility', 'Fame', 'Power'],
                correctAnswer: 'Humility',
            },
            // Question for Class 7
            {
                id: 16,
                assessmentId: 7,
                text: 'What is Loveworld Inc. primarily focused on?',
                options: ['Real estate', 'Global ministry and evangelism', 'Manufacturing', 'Education'],
                correctAnswer: 'Global ministry and evangelism',
            },
            // Question for Class 8
            {
                id: 17,
                assessmentId: 8,
                text: 'How can mobile technology aid evangelism?',
                options: ['Cooking meals', 'Spreading the Gospel via apps', 'Building houses', 'Driving outreach'],
                correctAnswer: 'Spreading the Gospel via apps',
            },
        ],
        // skipDuplicates: true,
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