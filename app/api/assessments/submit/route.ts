import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
    // Skip database operations during build
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
        return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
    }

    try {
        const { userId, assessmentId, score } = await req.json()

        if (!userId || !assessmentId || score == null) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        // Check if already submitted
        const existing = await prisma.userAssessment.findFirst({
            where: { userId, assessmentId },
        })

        if (existing) {
            return NextResponse.json({ message: 'Assessment already submitted' }, { status: 200 })
        }

        const submission = await prisma.userAssessment.create({
            data: { userId, assessmentId, score },
        })

        return NextResponse.json(submission, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to submit assessment' }, { status: 500 })
    }
}