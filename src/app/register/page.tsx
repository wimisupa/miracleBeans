'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Link, Sparkles, UserPlus, Sprout, ChevronLeft } from 'lucide-react'
import { useMember } from '@/context/MemberContext'

function RegisterForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const familyId = searchParams.get('familyId')

    const [name, setName] = useState('')
    const [role, setRole] = useState<'PARENT' | 'CHILD'>('CHILD')
    const [pin, setPin] = useState('')
    const [loading, setLoading] = useState(false)
    const { currentMember, login } = useMember()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (pin.length !== 4) {
            alert('비밀번호 4자리를 입력해주세요.')
            return
        }
        setLoading(true)

        try {
            const res = await fetch('/api/members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, role, pin, familyId }),
            })

            if (res.ok) {
                const newMember = await res.json()
                // If there is no one logged in currently, log in the newly created member
                if (!currentMember) {
                    login(newMember)
                }

                if (familyId) {
                    router.push(`/family/${familyId}/dashboard`)
                } else {
                    router.push('/')
                }
                router.refresh()
            } else {
                alert('등록에 실패했습니다.')
            }
        } catch (error) {
            console.error(error)
            alert('오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <header className="header" style={{ display: 'flex', alignItems: 'center', paddingTop: '1rem' }}>
                <button
                    onClick={() => router.back()}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)', marginRight: '1rem', padding: 0 }}
                >
                    <ChevronLeft size={32} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-main)', gap: '8px' }}>
                    <UserPlus size={32} color="var(--color-primary)" />
                    <span className="text-playful" style={{ fontSize: '1.4rem', letterSpacing: '-0.02em' }}>
                        구성원 추가
                    </span>
                </div>
            </header>

            <div className="card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 className="text-playful" style={{ fontSize: '1.5rem', color: 'var(--color-text-main)' }}>새로운 가족을 환영해요!</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>함께 콩을 모아볼까요?</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">누구인가요?</label>
                        <input
                            type="text"
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="예: 아빠, 첫째, 제리"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <label className="label">역할</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => setRole('CHILD')}
                                className="btn"
                                style={{
                                    flex: 1,
                                    border: role === 'CHILD' ? '2px solid var(--color-secondary)' : '1px solid var(--border-light)',
                                    background: role === 'CHILD' ? 'var(--color-secondary)' : 'var(--bg-main)',
                                    color: role === 'CHILD' ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                                    flexDirection: 'column',
                                    padding: '1.5rem 1rem',
                                    gap: '0.5rem',
                                    borderRadius: 'var(--radius-md)',
                                    boxShadow: role === 'CHILD' ? 'var(--shadow-md)' : 'none'
                                }}
                            >
                                <span style={{ fontSize: '2rem' }}>🧙</span>
                                <span>자녀</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('PARENT')}
                                className="btn"
                                style={{
                                    flex: 1,
                                    border: role === 'PARENT' ? '2px solid var(--color-primary)' : '1px solid var(--border-light)',
                                    background: role === 'PARENT' ? 'var(--color-primary)' : 'var(--bg-main)',
                                    color: role === 'PARENT' ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                                    flexDirection: 'column',
                                    padding: '1.5rem 1rem',
                                    gap: '0.5rem',
                                    borderRadius: 'var(--radius-md)',
                                    boxShadow: role === 'PARENT' ? '0 4px 10px rgba(255, 202, 40, 0.3)' : 'none'
                                }}
                            >
                                <span style={{ fontSize: '2rem' }}>🪄</span>
                                <span>부모</span>
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <label className="label">비밀번호 설정</label>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>로그인할 때 사용할 4자리 숫자를 입력하세요.</p>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            className="input"
                            value={pin}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '')
                                if (val.length <= 4) setPin(val)
                            }}
                            placeholder="0000"
                            required
                            style={{ letterSpacing: '4px', fontWeight: 'bold', textAlign: 'center' }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '16px' }}
                        disabled={loading}
                    >
                        {loading ? '추가 중...' : '추가 완료'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default function Register() {
    return (
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>로딩 중...</div>}>
            <RegisterForm />
        </Suspense>
    )
}
