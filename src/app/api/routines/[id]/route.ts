import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()

        const routine = await prisma.routine.update({
            where: { id },
            data: body,
        })
        return NextResponse.json(routine)
    } catch (error) {
        console.error('Update routing error:', error)
        return NextResponse.json({ error: 'Failed to update routine' }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        // Soft delete
        const routine = await prisma.routine.update({
            where: { id },
            data: { isActive: false },
        })
        return NextResponse.json(routine)
    } catch (error) {
        console.error('Delete routine error:', error)
        return NextResponse.json({ error: 'Failed to delete routine' }, { status: 500 })
    }
}
