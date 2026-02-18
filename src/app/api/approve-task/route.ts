import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { id, action, memberId } = body

        if (!id || !action || !memberId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const result = await prisma.$transaction(async (tx) => {
            const task = await tx.task.findUnique({
                where: { id },
                include: { creator: true }
            })

            if (!task) throw new Error('Task not found')
            if (task.status !== 'PENDING') throw new Error('Task is not pending')

            if (action === 'REJECT') {
                return await tx.task.update({
                    where: { id },
                    data: { status: 'REJECTED' }
                })
            }

            if (action === 'APPROVE') {
                // Prevent self-approval if multiple members exist
                const totalMembers = await tx.member.count()
                if (totalMembers > 1 && task.creatorId === memberId) {
                    throw new Error('본인의 요청은 승인할 수 없습니다.')
                }

                // Record approval (idempotent)
                const existing = await tx.taskApproval.findUnique({
                    where: { taskId_memberId: { taskId: id, memberId } }
                })

                if (!existing) {
                    await tx.taskApproval.create({
                        data: { taskId: id, memberId }
                    })
                }

                // Check consensus
                const approvalCount = await tx.taskApproval.count({ where: { taskId: id } })
                // Required: Everyone except the creator
                const required = totalMembers > 1 ? totalMembers - 1 : 1

                if (approvalCount >= required) {
                    // Finalize
                    const pointChange = task.type === 'EARN' ? task.points : -task.points

                    await tx.member.update({
                        where: { id: task.creatorId },
                        data: { points: { increment: pointChange } }
                    })

                    await tx.transaction.create({
                        data: {
                            amount: pointChange,
                            reason: task.title,
                            memberId: task.creatorId,
                        }
                    })

                    return await tx.task.update({
                        where: { id },
                        data: { status: 'APPROVED' }
                    })
                } else {
                    // Not yet finalized, return current status
                    return { ...task, approvalCount, required, message: `승인 완료 (${approvalCount}/${required})` }
                }
            }

            throw new Error('Invalid action')
        })

        return NextResponse.json(result)

    } catch (error: any) {
        console.error('Approval error:', error)
        return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 })
    }
}
