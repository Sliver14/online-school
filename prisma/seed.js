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
            title: 'Intro to Faith',
            description: 'Faith 101 class',
            order: 1,
            videos: {
                create: [
                    { title: 'What is Faith?', videoUrl: 'https://video1.com', videoPosterUrl: '', classNumber: '', order: 1 },
                ],
            },
            assessments: {
                create: {
                    title: 'Faith Quiz',
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
            title: 'Walking in Love',
            description: 'Love and its power',
            order: 2,
            videos: {
                create: [
                    { title: 'Love Never Fails', videoUrl: 'https://video3.com', order: 1 },
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
