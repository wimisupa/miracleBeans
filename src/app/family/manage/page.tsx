'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMember } from '@/context/MemberContext'
import { ArrowLeft, Save, Users, Home, Heart, MapPin } from 'lucide-react'

export default function FamilyManagePage() {
    const router = useRouter()
    const { currentMember } = useMember()
    const [name, setName] = useState('')
    const [motto, setMotto] = useState('')
    const [location, setLocation] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!currentMember) {
            router.push('/')
            return
        }
        if (currentMember.role !== 'PARENT') {
            router.push('/')
            return
        }

        const loadFamily = async () => {
            if (currentMember.familyId) {
                try {
                    const res = await fetch(`/api/families/${currentMember.familyId}`)
                    if (res.ok) {
                        const data = await res.json()
                        setName(data.name || '')
                        setMotto(data.motto || '')
                        setLocation(data.location || '')
                    }
                } catch (e) {
                    console.error('Failed to load family data', e)
                }
            }
            setLoading(false)
        }
        loadFamily()
    }, [currentMember, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name) {
            setError('가족명은 필수입니다.')
            return
        }

        setSaving(true)
        setError('')

        try {
            if (currentMember?.familyId) {
                // Update existing family
                const res = await fetch(`/api/families/${currentMember.familyId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, motto, location })
                })
                if (res.ok) {
                    router.push('/')
                } else {
                    setError('가족 정보 수정에 실패했습니다.')
                }
            } else {
                // Register new family (fallback, technically handled by DB push logic initially)
                const res = await fetch('/api/families', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, motto, location })
                })
                if (res.ok) {
                    // Update current member to be attached to this family
                    // We need a member update endpoint for this, omitted for brevity as seeding handles initial
                    router.push('/')
                } else {
                    setError('가족 등록에 실패했습니다.')
                }
            }
        } catch (e) {
            setError('오류가 발생했습니다. 다시 시도해 주세요.')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return null

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
                    background: 'linear-gradient(135deg, #81D4FA 0%, #B39DDB 100%)',
                    color: 'white',
                    marginBottom: '1rem',
                    boxShadow: '0 8px 16px rgba(129, 212, 250, 0.3)',
                    transform: 'rotate(-5deg)'
                }}>
                    <Users size={36} style={{ transform: 'rotate(5deg)' }} />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#263238', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
                    가족 정보 관리
                </h1>
                <p style={{ color: '#607D8B', fontSize: '1.05rem', lineHeight: '1.5' }}>
                    우리 가족을 소개하는 소중한 정보를<br />언제든지 자유롭게 수정해보세요!
                </p>
            </section>

            <section className="glass-panel" style={{ padding: '2.5rem 2rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
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
                            placeholder="예: 오마이콩 패밀리"
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
                            placeholder="예: 느리지만 쿨한 가족"
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
                            placeholder="예: 서귀포시 위미리"
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
                                <Save size={22} style={{ animation: 'pulse 1.5s infinite' }} /> 저장 중...
                            </span>
                        ) : (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Save size={22} /> 새롭게 저장하기!
                            </span>
                        )}
                    </button>
                </form>
            </section>
        </main>
    )
}
