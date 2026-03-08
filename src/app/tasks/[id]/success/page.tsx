'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Home } from 'lucide-react'
import { useMember } from '@/context/MemberContext'

export default function TaskSuccessPage() {
    const router = useRouter()
    const params = useParams()
    const taskId = params.id as string
    const { currentMember } = useMember()

    const [status, setStatus] = useState<'submitting' | 'success' | 'error'>('submitting')

    useEffect(() => {
        const playSuccessSound = () => {
            try {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                if (!AudioContextClass) return;
                const ctx = new AudioContextClass();

                const osc = ctx.createOscillator();
                const gainNode = ctx.createGain();

                osc.connect(gainNode);
                gainNode.connect(ctx.destination);

                // Ascending chime: C5, E5, G5, C6
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, ctx.currentTime);
                osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
                osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
                osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3);

                gainNode.gain.setValueAtTime(0, ctx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
                gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.4);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.8);
            } catch (e) {
                console.error('Audio play error:', e)
            }
        }

        const submitTask = async () => {
            try {
                const res = await fetch(`/api/tasks/${taskId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'PENDING' })
                })

                if (res.ok) {
                    playSuccessSound()
                    setStatus('success')
                } else {
                    setStatus('error')
                }
            } catch (e) {
                console.error(e)
                setStatus('error')
            }
        }

        submitTask()
    }, [taskId])

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
            textAlign: 'center',
            padding: '2rem'
        }}>
            {status === 'submitting' && (
                <div style={{ color: 'var(--color-text-muted)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}>⏳</div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>승인 요청 중...</h2>
                    <p>수고했어요! 제리에게 결과를 전송하고 있어요.</p>
                </div>
            )}

            {status === 'success' && (
                <div style={{ animation: 'bounceIn 0.5s ease-out' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                    <h2 className="text-playful" style={{ fontSize: '2rem', color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>수고했어요!</h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', marginBottom: '2rem' }}>달성 완료! 승인 요청이 성공적으로 전송되었습니다.</p>

                    <button
                        onClick={() => currentMember?.familyId ? router.push(`/family/${currentMember.familyId}/dashboard`) : router.push('/')}
                        className="btn btn-primary animate-pop"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            fontSize: '1.1rem',
                            borderRadius: 'var(--radius-full)'
                        }}
                    >
                        <Home size={20} />
                        홈으로 돌아가기
                    </button>
                </div>
            )}

            {status === 'error' && (
                <div>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😢</div>
                    <h2 className="text-playful" style={{ fontSize: '1.5rem', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>오류가 발생했습니다</h2>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>승인 요청 전송에 실패했습니다. 다시 시도해 주세요.</p>
                    <button
                        onClick={() => currentMember?.familyId ? router.push(`/family/${currentMember.familyId}/dashboard`) : router.push('/')}
                        className="btn animate-pop"
                        style={{ padding: '10px 20px', background: 'var(--bg-card)', color: 'var(--color-text-main)', border: '1px solid var(--border-light)' }}
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            )}

            <style jsx global>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes bounceIn {
                    0% { transform: scale(0.5); opacity: 0; }
                    70% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    )
}
