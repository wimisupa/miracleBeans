'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMember } from '@/context/MemberContext'
import { ChevronLeft, Save, Users, Home, Heart, MapPin, Settings } from 'lucide-react'

export default function FamilyManagePage() {
    const router = useRouter()
    const { currentMember } = useMember()
    const [name, setName] = useState('')
    const [motto, setMotto] = useState('')
    const [location, setLocation] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const searchParams = useSearchParams()
    const urlFamilyId = searchParams.get('familyId')
    const activeFamilyId = currentMember?.familyId || urlFamilyId

    useEffect(() => {
        if (!activeFamilyId) {
            router.push('/')
            return
        }

        if (currentMember && currentMember.role !== 'PARENT') {
            router.push('/')
            return
        }

        const loadFamily = async () => {
            try {
                const res = await fetch(`/api/families/${activeFamilyId}`)
                if (res.ok) {
                    const data = await res.json()
                    setName(data.name || '')
                    setMotto(data.motto || '')
                    setLocation(data.location || '')
                }
            } catch (e) {
                console.error('Failed to load family data', e)
            }
            setLoading(false)
        }
        loadFamily()
    }, [currentMember, activeFamilyId, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name) {
            setError('가족명은 필수입니다.')
            return
        }

        setSaving(true)
        setError('')

        try {
            if (activeFamilyId) {
                // Update existing family
                const res = await fetch(`/api/families/${activeFamilyId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, motto, location })
                })
                if (res.ok) {
                    if (currentMember) {
                        router.push(`/family/${activeFamilyId}/dashboard`)
                    } else {
                        router.push(`/family/${activeFamilyId}`)
                    }
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
                    router.push(activeFamilyId ? `/family/${activeFamilyId}/dashboard` : '/')
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
            <header className="header" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', paddingTop: '1rem' }}>
                <button
                    onClick={() => {
                        if (currentMember?.familyId) {
                            router.push(`/family/${currentMember.familyId}/dashboard`)
                        } else if (urlFamilyId) {
                            router.push(`/family/${urlFamilyId}`)
                        } else {
                            router.push('/')
                        }
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#1A252C', marginRight: '1rem', padding: 0 }}
                >
                    <ChevronLeft size={32} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', color: '#1A252C', gap: '8px' }}>
                    <Settings size={32} color="var(--color-secondary)" />
                    <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                        가족 정보 수정
                    </span>
                </div>
            </header>

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
                                <Save size={22} /> 저장하기
                            </span>
                        )}
                    </button>
                </form>
            </section>
        </main>
    )
}
