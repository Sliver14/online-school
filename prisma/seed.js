// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    // Check if we're in production environment
    if (process.env.NODE_ENV === 'production') {
        console.log('🚫 Seed script should not run in production environment')
        return
    }

    console.log('🌱 Starting database seed...')

    try {
        // Check if data already exists to prevent duplicate seeding
        const existingUserCount = await prisma.user.count()

        if (existingUserCount > 0) {
            console.log('📋 Database already contains users. Skipping seed...')
            return
        }

        // Hash password properly
        const saltRounds = 12
        const hashedPassword = await bcrypt.hash('123456', saltRounds)

        const user = await prisma.user.create({
            data: {
                email: 'silverchristopher12@gmail.com',
                firstName: 'sylver',
                lastName: 'oyinaga',
                password: hashedPassword,
            },
        })

        console.log('👤 Created user:', user.email)

        // Create classes with proper order sequencing
        const classesData = [
            {
                title: 'The New Creature',
                description: 'Understanding the transformation that occurs when one becomes a Christian',
                order: 1,
                classNumber: 'Class One',
                videoTitle: 'The New Creature',
                assessmentTitle: 'The New Creature Assessment',
                questions: [
                    {
                        text: 'Faith is the ...?',
                        options: ['Substance of things hoped for', 'Evidence of things not seen', 'Both substance and evidence', 'None of the above'],
                        correctAnswer: 'Both substance and evidence',
                    },
                ]
            },
            {
                title: 'The Holy Spirit',
                description: 'Learning about the person and work of the Holy Spirit',
                order: 2,
                classNumber: 'Class Two',
                videoTitle: 'The Holy Spirit',
                assessmentTitle: 'The Holy Spirit Assessment',
                questions: [
                    {
                        text: 'Love is patient and ...?',
                        options: ['Kind', 'Rude', 'Proud', 'Angry'],
                        correctAnswer: 'Kind',
                    },
                    {
                        text: 'Who is the Holy Spirit?',
                        options: ['A symbol like a dove', 'Anointing oil', 'The third person of the Trinity', 'A human being'],
                        correctAnswer: 'The third person of the Trinity',
                    },
                ]
            },
            {
                title: 'Christian Doctrines',
                description: 'Fundamental beliefs and teachings of Christianity',
                order: 3,
                classNumber: 'Class Three',
                videoTitle: 'Christian Doctrines',
                assessmentTitle: 'Christian Doctrines Assessment',
                questions: [
                    {
                        text: 'What is the foundation of Christian doctrine?',
                        options: ['Human tradition', 'Church councils', 'The Bible', 'Personal experience'],
                        correctAnswer: 'The Bible',
                    },
                ]
            },
            {
                title: 'Evangelism',
                description: 'Sharing the Gospel and reaching others for Christ',
                order: 4,
                classNumber: 'Class Four(A)',
                videoTitle: 'Evangelism',
                assessmentTitle: 'Evangelism Assessment',
                questions: [
                    {
                        text: 'What is the Great Commission?',
                        options: ['Go and make disciples', 'Love your neighbor', 'Pray without ceasing', 'Give to the poor'],
                        correctAnswer: 'Go and make disciples',
                    },
                ]
            },
            {
                title: 'Introduction To Cell Ministry',
                description: 'Understanding small group ministry and discipleship',
                order: 5,
                classNumber: 'Class Four(B)',
                videoTitle: 'Introduction To Cell Ministry',
                assessmentTitle: 'Cell Ministry Assessment',
                questions: [
                    {
                        text: 'What is the primary purpose of cell ministry?',
                        options: ['Social gathering', 'Discipleship and growth', 'Entertainment', 'Fundraising'],
                        correctAnswer: 'Discipleship and growth',
                    },
                ]
            },
            {
                title: 'Christian Character And Prosperity',
                description: 'Developing godly character and understanding biblical prosperity',
                order: 6,
                classNumber: 'Class Five',
                videoTitle: 'Christian Character And Prosperity',
                assessmentTitle: 'Character and Prosperity Assessment',
                questions: [
                    {
                        text: 'True prosperity includes ...?',
                        options: ['Only material wealth', 'Spiritual, physical, and material well-being', 'Fame and recognition', 'Power over others'],
                        correctAnswer: 'Spiritual, physical, and material well-being',
                    },
                ]
            },
            {
                title: 'The Local Assembly And Loveworld Inc. (Christ Embassy)',
                description: 'Understanding the local church structure and organization',
                order: 7,
                classNumber: 'Class Six',
                videoTitle: 'The Local Assembly And Loveworld Inc. (Christ Embassy)',
                assessmentTitle: 'Local Assembly Assessment',
                questions: [
                    {
                        text: 'What is the purpose of the local assembly?',
                        options: ['Social club', 'Business organization', 'Worship, fellowship, and service', 'Political movement'],
                        correctAnswer: 'Worship, fellowship, and service',
                    },
                ]
            },
            {
                title: 'Introduction To Mobile Technology For Personal Growth, Evangelism And Church Growth',
                description: 'Leveraging technology for ministry and spiritual growth',
                order: 8,
                classNumber: 'Class Seven',
                videoTitle: 'Mobile Technology for Ministry',
                assessmentTitle: 'Technology for Ministry Assessment',
                questions: [
                    {
                        text: 'How can technology enhance ministry?',
                        options: ['Replace personal relationships', 'Extend reach and accessibility', 'Eliminate the need for churches', 'Focus only on entertainment'],
                        correctAnswer: 'Extend reach and accessibility',
                    },
                ]
            }
        ]

        // Create classes in transaction for data integrity
        await prisma.$transaction(async (tx) => {
            for (const classData of classesData) {
                const createdClass = await tx.class.create({
                    data: {
                        title: classData.title,
                        description: classData.description,
                        order: classData.order,
                        videos: {
                            create: [
                                {
                                    title: classData.videoTitle,
                                    videoUrl: process.env.DEFAULT_VIDEO_URL || 'https://example.com/placeholder-video',
                                    videoPosterUrl: process.env.DEFAULT_POSTER_URL || '',
                                    classNumber: classData.classNumber,
                                    order: 1
                                },
                            ],
                        },
                        assessments: {
                            create: {
                                title: classData.assessmentTitle,
                                questions: {
                                    create: classData.questions,
                                },
                            },
                        },
                    },
                    include: { videos: true, assessments: true },
                })

                console.log(`📚 Created class: ${createdClass.title}`)
            }
        })

        // Create final exam
        const exam = await prisma.exam.create({
            data: {
                title: 'Final Comprehensive Exam',
                questions: {
                    create: [
                        {
                            text: 'Who is described as the author and finisher of our faith?',
                            options: ['Jesus Christ', 'Moses', 'Paul the Apostle', 'Prophet Elijah'],
                            correctAnswer: 'Jesus Christ',
                        },
                        {
                            text: 'According to 1 Corinthians 13:13, what are the three greatest virtues?',
                            options: ['Faith, Hope, Love', 'Love, Joy, Peace', 'Wisdom, Knowledge, Understanding', 'Prayer, Fasting, Giving'],
                            correctAnswer: 'Faith, Hope, Love',
                        },
                        {
                            text: 'What is the primary purpose of the church?',
                            options: ['Social welfare', 'Political influence', 'Worship God and make disciples', 'Economic development'],
                            correctAnswer: 'Worship God and make disciples',
                        },
                        {
                            text: 'What does it mean to be born again?',
                            options: ['Physical rebirth', 'Spiritual transformation', 'Change of religion', 'Moral improvement'],
                            correctAnswer: 'Spiritual transformation',
                        },
                    ],
                },
            },
        })

        console.log(`📝 Created exam: ${exam.title}`)
        console.log('✅ Database seeded successfully!')

    } catch (error) {
        console.error('❌ Seed error:', error)
        throw error
    }
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
        console.log('📡 Database connection closed')
    })