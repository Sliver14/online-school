// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.create({
        data: {
            email: 'test@example.com',
            name: 'Test User',
            password: 'hashedpassword123', // Hash in real usage
        },
    })

    const class1 = await prisma.class.create({
        data: {
            title: 'The New Creature',
            description: 'The New Creature',
            order: 1,
            videos: {
                create: [
                    { title: 'The New Creature', videoUrl: 'https://video1.com', videoPosterUrl: '', classNumber: 'Class One', order: 1 },
                ],
            },
            assessments: {
                create: {
                    title: 'The New Creature',
                    questions: {
                        create: [
                            {
                                text: 'Faith is the ...?',
                                options: ['Substance of things', 'Evidence of things', 'Both', 'None'],
                                correctAnswer: 'Both',
                            },
                        ],
                    },
                },
            },
        },
        include: { videos: true },
    })

    const class2 = await prisma.class.create({
        data: {
            title: 'The Holy Spirit',
            description: 'The Holy Spirit',
            order: 2,
            videos: {
                create: [
                    { title: 'The Holy Spirit', videoUrl: 'https://video1.com', videoPosterUrl: '', classNumber: 'Class Two', order: 1 },
                ],
            },
            assessments: {
                create: {
                    title: 'The Holy Spirit',
                    questions: {
                        create: [
                            {
                                text: 'Love is patient and ...?',
                                options: ['Kind', 'Rude', 'Proud', 'Angry'],
                                correctAnswer: 'Kind',
                            },
                            {
                                text: 'Who is the Holy Spirt?',
                                options: ['A Dove', 'Oil', 'Person', 'Human Being'],
                                correctAnswer: 'Person',
                            },
                        ],
                    },
                },
            },
        },
    })

    const class3 = await prisma.class.create({
        data: {
            title: 'Christian Doctrines',
            description: 'Christian Doctrines',
            order: 2,
            videos: {
                create: [
                    { title: 'Christian Doctrines', videoUrl: 'https://video1.com', videoPosterUrl: '', classNumber: 'Class Three', order: 1 },
                ],
            },
            assessments: {
                create: {
                    title: 'Christian Doctrines',
                    questions: {
                        create: [
                            {
                                text: 'Love is patient and ...?',
                                options: ['Kind', 'Rude', 'Proud', 'Angry'],
                                correctAnswer: 'Kind',
                            },
                        ],
                    },
                },
            },
        },
    })

    const class4 = await prisma.class.create({
        data: {
            title: 'Evangelism',
            description: 'Evangelism',
            order: 2,
            videos: {
                create: [
                    { title: 'Evangelism', videoUrl: 'https://video1.com', videoPosterUrl: '', classNumber: 'Class Four(A)', order: 1 },
                ],
            },
            assessments: {
                create: {
                    title: 'Evangelism',
                    questions: {
                        create: [
                            {
                                text: 'Love is patient and ...?',
                                options: ['Kind', 'Rude', 'Proud', 'Angry'],
                                correctAnswer: 'Kind',
                            },
                        ],
                    },
                },
            },
        },
    })

    const class5 = await prisma.class.create({
        data: {
            title: 'Introduction To Cell Ministry',
            description: 'Introduction To Cell Ministry',
            order: 2,
            videos: {
                create: [
                    { title: 'Introduction To Cell Ministry' , videoUrl: 'https://video1.com', videoPosterUrl: '', classNumber: 'Class Four(B)', order: 1 },
                ],
            },
            assessments: {
                create: {
                    title: 'Introduction To Cell Ministry',
                    questions: {
                        create: [
                            {
                                text: 'Love is patient and ...?',
                                options: ['Kind', 'Rude', 'Proud', 'Angry'],
                                correctAnswer: 'Kind',
                            },
                        ],
                    },
                },
            },
        },
    })

    const class6 = await prisma.class.create({
        data: {
            title: 'Christian Character And Prosperity',
            description: 'Christian Character And Prosperity',
            order: 2,
            videos: {
                create: [
                    { title: 'Christian Character And Prosperity', videoUrl: 'https://video1.com', videoPosterUrl: '', classNumber: 'Class Five', order: 1 },
                ],
            },
            assessments: {
                create: {
                    title: 'Love Quiz',
                    questions: {
                        create: [
                            {
                                text: 'Love is patient and ...?',
                                options: ['Kind', 'Rude', 'Proud', 'Angry'],
                                correctAnswer: 'Kind',
                            },
                        ],
                    },
                },
            },
        },
    })

    const class7 = await prisma.class.create({
        data: {
            title: 'The Local Assembly And Loveworld Inc. (Christ Embassy)',
            description: 'The Local Assembly And Loveworld Inc. (Christ Embassy)',
            order: 2,
            videos: {
                create: [
                    { title: 'The Local Assembly And Loveworld Inc. (Christ Embassy)', videoUrl: 'https://video1.com', videoPosterUrl: '', classNumber: 'Class Six', order: 1 },
                ],
            },
            assessments: {
                create: {
                    title: 'The Local Assembly And Loveworld Inc. (Christ Embassy)',
                    questions: {
                        create: [
                            {
                                text: 'Love is patient and ...?',
                                options: ['Kind', 'Rude', 'Proud', 'Angry'],
                                correctAnswer: 'Kind',
                            },
                        ],
                    },
                },
            },
        },
    })

    const class8 = await prisma.class.create({
        data: {
            title: 'Seven Introduction To Mobile Technology For Personal Growth, Evangelism And Church Growth',
            description: 'Seven Introduction To Mobile Technology For Personal Growth, Evangelism And Church Growth',
            order: 2,
            videos: {
                create: [
                    { title: 'Seven Introduction To Mobile Technology For Personal Growth, Evangelism And Church Growth', videoUrl: 'https://video1.com', videoPosterUrl: '', classNumber: 'Class Seven', order: 1 },
                ],
            },
            assessments: {
                create: {
                    title: 'Seven Introduction To Mobile Technology For Personal Growth, Evangelism And Church Growth',
                    questions: {
                        create: [
                            {
                                text: 'Love is patient and ...?',
                                options: ['Kind', 'Rude', 'Proud', 'Angry'],
                                correctAnswer: 'Kind',
                            },
                        ],
                    },
                },
            },
        },
    })


    const exam = await prisma.exam.create({
        data: {
            title: 'Final Exam',
            questions: {
                create: [
                    {
                        text: 'Who is the author of Faith?',
                        options: ['Jesus', 'Moses', 'Paul', 'Elijah'],
                        correctAnswer: 'Jesus',
                    },
                    {
                        text: 'Love is the greatest among ...?',
                        options: ['Faith, Hope, Love', 'Love, Joy, Peace'],
                        correctAnswer: 'Faith, Hope, Love',
                    },
                ],
            },
        },
    })

    console.log('✅ Seeded user, classes, videos, assessments, and exam.')
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
