'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Play } from 'lucide-react'

type Task = {
    id: string
    title: string
    points: number
    scheduledAt: string | null
    durationMinutes: number | null
}

export default function TodoTasksList({ memberId, hideStartButton = false }: { memberId: string, hideStartButton?: boolean }) {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/tasks?status=TODO')
            .then(res => res.json())
            .then((data: any[]) => {
                // Filter tasks strictly by assignee. No special parent viewing here.
                if (!Array.isArray(data)) {
                    console.error('Expected array from /api/tasks but got:', data)
                    setTasks([])
                    setLoading(false)
                    return
                }
                const myTodoTasks = data.filter(t => (t.assigneeId || t.creatorId) === memberId && t.status === 'TODO')
                setTasks(myTodoTasks)
                setLoading(false)
            })
            .catch(e => {
                console.error(e)
                setLoading(false)
            })
    }, [memberId])

    if (loading) return <div style={{ textAlign: 'center', color: '#90A4AE', fontSize: '0.9rem' }}>로딩 중...</div>

    if (tasks.length === 0) {
        return (
            <div style={{ background: 'rgba(255,255,255,0.4)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', color: '#607D8B' }}>
                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '8px' }}>🎉</span>
                지금 당장 해야 할 일은 없어요!<br />휴식을 취하거나 새로운 일을 찾아볼까요?
            </div>
        )
    }

    return (
        <>
            {tasks.map(task => (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '12px 16px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div>
                        <div style={{ fontWeight: 'bold', color: '#37474F', fontSize: '1.05rem', marginBottom: '4px' }}>{task.title}</div>
                        <div style={{ fontSize: '0.85rem', color: '#78909C', display: 'flex', gap: '8px' }}>
                            {task.durationMinutes && <span>⏱️ {task.durationMinutes}분</span>}
                            <span style={{ color: '#FBC02D', fontWeight: 'bold' }}>+{task.points}콩</span>
                        </div>
                    </div>
                    {!hideStartButton && (
                        <Link href={`/tasks/${task.id}/execute`} className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '12px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <Play size={16} fill="white" />
                            시작
                        </Link>
                    )}
                </div>
            ))}
        </>
    )
}
