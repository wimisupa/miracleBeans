'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, Activity, RotateCcw } from 'lucide-react'

export default function MotionTestPage() {
    const [permissionGranted, setPermissionGranted] = useState(false)
    const [permissionNeedsRequest, setPermissionNeedsRequest] = useState(false)
    const [isMeasuring, setIsMeasuring] = useState(false)

    const [currentCount, setCurrentCount] = useState(0)
    const [debugInfo, setDebugInfo] = useState({ y: 0, delta: 0, state: 0 })

    // Algorithm State
    const lastY = useRef<number | null>(null)
    // -1 = going down, 1 = going up, 0 = stable
    const state = useRef<number>(0)
    const isReadyForNext = useRef(true)
    const lastCountTime = useRef<number>(0)

    useEffect(() => {
        checkSensorPermission()
    }, [])

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
            alert('센서 권한 요청 중 오류가 발생했습니다. (HTTPS 웹사이트 환경 필수)')
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

    const stopMeasuring = () => {
        setIsMeasuring(false)
    }

    const resetCount = () => {
        setCurrentCount(0)
        state.current = 0
        lastY.current = null
        isReadyForNext.current = true
        lastCountTime.current = 0
        setDebugInfo({ y: 0, delta: 0, state: 0 })
    }

    useEffect(() => {
        if (!isMeasuring || !permissionGranted) return

        const handleMotion = (event: DeviceMotionEvent) => {
            const y = event.accelerationIncludingGravity?.y

            if (y === null || y === undefined) return

            let currentDelta = 0

            if (lastY.current !== null) {
                const delta = y - lastY.current
                currentDelta = delta

                // Heuristic for Up/Down movement detection
                const THRESHOLD = 1.5 // Increased threshold slightly for strictness

                if (delta > THRESHOLD && state.current !== 1) {
                    // Moving Up
                    state.current = 1
                } else if (delta < -THRESHOLD && state.current !== -1) {
                    // Moving Down
                    state.current = -1
                    isReadyForNext.current = true
                }

                // If we went down, and now we went up, count 1
                // Add a debounce of 800ms to prevent double counting a single squat
                const now = Date.now()
                if (state.current === 1 && isReadyForNext.current && (now - lastCountTime.current > 800)) {
                    setCurrentCount(prev => prev + 1)
                    isReadyForNext.current = false
                    lastCountTime.current = now
                }
            }
            lastY.current = y

            // Update debug info occasionally to avoid too many re-renders
            setDebugInfo({
                y: Number(y.toFixed(2)),
                delta: Number(currentDelta.toFixed(2)),
                state: state.current
            })
        }

        window.addEventListener('devicemotion', handleMotion)
        return () => window.removeEventListener('devicemotion', handleMotion)
    }, [isMeasuring, permissionGranted])

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <header className="header" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', paddingTop: '1rem' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', color: '#1A252C', textDecoration: 'none', marginRight: '1rem' }}>
                    <ChevronLeft size={32} />
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', color: '#1A252C', gap: '8px' }}>
                    <Activity size={32} color="var(--color-primary)" />
                    <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                        모션 센서 테스트
                    </span>
                </div>
            </header>

            <div className="card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <h1 style={{ fontSize: '1.3rem', color: '#37474F', marginBottom: '1rem' }}>스쿼트 카운터 디버깅 도구</h1>
                <p style={{ color: '#607D8B', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    이 페이지는 로그인 없이 스마트폰 가속도 센서를 테스트할 수 있습니다.
                </p>

                {/* Visual Counter */}
                <div style={{
                    width: '180px', height: '180px', borderRadius: '50%',
                    background: 'white', margin: '0 auto 2rem', border: '8px solid #ECEFF1',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ fontSize: '4rem', fontWeight: '900', color: 'var(--color-primary)', zIndex: 1, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        {currentCount}
                    </div>
                </div>

                {!isMeasuring ? (
                    <button
                        onClick={startMeasuring}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '1rem' }}
                    >
                        <Activity size={20} />
                        {permissionNeedsRequest ? '센서 접근 허용 및 시작' : '테스트 시작하기'}
                    </button>
                ) : (
                    <button
                        onClick={stopMeasuring}
                        className="btn"
                        style={{ width: '100%', padding: '16px', fontSize: '1.1rem', background: '#FF5252', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '1rem' }}
                    >
                        <Activity size={20} />
                        측정 중지
                    </button>
                )}

                <button
                    onClick={resetCount}
                    className="btn"
                    style={{ width: '100%', padding: '12px', fontSize: '1rem', background: '#ECEFF1', color: '#607D8B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                    <RotateCcw size={18} />
                    카운트 & 상태 초기화
                </button>

                <div style={{ marginTop: '2rem', textAlign: 'left', background: '#263238', color: '#00E676', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    <div style={{ marginBottom: '8px', color: '#B0BEC5', fontWeight: 'bold' }}>디버깅 정보 (실시간)</div>
                    <div>Y축 가속도: {debugInfo.y} m/s²</div>
                    <div>Y축 변화량(Delta): {debugInfo.delta} m/s²</div>
                    <div>현재 상태: {debugInfo.state === 1 ? '상승 중 (1)' : debugInfo.state === -1 ? '하강 중 (-1)' : '대기 (0)'}</div>
                </div>
            </div>
        </div>
    )
}
