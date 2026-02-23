import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { status } = body

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        // We only allow setting to PENDING from TODO for now (used by hourglass completion)
        if (status !== 'PENDING') {
            return NextResponse.json({ error: 'Invalid status transition' }, { status: 400 })
        }

        const task = await prisma.task.findUnique({
            where: { id }
        })

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        if (task.status === status) {
            // Idempotent success (fixes React Strict Mode double-firing)
            return NextResponse.json(task)
        }

        if (task.status !== 'TODO') {
            return NextResponse.json({ error: 'Task is not in TODO status' }, { status: 400 })
        }

        const updatedTask = await prisma.task.update({
            where: { id },
            data: { status }
        })

        return NextResponse.json(updatedTask)

    } catch (error: any) {
        console.error('Task status update error:', error)
        return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 })
    }
}
