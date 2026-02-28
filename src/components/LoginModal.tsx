'use client'

import { useState } from 'react'
import { X, Lock, Loader2 } from 'lucide-react'
import PinInput from './PinInput'
import { useMember } from '@/context/MemberContext'

type Member = {
    id: string
    name: string
    role: string
}

interface LoginModalProps {
    isOpen: boolean
    onClose: () => void
    member: Member | null
    onLoginSuccess?: () => void
}

export default function LoginModal({ isOpen, onClose, member, onLoginSuccess }: LoginModalProps) {
    const { login } = useMember()
    const [mode, setMode] = useState<'LOGIN' | 'CHANGE_Verify' | 'CHANGE_New' | 'CHANGE_Confirm'>('LOGIN')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Change PIN States
    const [oldPin, setOldPin] = useState('')
    const [newPin, setNewPin] = useState('')

    if (!isOpen || !member) return null

    const resetState = () => {
        setMode('LOGIN')
        setOldPin('')
        setNewPin('')
        setError('')
        setLoading(false)
    }

    const handleClose = () => {
        resetState()
        onClose()
    }

    const handlePinComplete = async (pin: string) => {
        setLoading(true)
        setError('')

        try {
            if (mode === 'LOGIN') {
                const res = await fetch('/api/auth/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ memberId: member.id, pin })
                })
                const data = await res.json()

                if (res.ok && data.success) {
                    login(data.member)
                    handleClose()
                    if (onLoginSuccess) onLoginSuccess()
                } else {
                    setError('비밀번호가 일치하지 않습니다.')
                }
            }
            else if (mode === 'CHANGE_Verify') {
                const res = await fetch('/api/auth/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ memberId: member.id, pin })
                })
                const data = await res.json()

                if (res.ok && data.success) {
                    setOldPin(pin)
                    setMode('CHANGE_New')
                } else {
                    setError('현재 비밀번호가 일치하지 않습니다.')
                }
            }
            else if (mode === 'CHANGE_New') {
                setNewPin(pin)
                setMode('CHANGE_Confirm')
            }
            else if (mode === 'CHANGE_Confirm') {
                if (pin === newPin) {
                    const res = await fetch('/api/members/pin', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ memberId: member.id, oldPin, newPin })
                    })

                    if (res.ok) {
                        alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.')
                        setMode('LOGIN')
                    } else {
                        setError('비밀번호 변경에 실패했습니다.')
                        setMode('CHANGE_New')
                    }
                } else {
                    setError('새 비밀번호가 일치하지 않습니다. 다시 입력해주세요.')
                    setMode('CHANGE_New')
                }
            }
        } catch (e) {
            setError('오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '24px',
                width: '90%',
                maxWidth: '400px',
                position: 'relative',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                animation: 'fadeIn 0.3s ease'
            }}>
                <button
                    onClick={handleClose}
                    style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: 'none', border: 'none', cursor: 'pointer', color: '#90A4AE'
                    }}
                >
                    <X size={24} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: member.role === 'PARENT' ? '#FFECB3' : '#B2DFDB',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem auto',
                        fontSize: '1.8rem'
                    }}>
                        {mode === 'LOGIN' ? (member.role === 'PARENT' ? '🪄' : '🧙') : <Lock size={32} color="#37474F" />}
                    </div>

                    <h2 style={{ fontSize: '1.4rem', color: '#37474F', marginBottom: '0.5rem' }}>
                        {mode === 'LOGIN' && `${member.name}님, 비밀번호를 입력하세요`}
                        {mode === 'CHANGE_Verify' && '현재 비밀번호 확인'}
                        {mode === 'CHANGE_New' && '새로운 비밀번호 입력'}
                        {mode === 'CHANGE_Confirm' && '새로운 비밀번호 확인'}
                    </h2>
                    <p style={{ color: '#90A4AE', fontSize: '0.9rem' }}>
                        {mode === 'LOGIN' && '4자리 숫자 비밀번호'}
                        {mode === 'CHANGE_Verify' && '현재 사용 중인 비밀번호를 입력해주세요.'}
                        {mode === 'CHANGE_New' && '변경할 4자리 숫자를 입력해주세요.'}
                        {mode === 'CHANGE_Confirm' && '비밀번호를 한 번 더 입력해주세요.'}
                    </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <PinInput key={mode} onComplete={handlePinComplete} disabled={loading} />
                </div>

                {error && (
                    <div style={{
                        color: '#D32F2F', textAlign: 'center', marginBottom: '1rem',
                        fontSize: '0.9rem', fontWeight: 'bold', background: '#FFEBEE',
                        padding: '8px', borderRadius: '8px'
                    }}>
                        {error}
                    </div>
                )}

                {loading && (
                    <div style={{ textAlign: 'center', color: 'var(--color-primary)' }}>
                        <Loader2 className="animate-spin" style={{ margin: '0 auto' }} />
                        <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>처리 중...</p>
                    </div>
                )}

                {mode === 'LOGIN' && (
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button
                            onClick={() => {
                                setError('')
                                setMode('CHANGE_Verify')
                            }}
                            style={{
                                background: 'none', border: 'none',
                                color: '#90A4AE', textDecoration: 'underline',
                                fontSize: '0.85rem', cursor: 'pointer'
                            }}
                        >
                            비밀번호를 변경하고 싶으신가요?
                        </button>
                    </div>
                )}

                {mode !== 'LOGIN' && (
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <button
                            onClick={resetState}
                            style={{
                                background: 'none', border: 'none',
                                color: '#90A4AE', textDecoration: 'underline',
                                fontSize: '0.85rem', cursor: 'pointer'
                            }}
                        >
                            돌아가기
                        </button>
                    </div>
                )}
            </div>
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}
