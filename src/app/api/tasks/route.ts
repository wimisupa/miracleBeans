import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: List tasks (optional filter by status)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    try {
        const tasks = await prisma.task.findMany({
            where: status ? { status: status } : undefined,
            include: {
                creator: true,
                assignee: true,
                approvals: {
                    include: {
                        member: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(tasks)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }
}

// POST: Create a new task
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { title, description, type, points, creatorId, assigneeId, durationMinutes, routineId } = body

        if (!title || !points || !creatorId || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Validate HOURGLASS required fields
        if (type === 'HOURGLASS') {
            if (durationMinutes === undefined) {
                return NextResponse.json({ error: 'HOURGLASS tasks require durationMinutes' }, { status: 400 })
            }
        }

        const task = await prisma.task.create({
            data: {
                title,
                description,
                type,
                points,
                status: 'TODO', // All new tasks, including EARN and HOURGLASS, start as TODO
                creatorId,
                assigneeId: assigneeId || creatorId, // Explicit assignee from frontend, fallback to creator
                durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
                routineId: routineId || undefined,
            },
        })

        return NextResponse.json(task)
    } catch (error) {
        console.error('Task creation error:', error)
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }
}
