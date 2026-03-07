import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: List all routines
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const familyId = searchParams.get('familyId')

    try {
        const routines = await prisma.routine.findMany({
            where: {
                isActive: true,
                ...(familyId ? { creator: { familyId } } : {})
            },
            include: {
                creator: true,
                assignee: true,
            },
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(routines)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch routines' }, { status: 500 })
    }
}

// POST: Create a new routine
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { title, type, points, creatorId, assigneeId, timeOfDay, daysOfWeek, durationMinutes, targetCount } = body

        if (!title || !type || !points || !creatorId || !assigneeId || !daysOfWeek) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        if (type === 'HOURGLASS' && !durationMinutes) {
            return NextResponse.json({ error: 'HOURGLASS routines require durationMinutes' }, { status: 400 })
        }

        if (type === 'COUNTER' && (!targetCount || targetCount < 1)) {
            return NextResponse.json({ error: 'COUNTER routines require a valid targetCount' }, { status: 400 })
        }

        const routine = await prisma.routine.create({
            data: {
                title,
                type,
                points: Number(points),
                creatorId,
                assigneeId,
                timeOfDay,
                daysOfWeek,
                durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
                targetCount: targetCount ? Number(targetCount) : undefined,
            },
            include: {
                creator: true,
                assignee: true,
            }
        })

        return NextResponse.json(routine)
    } catch (error) {
        console.error('Routine creation error:', error)
        return NextResponse.json({ error: 'Failed to create routine' }, { status: 500 })
    }
}
