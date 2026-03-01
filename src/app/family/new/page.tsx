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
            <div className="header" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                    type="button"
                    onClick={() => router.back()}
                    style={{
                        background: 'rgba(255,255,255,0.8)', border: 'none', padding: '10px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', color: '#546E7A', borderRadius: '50%',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.background = '#fff' }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.8)' }}
                >
                    <ArrowLeft size={22} />
                </button>
            </div>

            <section style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '72px',
                    height: '72px',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)',
                    color: 'white',
                    marginBottom: '1rem',
                    boxShadow: '0 8px 16px rgba(255, 154, 158, 0.3)',
                    transform: 'rotate(-5deg)'
                }}>
                    <Home size={36} style={{ transform: 'rotate(5deg)' }} />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#263238', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
                    우리 가족 만들기
                </h1>
                <p style={{ color: '#607D8B', fontSize: '1.05rem', lineHeight: '1.5' }}>
                    오마이콩 앱에서 다함께 콩을 모으며<br />행복을 키워갈 우리 가족을 등록해주세요!
                </p>
            </section>

            <section className="glass-panel" style={{ padding: '2.5rem 2rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
                {/* Decorative background elements */}
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', color: 'rgba(0, 191, 165, 0.05)' }}><Sparkles size={120} /></div>

                {error && (
                    <div style={{ background: '#FFEBEE', color: '#D32F2F', padding: '14px', borderRadius: '12px', marginBottom: '20px', fontSize: '0.95rem', textAlign: 'center', fontWeight: 'bold', border: '1px solid #FFCDD2' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', position: 'relative', zIndex: 1 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1rem', color: '#37474F', fontWeight: 'bold', marginBottom: '8px' }}>
                            <Home size={18} color="var(--color-primary)" />
                            가족 이름 <span style={{ color: '#E53935' }}>*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="예: 쿨하고 행복한 위미네"
                            style={{ padding: '16px', fontSize: '1.1rem', borderRadius: '16px', border: '2px solid transparent', background: 'rgba(255,255,255,0.7)', transition: 'all 0.3s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                            onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.border = '2px solid var(--color-primary)' }}
                            onBlur={(e) => { e.target.style.background = 'rgba(255,255,255,0.7)'; e.target.style.border = '2px solid transparent' }}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1rem', color: '#37474F', fontWeight: 'bold', marginBottom: '8px' }}>
                            <Heart size={18} color="#F06292" />
                            가훈 (선택)
                        </label>
                        <input
                            type="text"
                            value={motto}
                            onChange={(e) => setMotto(e.target.value)}
                            placeholder="예: 언제나 웃으며 살자!"
                            style={{ padding: '16px', fontSize: '1.1rem', borderRadius: '16px', border: '2px solid transparent', background: 'rgba(255,255,255,0.7)', transition: 'all 0.3s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                            onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.border = '2px solid #F06292' }}
                            onBlur={(e) => { e.target.style.background = 'rgba(255,255,255,0.7)'; e.target.style.border = '2px solid transparent' }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1rem', color: '#37474F', fontWeight: 'bold', marginBottom: '8px' }}>
                            <MapPin size={18} color="#FFB74D" />
                            사는 곳 (선택)
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="예: 제주도 서귀포시 남원읍 위미리"
                            style={{ padding: '16px', fontSize: '1.1rem', borderRadius: '16px', border: '2px solid transparent', background: 'rgba(255,255,255,0.7)', transition: 'all 0.3s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                            onFocus={(e) => { e.target.style.background = '#fff'; e.target.style.border = '2px solid #FFB74D' }}
                            onBlur={(e) => { e.target.style.background = 'rgba(255,255,255,0.7)'; e.target.style.border = '2px solid transparent' }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                            marginTop: '1.5rem',
                            padding: '18px',
                            fontSize: '1.15rem',
                            borderRadius: '16px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                            boxShadow: '0 6px 20px rgba(0, 191, 165, 0.4)',
                            border: 'none',
                            fontWeight: 'bold',
                            transition: 'all 0.3s ease'
                        }}
                        disabled={saving}
                        onMouseEnter={(e) => { if (!saving) e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 191, 165, 0.5)' }}
                        onMouseLeave={(e) => { if (!saving) e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 191, 165, 0.4)' }}
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
