'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, CheckCircle, ClipboardEdit } from 'lucide-react'
import { useMember } from '@/context/MemberContext'

type Task = {
    id: string
    title: string
    points: number
    status: string
    assigneeId?: string
    creatorId: string
    assignee?: { name: string }
}

export default function CompleteMissionPage() {
    const router = useRouter()
    const params = useParams()
    const { currentMember } = useMember()
    const taskId = params.id as string

    const [task, setTask] = useState<Task | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [resultMessage, setResultMessage] = useState('')

    useEffect(() => {
        if (!currentMember) {
            router.push('/')
            return
        }

        const fetchTask = async () => {
            try {
                const res = await fetch('/api/tasks')
                const tasks = await res.json()
                const found = tasks.find((t: any) => t.id === taskId)

                if (found) {
                    if (currentMember.role !== 'PARENT' && (found.assigneeId || found.creatorId) !== currentMember.id) {
                        alert('내 할 일이 아니에요!')
                        router.push(`/family/${currentMember.familyId}/dashboard`)
                        return
                    }
                    if (found.status !== 'TODO') {
                        alert('이미 완료되거나 대기중인 미션입니다.')
                        router.push(`/family/${currentMember.familyId}/dashboard`)
                        return
                    }
                    setTask(found)
                } else {
                    alert('할 일을 찾을 수 없습니다.')
                    router.push(`/family/${currentMember.familyId}/dashboard`)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchTask()
    }, [taskId, currentMember, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!resultMessage.trim()) {
            alert('어떻게 미션을 완수했는지 적어주세요!')
            return
        }

        setSubmitting(true)
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'PENDING',
                    resultMessage: resultMessage.trim()
                })
            })

            if (res.ok) {
                router.push(`/family/${currentMember?.familyId}/dashboard`)
                router.refresh()
            } else {
                alert('승인 요청에 실패했습니다.')
                setSubmitting(false)
            }
        } catch (error) {
            console.error(error)
            alert('오류가 발생했습니다.')
            setSubmitting(false)
        }
    }

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>로딩 중...</div>
    if (!task) return null

    return (
        <div>
            <header className="header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingTop: '1rem' }}>
                <Link href={`/family/${currentMember?.familyId}/dashboard`} style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                    <ChevronLeft size={28} />
                </Link>
                <div className="logo text-playful" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-main)' }}>
                    <ClipboardEdit size={24} color="var(--color-primary)" />
                    <span style={{ fontSize: '1.4rem', letterSpacing: '-0.02em' }}>결과 보고하기</span>
                </div>
            </header>

            <div className="card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ marginBottom: '0.5rem', display: 'inline-block', background: 'var(--bg-main)', color: 'var(--color-primary)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        미션 완료
                    </div>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>{task.title}</h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
                        보상: <span className="text-playful" style={{ color: '#FBC02D' }}>{task.points} 콩</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">어떻게 마무리했나요? (결과 보고)</label>
                        <textarea
                            className="input"
                            value={resultMessage}
                            onChange={(e) => setResultMessage(e.target.value)}
                            placeholder="예: 거실 청소기 돌리고 물걸레질까지 싹 다 했어요! ✨"
                            required
                            style={{ width: '100%', minHeight: '120px', resize: 'vertical', padding: '1rem' }}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary animate-pop"
                        style={{ width: '100%', padding: '16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        disabled={submitting || !resultMessage.trim()}
                    >
                        {submitting ? '제출 중...' : <><CheckCircle size={20} /> 승인 요청하기</>}
                    </button>
                </form>
            </div>
        </div>
    )
}
