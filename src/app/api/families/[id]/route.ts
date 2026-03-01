import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Fetch family details by ID
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const family = await prisma.family.findUnique({
            where: { id },
            include: {
                members: true // Include members relation
            }
        })

        if (!family) {
            return NextResponse.json({ error: 'Family not found' }, { status: 404 })
        }

        return NextResponse.json(family)
    } catch (error) {
        console.error('Failed to fetch family:', error)
        return NextResponse.json({ error: 'Failed to fetch family' }, { status: 500 })
    }
}

// PATCH: Update family details like motto and location
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { name, motto, location } = body

        const updatedFamily = await prisma.family.update({
            where: { id },
            data: {
                name: name !== undefined ? name : undefined,
                motto: motto !== undefined ? motto : undefined,
                location: location !== undefined ? location : undefined,
            }
        })

        return NextResponse.json(updatedFamily)
    } catch (error) {
        console.error('Failed to update family:', error)
        return NextResponse.json({ error: 'Failed to update family' }, { status: 500 })
    }
}
