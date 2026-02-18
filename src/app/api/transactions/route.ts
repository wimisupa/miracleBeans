import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
        return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    try {
        const transactions = await prisma.transaction.findMany({
            where: { memberId },
            orderBy: { createdAt: 'desc' },
            include: {
                member: {
                    select: { name: true }
                }
            }
        })
        return NextResponse.json(transactions)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }
}
