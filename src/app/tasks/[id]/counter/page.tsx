'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, CheckCircle, Target, Activity } from 'lucide-react'
import { useMember } from '@/context/MemberContext'
import { useSquatCounter } from '@/hooks/useSquatCounter'

export default function CounterTaskExecutePage() {
    const router = useRouter()
    const params = useParams()
    const { currentMember } = useMember()
    const taskId = params.id as string

    const [task, setTask] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [finishing, setFinishing] = useState(false)

    const targetCount = task?.targetCount || 10

    const handleComplete = async () => {
        setFinishing(true)

        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'PENDING' }) // Wait for Jerry's approval or auto-approve
            })

            if (res.ok) {
                triggerConfetti()
                setTimeout(() => {
                    router.push(`/family/${currentMember?.familyId}/dashboard`)
                    router.refresh()
                }, 2000)
            } else {
                alert('완료 처리 중 오류가 발생했습니다.')
                setFinishing(false)
            }
        } catch (error) {
            console.error(error)
            alert('오류가 발생했습니다.')
            setFinishing(false)
        }
    }

    const triggerConfetti = () => {
        import('canvas-confetti').then((confetti) => {
            confetti.default({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#00BFA5', '#FBC02D', '#FF5252', '#448AFF']
            })
        })
    }

    const {
        permissionGranted,
        permissionNeedsRequest,
        isMeasuring,
        isReady,
        currentCount,
        startMeasuring
    } = useSquatCounter({
        threshold: 0.5,
        debounceMs: 800,
        targetCount: targetCount,
        onComplete: handleComplete
    })

    useEffect(() => {
        fetch(`/api/tasks/${taskId}`)
            .then(res => res.json())
            .then(data => {
                setTask(data)
                setLoading(false)
            })
    }, [taskId])

    if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#607D8B' }}>불러오는 중...</div>
    if (!task) return null

    const progress = Math.min((currentCount / targetCount) * 100, 100)

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <header className="header" style={{ display: 'flex', alignItems: 'center', paddingTop: '1rem' }}>
                <Link href={`/family/${currentMember?.familyId}/dashboard`} style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)', textDecoration: 'none', marginRight: '1rem' }}>
                    <ChevronLeft size={32} />
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-main)', gap: '8px' }}>
                    <Activity size={32} color="var(--color-primary)" />
                    <span className="text-playful" style={{ fontSize: '1.4rem', letterSpacing: '-0.02em' }}>
                        진행 중인 미션
                    </span>
                </div>
            </header>

            <div className="card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <h1 style={{ fontSize: '1.5rem', color: 'var(--color-text-main)', marginBottom: '1rem' }}>{task.title}</h1>
                <div style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Target size={18} /> 목표: <span className="text-playful">{targetCount}회</span>
                    </span>
                </div>

                {/* Visual Counter */}
                <div style={{
                    width: '200px', height: '200px', borderRadius: '50%',
                    background: 'var(--bg-card)', margin: '0 auto 2rem', border: '8px solid var(--border-light)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    boxShadow: 'var(--shadow-sm)',
                    position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        height: `${progress}%`, background: 'rgba(0, 191, 165, 0.1)',
                        transition: 'height 0.3s ease-out'
                    }} />
                    <div className="text-playful" style={{ fontSize: '4rem', color: 'var(--color-primary)', zIndex: 1 }}>
                        {currentCount}
                    </div>
                </div>

                {!isMeasuring && !finishing && (
                    <button
                        onClick={startMeasuring}
                        className="btn btn-primary animate-pop"
                        style={{ width: '100%', padding: '16px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <Activity size={24} />
                        {permissionNeedsRequest ? '시작하기 (권한 허용)' : '측정 시작'}
                    </button>
                )}

                {isMeasuring && !isReady && !finishing && (
                    <div style={{ animation: 'pulse 1s infinite ease-in-out' }}>
                        <p style={{ color: '#FBC02D', fontWeight: 'bold', fontSize: '1.4rem', marginBottom: '1rem' }}>
                            ⏳ 잠시 후 시작합니다...<br />(자세를 잡아주세요!)
                        </p>
                    </div>
                )}

                {isMeasuring && isReady && !finishing && (
                    <div style={{ animation: 'pulse 1.5s infinite ease-in-out' }}>
                        <p style={{ color: '#FBC02D', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>
                            🐹 "자, 시작해볼까? 제리가 지켜보고 있어요!"
                        </p>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                            폰을 바르게 쥐고 지정된 횟수만큼 동작을 수행하세요.<br />
                            움직임이 측정되면 카운트가 올라갑니다!
                        </p>
                    </div>
                )}

                {finishing && (
                    <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <CheckCircle size={24} />
                        목표 달성! 완료 처리 중...
                    </div>
                )}
            </div>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.02); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    )
}
