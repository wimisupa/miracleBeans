'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link, Sparkles, UserPlus, Sprout, ArrowLeft } from 'lucide-react'

export default function Register() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [role, setRole] = useState<'PARENT' | 'CHILD'>('CHILD') // Default to child
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, role }),
            })

            if (res.ok) {
                router.push('/') // Redirect to dashboard
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
            <header className="header">
                {/* Back button manually since we might come from login */}
                <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#37474F' }}>
                    <ArrowLeft size={28} />
                </button>
                <div className="logo" style={{ flex: 1, justifyContent: 'center', paddingRight: '28px' }}>
                    <Sprout size={28} />
                    <span>위미콩 가족 등록</span>
                </div>
            </header>

            <div className="card">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '80px', height: '80px', background: 'white', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}>
                        <UserPlus size={40} color="var(--color-secondary)" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', color: '#37474F' }}>새로운 가족을 환영해요!</h2>
                    <p style={{ color: '#90A4AE' }}>함께 콩을 모아볼까요?</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">이름 (누구인가요?)</label>
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
                                    border: '2px solid transparent',
                                    background: role === 'CHILD' ? 'var(--color-secondary)' : 'rgba(255,255,255,0.5)',
                                    color: role === 'CHILD' ? 'white' : '#607D8B',
                                    flexDirection: 'column',
                                    padding: '1.5rem 1rem',
                                    gap: '0.5rem',
                                    borderRadius: '20px',
                                    boxShadow: role === 'CHILD' ? '0 4px 12px rgba(0, 191, 165, 0.3)' : 'none'
                                }}
                            >
                                <span style={{ fontSize: '2rem' }}>🌱</span>
                                <span>자녀</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('PARENT')}
                                className="btn"
                                style={{
                                    flex: 1,
                                    border: '2px solid transparent',
                                    background: role === 'PARENT' ? '#FFD54F' : 'rgba(255,255,255,0.5)',
                                    color: role === 'PARENT' ? '#37474F' : '#607D8B',
                                    flexDirection: 'column',
                                    padding: '1.5rem 1rem',
                                    gap: '0.5rem',
                                    borderRadius: '20px',
                                    boxShadow: role === 'PARENT' ? '0 4px 12px rgba(255, 193, 7, 0.3)' : 'none'
                                }}
                            >
                                <span style={{ fontSize: '2rem' }}>👑</span>
                                <span>부모님</span>
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '16px' }}
                        disabled={loading}
                    >
                        {loading ? '등록 중...' : '등록 완료'}
                        <UserPlus size={20} style={{ marginLeft: '8px' }} />
                    </button>
                </form>
            </div>
        </div>
    )
}
