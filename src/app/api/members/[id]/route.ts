import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const memberId = resolvedParams.id;

        if (!memberId) {
            return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
        }

        const body = await request.json();
        const { name, role, pin } = body;

        if (!name || !role || !pin) {
            return NextResponse.json({ error: 'Name, role, and pin are required' }, { status: 400 });
        }

        const updatedMember = await prisma.member.update({
            where: { id: memberId },
            data: { name, role, pin }
        });

        return NextResponse.json(updatedMember);
    } catch (error) {
        console.error('Error updating member:', error);
        return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const memberId = resolvedParams.id;

        if (!memberId) {
            return NextResponse.json(
                { error: 'Member ID is required' },
                { status: 400 }
            );
        }

        // Since we added onDelete: Cascade to the Prisma relations, 
        // deleting the member will automatically delete their Tasks, Routines, Transactions, and Approvals.
        await prisma.member.delete({
            where: {
                id: memberId,
            },
        });

        return NextResponse.json({ success: true, message: 'Member deleted successfully' });
    } catch (error) {
        console.error('Error deleting member:', error);
        return NextResponse.json(
            { error: 'Failed to delete member' },
            { status: 500 }
        );
    }
}
