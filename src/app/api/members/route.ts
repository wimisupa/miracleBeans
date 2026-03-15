import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

// GET: List all members
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const { searchParams } = new URL(request.url)
        const familyId = searchParams.get('familyId')

        const members = await prisma.member.findMany({
            where: familyId ? { familyId } : undefined,
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
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, role, pin, familyId, icon } = body

        if (!name || !role) {
            return NextResponse.json({ error: 'Name and role are required' }, { status: 400 })
        }

        // Use the provided familyId, or fallback to the first family if not provided
        // (Fallback ensures backward compatibility for older clients if any)
        const targetFamilyId = familyId || (await prisma.family.findFirst())?.id

        if (!targetFamilyId) {
            return NextResponse.json({ error: 'No family available to assign to' }, { status: 400 })
        }

        // Validate that the family exists
        const familyExists = await prisma.family.findUnique({ where: { id: targetFamilyId } })
        if (!familyExists) {
            return NextResponse.json({ error: `Family with ID ${targetFamilyId} not found` }, { status: 400 })
        }

        // Validate that the user exists in the DB
        const userExists = await prisma.user.findUnique({ where: { id: session.user.id } })
        if (!userExists) {
            console.warn(`User ${session.user.id} not found in DB. Session might be stale.`)
            return NextResponse.json({ 
                error: '사용자 정보를 DB에서 찾을 수 없습니다. 로그아웃 후 다시 로그인해 주세요.',
                code: 'USER_NOT_FOUND' 
            }, { status: 401 })
        }

        const member = await prisma.member.create({
            data: {
                name,
                role,
                pin: pin || '0000',
                icon: icon || 'star',
                points: 0, // Start with 0 points
                familyId: targetFamilyId,
                userId: session.user.id
            },
        })

        return NextResponse.json(member)
    } catch (error) {
        console.error('Error creating member:', error)
        return NextResponse.json({ 
            error: 'Failed to create member',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}
