import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const { senderId, receiverId, amount, message } = await req.json()

        if (!senderId || !receiverId || !amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
        }

        if (senderId === receiverId) {
            return NextResponse.json({ error: 'Cannot send points to yourself' }, { status: 400 })
        }

        // 1. Check sender's balance
        const sender = await prisma.member.findUnique({ where: { id: senderId } })
        if (!sender) return NextResponse.json({ error: 'Sender not found' }, { status: 404 })

        if (sender.points < amount) {
            return NextResponse.json({ error: '포인트가 부족해요!' }, { status: 400 })
        }

        // 2. Perform transaction in a transaction (atomic)
        await prisma.$transaction(async (tx) => {
            // Deduct from sender
            await tx.member.update({
                where: { id: senderId },
                data: { points: { decrement: amount } }
            })

            // Add to receiver
            await tx.member.update({
                where: { id: receiverId },
                data: { points: { increment: amount } }
            })

            // Record transaction for sender
            await tx.transaction.create({
                data: {
                    amount: -amount,
                    reason: `선물 보냄: ${message} (to ${receiverId})`, // Ideally fetch receiver name, but ID for now or improve
                    memberId: senderId
                }
            })

            // Record transaction for receiver
            await tx.transaction.create({
                data: {
                    amount: amount,
                    reason: `선물 받음: ${message} (from ${sender.name})`,
                    memberId: receiverId
                }
            })
        })

        return NextResponse.json({ message: 'Success' })

    } catch (error) {
        console.error('Transfer error:', error)
        return NextResponse.json({ error: 'Transfer failed' }, { status: 500 })
    }
}
