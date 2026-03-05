import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { id, action, memberId, comment } = body

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
                const targetMemberId = task.assigneeId || task.creatorId;
                const personWhoDidIt = (task.type === 'HOURGLASS' || task.type === 'EARN' || task.type === 'MISSION') ? targetMemberId : task.creatorId;

                await tx.transaction.create({
                    data: {
                        amount: 0,
                        reason: `❌ 반려됨: ${task.title}${task.resultMessage ? `\n📝 보고: "${task.resultMessage}"` : ''}${comment ? `\n💬 심사: "${comment}"` : ''}`,
                        memberId: personWhoDidIt,
                    }
                })

                return await tx.task.update({
                    where: { id },
                    data: { status: 'REJECTED' }
                })
            }

            if (action === 'APPROVE') {
                const targetMemberId = task.assigneeId || task.creatorId;
                const personWhoDidIt = (task.type === 'HOURGLASS' || task.type === 'EARN' || task.type === 'MISSION') ? targetMemberId : task.creatorId;

                // Prevent self-approval if multiple members exist
                const totalMembers = await tx.member.count({
                    where: { familyId: task.creator.familyId }
                })

                if (totalMembers > 1 && personWhoDidIt === memberId) {
                    throw new Error('본인의 요청은 승인할 수 없습니다.')
                }
                if (totalMembers > 2 && task.type === 'TATTLE' && task.assigneeId === memberId) {
                    throw new Error('당사자는 승인할 수 없습니다.')
                }

                // Record approval (idempotent)
                const existing = await tx.taskApproval.findUnique({
                    where: { taskId_memberId: { taskId: id, memberId } }
                })

                if (!existing) {
                    await tx.taskApproval.create({
                        data: {
                            taskId: id,
                            memberId,
                            comment: comment || null
                        }
                    })
                }

                // Check consensus
                const approvalCount = await tx.taskApproval.count({ where: { taskId: id } })

                // Required: Everyone except the creator (and target if Tattle)
                let required = totalMembers > 1 ? totalMembers - 1 : 1;

                if (task.type === 'TATTLE') {
                    // Exclude Creator (Accuser) AND Assignee (Target)
                    // If totalMembers <= 2, then required is 1 (minimum 1 judge needed)
                    required = totalMembers > 2 ? totalMembers - 2 : 1;
                }

                if (approvalCount >= required) {
                    // Finalize based on Task Type
                    let pointChange = 0;
                    let finalTargetMemberId = task.creatorId;

                    if (task.type === 'EARN' || task.type === 'HOURGLASS' || task.type === 'MISSION') {
                        pointChange = Math.abs(task.points);
                        if (task.assigneeId) {
                            finalTargetMemberId = task.assigneeId;
                        }
                    } else if (task.type === 'SPEND') {
                        pointChange = -Math.abs(task.points);
                    } else if (task.type === 'TATTLE') {
                        pointChange = -Math.abs(task.points); // Penalty
                        if (task.assigneeId) {
                            finalTargetMemberId = task.assigneeId; // Deduct from the accused
                        }
                    }

                    await tx.member.update({
                        where: { id: finalTargetMemberId },
                        data: { points: { increment: pointChange } }
                    })

                    await tx.transaction.create({
                        data: {
                            amount: pointChange,
                            reason: `${task.title}${task.resultMessage ? `\n📝 보고: "${task.resultMessage}"` : ''}`,
                            memberId: finalTargetMemberId,
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
