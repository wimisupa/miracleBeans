import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
        return NextResponse.json({ error: 'Missing memberId' }, { status: 400 })
    }

    try {
        // Today string: Mon, Tue...
        const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const todayStr = daysMap[new Date().getDay()]

        // Get start of today and end of today
        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)

        const endOfToday = new Date()
        endOfToday.setHours(23, 59, 59, 999)

        const routines = await prisma.routine.findMany({
            where: {
                isActive: true,
                assigneeId: memberId,
                daysOfWeek: {
                    contains: todayStr
                }
            },
            include: {
                tasks: {
                    where: {
                        createdAt: {
                            gte: startOfToday,
                            lte: endOfToday
                        }
                    }
                }
            }
        })

        const routinesWithStatus = routines.map(r => ({
            ...r,
            isCompletedDaily: r.tasks.length > 0,
            taskId: r.tasks.length > 0 ? r.tasks[0].id : null,
            taskStatus: r.tasks.length > 0 ? r.tasks[0].status : null
        }))

        return NextResponse.json(routinesWithStatus)

    } catch (error) {
        console.error('Failed to fetch today routines:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
