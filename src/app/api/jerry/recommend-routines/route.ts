import { NextResponse } from 'next/server'
import { recommendRoutines } from '@/lib/jerry'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { role, name } = body

        if (!role || !name) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const routines = await recommendRoutines(role, name)
        return NextResponse.json(routines)
    } catch (error: any) {
        console.error('Routine recommendation error:', error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
