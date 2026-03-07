'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, CheckCircle, Target, Activity } from 'lucide-react'
import { useMember } from '@/context/MemberContext'

export default function CounterTaskExecutePage() {
    const router = useRouter()
    const params = useParams()
    const { currentMember } = useMember()
    const taskId = params.id as string

    const [task, setTask] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [finishing, setFinishing] = useState(false)

    // Motion Sensor State
    const [permissionGranted, setPermissionGranted] = useState(false)
    const [permissionNeedsRequest, setPermissionNeedsRequest] = useState(false)
    const [isMeasuring, setIsMeasuring] = useState(false)

    const [currentCount, setCurrentCount] = useState(0)
    const targetCount = task?.targetCount || 10

    // Algorithm State
    const lastY = useRef<number | null>(null)
    // -1 = going down, 1 = going up, 0 = stable
    const state = useRef<number>(0)
    const isReadyForNext = useRef(true)

    useEffect(() => {
        fetch(`/api/tasks/${taskId}`)
            .then(res => res.json())
            .then(data => {
                setTask(data)
                setLoading(false)
                checkSensorPermission()
            })
    }, [taskId])

    const checkSensorPermission = () => {
        // @ts-ignore
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            setPermissionNeedsRequest(true)
        } else {
            // Android or non-iOS 13+ devices usually grant permission by default
            setPermissionGranted(true)
        }
    }

    const requestPermission = async () => {
        try {
            // @ts-ignore
            const permission = await DeviceMotionEvent.requestPermission()
            if (permission === 'granted') {
                setPermissionGranted(true)
                setPermissionNeedsRequest(false)
                setIsMeasuring(true)
            } else {
                alert('센서 접근 권한이 거부되었습니다. 설정에서 권한을 허용해주세요.')
            }
        } catch (error) {
            console.error('Permission request error:', error)
            alert('센서 권한 요청 중 오류가 발생했습니다. (HTTPS 환경이 필수일 수 있습니다)')
        }
    }

    const startMeasuring = () => {
        if (permissionNeedsRequest) {
            requestPermission()
        } else {
            setIsMeasuring(true)
            setPermissionGranted(true)
        }
    }

    useEffect(() => {
        if (!isMeasuring || !permissionGranted) return

        const handleMotion = (event: DeviceMotionEvent) => {
            // We use Y axis for squat motion detection (assuming phone is held upright)
            // Can add Z axis considerations for other holds, but Y is a good starting point.
            const y = event.accelerationIncludingGravity?.y

            if (y === null || y === undefined) return

            if (lastY.current !== null) {
                const delta = y - lastY.current

                // Very basic heuristic for Up/Down movement detection
                const THRESHOLD = 1.2

                if (delta > THRESHOLD && state.current !== 1) {
                    // Moving Up
                    state.current = 1
                } else if (delta < -THRESHOLD && state.current !== -1) {
                    // Moving Down
                    state.current = -1
                    isReadyForNext.current = true
                }

                // If we went down, and now we went up, count 1
                if (state.current === 1 && isReadyForNext.current) {
                    setCurrentCount(prev => {
                        const newCount = prev + 1
                        if (newCount >= targetCount) {
                            handleComplete()
                        }
                        return newCount
                    })
                    isReadyForNext.current = false
                }
            }
            lastY.current = y
        }

        window.addEventListener('devicemotion', handleMotion)
        return () => window.removeEventListener('devicemotion', handleMotion)
    }, [isMeasuring, permissionGranted, targetCount])

    const handleComplete = async () => {
        setIsMeasuring(false)
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

    if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#607D8B' }}>불러오는 중...</div>
    if (!task) return null

    const progress = Math.min((currentCount / targetCount) * 100, 100)

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <header className="header" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', paddingTop: '1rem' }}>
                <Link href={`/family/${currentMember?.familyId}/dashboard`} style={{ display: 'flex', alignItems: 'center', color: '#1A252C', textDecoration: 'none', marginRight: '1rem' }}>
                    <ChevronLeft size={32} />
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', color: '#1A252C', gap: '8px' }}>
                    <Activity size={32} color="var(--color-primary)" />
                    <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                        진행 중인 미션
                    </span>
                </div>
            </header>

            <div className="card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <h1 style={{ fontSize: '1.5rem', color: '#37474F', marginBottom: '1rem' }}>{task.title}</h1>
                <div style={{ color: '#78909C', marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Target size={18} /> 목표: {targetCount}회
                    </span>
                </div>

                {/* Visual Counter */}
                <div style={{
                    width: '200px', height: '200px', borderRadius: '50%',
                    background: 'white', margin: '0 auto 2rem', border: '8px solid #ECEFF1',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        height: `${progress}%`, background: 'rgba(0, 191, 165, 0.1)',
                        transition: 'height 0.3s ease-out'
                    }} />
                    <div style={{ fontSize: '4rem', fontWeight: '900', color: 'var(--color-primary)', zIndex: 1, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        {currentCount}
                    </div>
                </div>

                {!isMeasuring && !finishing && (
                    <button
                        onClick={startMeasuring}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '16px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <Activity size={24} />
                        {permissionNeedsRequest ? '시작하기 (권한 허용)' : '측정 시작'}
                    </button>
                )}

                {isMeasuring && !finishing && (
                    <div style={{ animation: 'pulse 1.5s infinite ease-in-out' }}>
                        <p style={{ color: '#FBC02D', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '1rem' }}>
                            🐹 "자, 시작해볼까? 제리가 지켜보고 있어요!"
                        </p>
                        <p style={{ color: '#607D8B', fontSize: '0.9rem' }}>
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
