'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Home, Heart, MapPin, Sparkles } from 'lucide-react'

export default function NewFamilyPage() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [motto, setMotto] = useState('')
    const [location, setLocation] = useState('')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name) {
            setError('가족 이름은 필수입니다.')
            return
        }

        setSaving(true)
        setError('')

        try {
            const res = await fetch('/api/families', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, motto, location })
            })

            if (res.ok) {
                const family = await res.json()
                // Redirect to the newly created family's dashboard
                router.push(`/family/${family.id}`)
            } else {
                setError('가족 생성에 실패했습니다.')
            }
        } catch (e) {
            setError('오류가 발생했습니다. 다시 시도해 주세요.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <main style={{ paddingBottom: '3rem' }}>
            <div className="header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                    type="button"
                    onClick={() => router.back()}
                    style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border-light)', padding: '10px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', color: 'var(--color-text-main)', borderRadius: '50%',
                        boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
                >
                    <ArrowLeft size={22} />
                </button>
            </div>

            <section style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '64px',
                    height: '64px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-primary)',
                    color: '#333333',
                    marginBottom: '1rem',
                    boxShadow: '0 8px 16px rgba(255, 202, 40, 0.3)',
                    transform: 'rotate(-5deg)'
                }}>
                    <Home size={32} style={{ transform: 'rotate(5deg)' }} />
                </div>
                <h1 className="text-playful" style={{ fontSize: '2rem', color: 'var(--color-text-main)', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
                    우리 가족 만들기
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: '1.5' }}>
                    오마이콩 앱에서 다함께 콩을 모으며<br />행복을 키워갈 우리 가족을 등록해주세요!
                </p>
            </section>

            <section className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                {/* Decorative background elements */}
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', color: 'rgba(255, 202, 40, 0.1)' }}><Sparkles size={120} /></div>

                {error && (
                    <div style={{ background: '#FFEBEE', color: '#D32F2F', padding: '14px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.95rem', textAlign: 'center', fontWeight: 'bold', border: '1px solid #FFCDD2' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', position: 'relative', zIndex: 1 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Home size={18} color="var(--color-primary)" />
                            가족 이름 <span style={{ color: 'var(--color-accent)' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="예: 쿨하고 행복한 위미네"
                            className="input"
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Heart size={18} color="#F06292" />
                            가훈 (선택)
                        </label>
                        <input
                            type="text"
                            value={motto}
                            onChange={(e) => setMotto(e.target.value)}
                            placeholder="예: 언제나 웃으며 살자!"
                            className="input"
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={18} color="#4DB6AC" />
                            사는 곳 (선택)
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="예: 제주도 서귀포시 남원읍 위미리"
                            className="input"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary animate-pop"
                        style={{
                            marginTop: '1.5rem',
                            width: '100%',
                        }}
                        disabled={saving}
                    >
                        {saving ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Sparkles size={22} className="spinning" /> 생성 중...
                            </span>
                        ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Save size={22} /> 활기찬 우리가족 완성하기!
                            </span>
                        )}
                    </button>
                </form>
            </section>
        </main>
    )
}
