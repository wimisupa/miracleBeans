import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

// GET: Fetch all families (later could be filtered by memberships)
export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const families = await prisma.family.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { members: true }
                }
            }
        })
        return NextResponse.json(families)
    } catch (error) {
        console.error('Failed to fetch families:', error)
        return NextResponse.json({ error: 'Failed to fetch families' }, { status: 500 })
    }
}

// POST: Create a new family
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, motto, location } = body

        if (!name) {
            return NextResponse.json({ error: 'Family name is required' }, { status: 400 })
        }

        const family = await prisma.family.create({
            data: {
                name,
                motto,
                location
            },
        })

        return NextResponse.json(family)
    } catch (error) {
        console.error('Failed to create family:', error)
        return NextResponse.json({ error: 'Failed to create family' }, { status: 500 })
    }
}
