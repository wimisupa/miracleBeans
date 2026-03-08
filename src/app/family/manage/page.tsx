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
            <header className="header" style={{ display: 'flex', alignItems: 'center', paddingTop: '1rem' }}>
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
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)', marginRight: '1rem', padding: 0 }}
                >
                    <ChevronLeft size={32} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-main)', gap: '8px' }}>
                    <Settings size={32} color="var(--color-secondary)" />
                    <span className="text-playful" style={{ fontSize: '1.4rem', letterSpacing: '-0.02em' }}>
                        가족 정보 수정
                    </span>
                </div>
            </header>

            <section className="card" style={{ padding: '2.5rem 2rem', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden' }}>
                {error && (
                    <div style={{ background: '#FFEBEE', color: '#D32F2F', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.95rem', textAlign: 'center', fontWeight: 'bold', border: '1px solid #FFCDD2' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem', position: 'relative', zIndex: 1 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Home size={18} color="var(--color-primary)" />
                            가족 이름 <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="예: 오마이콩 패밀리"
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
                            className="input"
                            value={motto}
                            onChange={(e) => setMotto(e.target.value)}
                            placeholder="예: 느리지만 쿨한 가족"
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={18} color="#FFB74D" />
                            사는 곳 (선택)
                        </label>
                        <input
                            type="text"
                            className="input"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="예: 서귀포시 위미리"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary animate-pop"
                        style={{ marginTop: '1.5rem', justifyContent: 'center' }}
                        disabled={saving}
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
