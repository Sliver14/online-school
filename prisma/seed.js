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
                correctAnswer: 'Greek',
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
                correctAnswer: 'True',
            },
            {
                id: 5,
                assessmentId: 2,
                text: 'You can’t receive a double anointing because',
                options: [
                    'It will be too much for you to function in as a New Creature',
                    'The one who gives the anointing is in you in His fullness',
                    'It is just for ordained ministers',
                    'You are not a celestial being',
                ],
                correctAnswer: 'It will be too much for you to function in as a New Creature',
            },
            {
                id: 6,
                assessmentId: 2,
                text: 'The Holy Spirit Proceeds _____________ the father',
                options: ['With', 'To', 'From', 'Away'],
                correctAnswer: 'With',
            },
            {
                id: 7,
                assessmentId: 2,
                text: 'How does God live in you?',
                options: ['By His Grace', 'By His mercy', 'By His Spirit', 'By His love'],
                correctAnswer: 'By His Grace',
            },
            {
                id: 8,
                assessmentId: 2,
                text: 'One of the ways to receive the Holy Spirit is',
                options: [
                    'By studying the Word voraciously and meditating on it without fail',
                    'By fasting consistently',
                    'By praying without ceasing',
                    'By simply and with reverence saying a prayer to receive Him, and by faith receiving Him',
                ],
                correctAnswer: 'By studying the Word voraciously and meditating on it without fail',
            },
            {
                id: 9,
                assessmentId: 2,
                text: 'Speaking in tongues is all but one of the following',
                options: [
                    'One of the ways that we edify ourselves',
                    'The self-improvement plan of the Holy Spirit',
                    'A human language not understood by the Speaker',
                    'A way to glorify God',
                ],
                correctAnswer: 'One of the ways that we edify ourselves',
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
                options: ['Greater Anointing', 'New levels of Grace', 'Diverse kinds of tongues', 'Peace of mind'],
                correctAnswer: 'Greater Anointing',
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