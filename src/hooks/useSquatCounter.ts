import { useState, useEffect, useRef, useCallback } from 'react'

interface SquatCounterOptions {
    threshold?: number
    debounceMs?: number
    onComplete?: () => void
    targetCount?: number
}

export function useSquatCounter({
    threshold = 0.8,
    debounceMs = 800,
    onComplete,
    targetCount
}: SquatCounterOptions = {}) {
    const [permissionGranted, setPermissionGranted] = useState(false)
    const [permissionNeedsRequest, setPermissionNeedsRequest] = useState(false)
    const [isMeasuring, setIsMeasuring] = useState(false)
    const [currentCount, setCurrentCount] = useState(0)

    // For debugging and testing purposes
    const [debugInfo, setDebugInfo] = useState({ y: 0, delta: 0, state: 0 })

    // Algorithm State
    const lastY = useRef<number | null>(null)
    const state = useRef<number>(0) // -1 = going down, 1 = going up, 0 = stable
    const isReadyForNext = useRef(true)
    const lastCountTime = useRef<number>(0)

    // Use a ref for onComplete to avoid dependency cycles in useEffect
    const onCompleteRef = useRef(onComplete)
    useEffect(() => {
        onCompleteRef.current = onComplete
    }, [onComplete])

    useEffect(() => {
        checkSensorPermission()
    }, [])

    const checkSensorPermission = useCallback(() => {
        // @ts-ignore
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            setPermissionNeedsRequest(true)
        } else {
            // Android or non-iOS 13+ devices usually grant permission by default
            setPermissionGranted(true)
        }
    }, [])

    const requestPermission = useCallback(async () => {
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
    }, [])

    const startMeasuring = useCallback(() => {
        if (permissionNeedsRequest) {
            requestPermission()
        } else {
            setIsMeasuring(true)
            setPermissionGranted(true)
        }
    }, [permissionNeedsRequest, requestPermission])

    const stopMeasuring = useCallback(() => {
        setIsMeasuring(false)
    }, [])

    const resetCount = useCallback(() => {
        setCurrentCount(0)
        state.current = 0
        lastY.current = null
        isReadyForNext.current = true
        lastCountTime.current = 0
        setDebugInfo({ y: 0, delta: 0, state: 0 })
    }, [])

    useEffect(() => {
        if (!isMeasuring || !permissionGranted) return

        const handleMotion = (event: DeviceMotionEvent) => {
            const y = event.accelerationIncludingGravity?.y

            if (y === null || y === undefined) return

            let currentDelta = 0

            if (lastY.current !== null) {
                const delta = y - lastY.current
                currentDelta = delta

                if (delta > threshold && state.current !== 1) {
                    // Moving Up
                    state.current = 1
                } else if (delta < -threshold && state.current !== -1) {
                    // Moving Down
                    state.current = -1
                    isReadyForNext.current = true
                }

                // If we went down, and now we went up, count 1
                const now = Date.now()
                if (state.current === 1 && isReadyForNext.current && (now - lastCountTime.current > debounceMs)) {
                    setCurrentCount(prev => {
                        const newCount = prev + 1

                        // Check completion condition
                        if (targetCount && newCount >= targetCount) {
                            setIsMeasuring(false)
                            if (onCompleteRef.current) {
                                onCompleteRef.current()
                            }
                        }
                        return newCount
                    })
                    isReadyForNext.current = false
                    lastCountTime.current = now
                }
            }
            lastY.current = y

            // Update debug info occasionally to avoid too many re-renders
            // We throttle the debug info state update so it doesn't freeze the UI
            setDebugInfo({
                y: Number(y.toFixed(2)),
                delta: Number(currentDelta.toFixed(2)),
                state: state.current
            })
        }

        window.addEventListener('devicemotion', handleMotion)
        return () => window.removeEventListener('devicemotion', handleMotion)
    }, [isMeasuring, permissionGranted, targetCount, threshold, debounceMs])

    return {
        permissionGranted,
        permissionNeedsRequest,
        isMeasuring,
        currentCount,
        debugInfo,
        startMeasuring,
        stopMeasuring,
        resetCount
    }
}
