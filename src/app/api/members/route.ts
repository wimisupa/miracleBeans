import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: List all members
export async function GET() {
    try {
        const members = await prisma.member.findMany({
            orderBy: { createdAt: 'asc' },
        })
        return NextResponse.json(members)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
    }
}

// POST: Create a new member
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { name, role } = body

        if (!name || !role) {
            return NextResponse.json({ error: 'Name and role are required' }, { status: 400 })
        }

        const member = await prisma.member.create({
            data: {
                name,
                role,
                points: 0, // Start with 0 points
            },
        })

        return NextResponse.json(member)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create member' }, { status: 500 })
    }
}
