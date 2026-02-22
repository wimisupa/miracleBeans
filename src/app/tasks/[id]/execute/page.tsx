'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useWakeLock } from 'react-screen-wake-lock'
import { ChevronLeft, Check, Play, Pause, AlertCircle } from 'lucide-react'
import { useMember } from '@/context/MemberContext'

type Task = {
    id: string
    title: string
    description: string
    points: number
    durationMinutes: number | null
    status: string
    assigneeId?: string
    assignee?: { name: string }
}

export default function ExecuteTaskPage() {
    const router = useRouter()
    const params = useParams()
    const { currentMember } = useMember()
    const taskId = params.id as string

    const [task, setTask] = useState<Task | null>(null)
    const [loading, setLoading] = useState(true)

    // Timer state
    const [timeLeft, setTimeLeft] = useState(0) // in seconds
    const [isActive, setIsActive] = useState(false)
    const [isFinished, setIsFinished] = useState(false)
    const [completing, setCompleting] = useState(false)

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
                        router.push('/')
                        return
                    }

                    setTask(found)
                    if (found.durationMinutes) {
                        setTimeLeft(found.durationMinutes * 60)
                    }
                } else {
                    alert('할 일을 찾을 수 없습니다.')
                    router.push('/')
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchTask()
    }, [taskId, currentMember, router])

    const { isSupported, request, release } = useWakeLock()

    const toggleTimer = async () => {
        if (!isActive) {
            setIsActive(true)
            if (isSupported) {
                try {
                    await request()
                } catch (e) {
                    console.error('WakeLock request failed:', e)
                }
            }
        } else {
            setIsActive(false)
            if (isSupported) release()
        }
    }

    // Handle timer interval
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1)
            }, 1000)
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false)
            setIsFinished(true)
            if (isSupported) release()
            if (interval) clearInterval(interval)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, timeLeft, isSupported, release])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    const handleComplete = async () => {
        if (!isFinished) {
            if (!confirm('아직 시간이 남았어요! 그래도 완료할까요?')) return
        }

        setCompleting(true)
        try {
            // Move status from TODO -> PENDING
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'PENDING' })
            })

            if (res.ok) {
                alert('참 잘했어요! 부모님께 승인을 요청했어요. 🎉')
                router.push('/')
            } else {
                const data = await res.json()
                alert(data.error || '오류가 발생했습니다.')
            }
        } catch (e) {
            console.error(e)
            alert('오류 발생')
        } finally {
            setCompleting(false)
        }
    }

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>로딩 중...</div>
    if (!task) return null

    const progressPercent = task.durationMinutes ? ((task.durationMinutes * 60 - timeLeft) / (task.durationMinutes * 60)) * 100 : 0

    return (
        <div>
            <header className="header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
                    <ChevronLeft size={28} />
                </Link>
                <div className="logo" style={{ flex: 1 }}>
                    <span style={{ fontSize: '24px' }}>⏳</span>
                    <span>할 일 시작!</span>
                </div>
            </header>

            <div className="card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ marginBottom: '0.5rem', display: 'inline-block', background: 'rgba(0,0,0,0.05)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.9rem', color: '#607D8B', fontWeight: 'bold' }}>
                    {task.assignee?.name || '가족'}의 할 일
                </div>
                <h2 style={{ fontSize: '1.5rem', color: '#37474F', marginBottom: '0.5rem' }}>{task.title}</h2>
                <p style={{ color: '#607D8B', marginBottom: '2rem', fontSize: '1.1rem' }}>
                    보상: <span style={{ fontWeight: 'bold', color: '#FBC02D' }}>{task.points} 콩</span>
                </p>

                {/* Timer Circle */}
                <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 2rem auto' }}>
                    <svg width="200" height="200" viewBox="0 0 200 200">
                        {/* Background Circle */}
                        <circle
                            cx="100" cy="100" r="90"
                            fill="none" stroke="#E0E0E0" strokeWidth="12"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="100" cy="100" r="90"
                            fill="none" stroke="var(--color-primary)" strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 90}
                            strokeDashoffset={2 * Math.PI * 90 * (1 - progressPercent / 100)}
                            transform="rotate(-90 100 100)"
                            style={{ transition: 'stroke-dashoffset 1s linear' }}
                        />
                    </svg>
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <div style={{ fontSize: '3rem', fontWeight: '900', color: '#37474F', fontFamily: 'monospace' }}>
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                </div>

                {/* Controls */}
                {!isFinished ? (
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
                        <button
                            onClick={toggleTimer}
                            className="btn btn-primary"
                            style={{
                                width: '64px', height: '64px', borderRadius: '50%',
                                padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: isActive ? '#FFB74D' : 'var(--color-primary)'
                            }}
                        >
                            {isActive ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" style={{ marginLeft: '4px' }} />}
                        </button>
                        <button
                            onClick={handleComplete}
                            className="btn"
                            style={{
                                height: '64px', borderRadius: '32px', padding: '0 24px',
                                background: '#E0E0E0', color: '#757575', fontWeight: 'bold',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <Check size={20} />
                            강제로 완료하기
                        </button>
                    </div>
                ) : (
                    <div style={{ marginBottom: '2rem', animation: 'bounce 1s infinite' }}>
                        <span style={{ fontSize: '3rem' }}>🎉</span>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)', marginTop: '0.5rem' }}>
                            목표 시간 달성!
                        </div>
                    </div>
                )}

                {isFinished && (
                    <button
                        onClick={handleComplete}
                        disabled={completing}
                        className="btn btn-primary"
                        style={{ width: '100%', fontSize: '1.1rem', padding: '16px', background: 'var(--color-secondary)' }}
                    >
                        {completing ? '제출 중...' : '제리에게 다 했다고 알리기 ✨'}
                    </button>
                )}
            </div>

            <style jsx global>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    )
}
