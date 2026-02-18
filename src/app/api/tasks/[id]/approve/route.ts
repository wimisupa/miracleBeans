import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { action } = body // 'APPROVE' or 'REJECT'

        if (!id || !action) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        // Prepare transaction operations
        return await prisma.$transaction(async (tx) => {
            // 1. Get the task
            const task = await tx.task.findUnique({
                where: { id },
                include: { creator: true }
            })

            if (!task) {
                throw new Error('Task not found')
            }

            if (task.status !== 'PENDING') {
                throw new Error('Task is not pending')
            }

            // 2. Handle Rejection
            if (action === 'REJECT') {
                const updatedTask = await tx.task.update({
                    where: { id },
                    data: { status: 'REJECTED' }
                })
                return NextResponse.json(updatedTask)
            }

            // 3. Handle Approval
            if (action === 'APPROVE') {
                // Calculate point change
                // EARN: +points
                // SPEND: -points
                const pointChange = task.type === 'EARN' ? task.points : -task.points

                // Check if sufficient points for SPEND
                if (task.type === 'SPEND' && task.creator.points + pointChange < 0) {
                    // Optional: Allow negative points or block?
                    // Let's allow negative for now (Debt), or we can throw error.
                    // For a family app, debt is a good concept to teach.
                }

                // Update Member Points
                await tx.member.update({
                    where: { id: task.creatorId },
                    data: { points: { increment: pointChange } }
                })

                // Create Transaction Record
                await tx.transaction.create({
                    data: {
                        amount: pointChange,
                        reason: task.title, // or description
                        memberId: task.creatorId,
                    }
                })

                // Update Task Status
                const updatedTask = await tx.task.update({
                    where: { id },
                    data: { status: 'APPROVED' }
                })

                return NextResponse.json(updatedTask)
            }

            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        })

    } catch (error: any) {
        console.error('Approval error:', error)
        return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 })
    }
}
