import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { userId, videoId } = body

        if (!userId || !videoId) {
            return NextResponse.json({ error: 'Missing userId or videoId' }, { status: 400 })
        }

        // Check if progress already exists
        const existing = await prisma.userProgress.findFirst({
            where: { userId, videoId },
        })

        if (existing) {
            return NextResponse.json({ message: 'Progress already recorded' }, { status: 200 })
        }

        const progress = await prisma.userProgress.create({
            data: { userId, videoId },
        })

        return NextResponse.json(progress, { status: 201 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to record progress' }, { status: 500 })
    }
}
