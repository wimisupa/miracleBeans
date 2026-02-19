import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
    try {
        const { memberId, oldPin, newPin } = await request.json()

        if (!memberId || !oldPin || !newPin) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        if (newPin.length !== 4) {
            return NextResponse.json({ error: 'PIN must be 4 digits' }, { status: 400 })
        }

        const member = await prisma.member.findUnique({
            where: { id: memberId }
        })

        if (!member) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 })
        }

        if (member.pin !== oldPin) {
            return NextResponse.json({ error: 'Incorrect old PIN' }, { status: 401 })
        }

        await prisma.member.update({
            where: { id: memberId },
            data: { pin: newPin }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('PIN update error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
