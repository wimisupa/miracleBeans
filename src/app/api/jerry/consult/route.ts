import { NextResponse } from 'next/server'
import { askJerry } from '@/lib/jerry'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { description, type } = body

        if (!description || !type) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const verdict = await askJerry(description, type)
        return NextResponse.json(verdict)
    } catch (error) {
        return NextResponse.json({ error: 'Jerry is sleeping' }, { status: 500 })
    }
}
