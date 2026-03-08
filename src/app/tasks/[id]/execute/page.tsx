'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import NoSleep from 'nosleep.js'
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

                    setTask(found)
                    if (found.durationMinutes) {
                        setTimeLeft(found.durationMinutes * 60)
                    }
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

    const wakeLockRef = useRef<any>(null)

    useEffect(() => {
        wakeLockRef.current = new NoSleep()
        return () => {
            if (wakeLockRef.current) {
                wakeLockRef.current.disable()
            }
        }
    }, [])

    const toggleTimer = async () => {
        if (!isActive) {
            setIsActive(true)
            if (wakeLockRef.current) {
                try {
                    wakeLockRef.current.enable()
                } catch (e) {
                    console.error('NoSleep enable failed:', e)
                }
            }
        } else {
            setIsActive(false)
            if (wakeLockRef.current) wakeLockRef.current.disable()
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
            if (wakeLockRef.current) wakeLockRef.current.disable()
            if (interval) clearInterval(interval)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, timeLeft])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    // Auto-complete when timer finishes
    useEffect(() => {
        if (isFinished) {
            router.push(`/tasks/${taskId}/success`)
        }
    }, [isFinished, router, taskId])

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>로딩 중...</div>
    if (!task) return null

    const progressPercent = task.durationMinutes ? ((task.durationMinutes * 60 - timeLeft) / (task.durationMinutes * 60)) * 100 : 0

    return (
        <div>
            <header className="header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingTop: '1rem' }}>
                <Link href={currentMember?.familyId ? `/family/${currentMember.familyId}/dashboard` : '/'} style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                    <ChevronLeft size={28} />
                </Link>
                <div className="logo text-playful" style={{ flex: 1, color: 'var(--color-text-main)' }}>
                    <span style={{ fontSize: '24px' }}>⏳</span>
                    <span>할 일 시작!</span>
                </div>
            </header>

            <div className="card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ marginBottom: '0.5rem', display: 'inline-block', background: 'var(--bg-main)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 'bold' }}>
                    {task.assignee?.name || '가족'}의 할 일
                </div>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>{task.title}</h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
                    보상: <span className="text-playful" style={{ color: '#FBC02D' }}>{task.points} 콩</span>
                </p>

                {/* Real Hourglass UI */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto 2rem auto', position: 'relative' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', position: 'relative' }}>

                        {/* Top Glass */}
                        <div style={{
                            width: '120px', height: '100px',
                            border: '4px solid var(--border-light)', borderBottom: 'none',
                            borderRadius: '10px 10px 50% 50%',
                            overflow: 'hidden', position: 'relative',
                            background: 'var(--bg-card)',
                            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{
                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                background: '#FFCA28', // Sand color
                                height: `${100 - progressPercent}%`,
                                transition: 'height 1s linear'
                            }} />
                        </div>

                        {/* Neck */}
                        <div style={{ width: '16px', height: '10px', background: 'var(--border-light)', borderRadius: '4px', zIndex: 2 }} />

                        {/* Bottom Glass */}
                        <div style={{
                            width: '120px', height: '100px',
                            border: '4px solid var(--border-light)', borderTop: 'none',
                            borderRadius: '50% 50% 10px 10px',
                            overflow: 'hidden', position: 'relative',
                            background: 'var(--bg-card)',
                            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{
                                position: 'absolute', bottom: 0, left: 0, right: 0,
                                background: '#FFCA28',
                                height: `${progressPercent}%`,
                                transition: 'height 1s linear'
                            }} />
                        </div>

                        {/* Stream of sand */}
                        {(isActive && !isFinished && progressPercent < 100) && (
                            <div style={{
                                position: 'absolute', top: '100px', width: '4px',
                                height: `${110 - (progressPercent * 0.96)}px`,
                                background: '#FFCA28',
                                opacity: 0.8,
                                zIndex: 1
                            }} />
                        )}
                    </div>

                    <div className="text-playful" style={{ marginTop: '1.5rem', fontSize: '3rem', color: 'var(--color-text-main)' }}>
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Controls */}
                {!isFinished && (
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
                        <button
                            onClick={toggleTimer}
                            className="btn btn-primary animate-pop"
                            style={{
                                width: '64px', height: '64px', borderRadius: '50%',
                                padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: isActive ? '#FFB74D' : 'var(--color-primary)'
                            }}
                        >
                            {isActive ? <Pause size={32} fill="white" /> : <Play size={32} fill="white" style={{ marginLeft: '4px' }} />}
                        </button>
                        <button
                            onClick={() => router.push(`/tasks/${taskId}/success`)}
                            className="btn animate-pop"
                            style={{
                                height: '64px', borderRadius: 'var(--radius-full)', padding: '0 24px',
                                background: 'var(--bg-main)', color: 'var(--color-text-muted)', fontWeight: 'bold',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <Check size={20} />
                            강제로 완료하기
                        </button>
                    </div>
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
