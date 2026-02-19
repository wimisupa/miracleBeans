import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const { memberId, pin } = await request.json()

        if (!memberId || !pin) {
            return NextResponse.json({ error: 'Missing memberId or pin' }, { status: 400 })
        }

        const member = await prisma.member.findUnique({
            where: { id: memberId }
        })

        if (!member) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 })
        }

        if (member.pin === pin) {
            return NextResponse.json({ success: true, member })
        } else {
            return NextResponse.json({ success: false, error: 'Incorrect PIN' }, { status: 401 })
        }
    } catch (error) {
        console.error('PIN verification error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
