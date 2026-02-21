import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: List all routines
export async function GET(request: Request) {
    try {
        const routines = await prisma.routine.findMany({
            where: { isActive: true },
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
        const { title, type, points, creatorId, assigneeId, timeOfDay, daysOfWeek, durationMinutes } = body

        if (!title || !type || !points || !creatorId || !assigneeId || !daysOfWeek) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        if (type === 'HOURGLASS' && !durationMinutes) {
            return NextResponse.json({ error: 'HOURGLASS routines require durationMinutes' }, { status: 400 })
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
