'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useMember } from '@/context/MemberContext'
import { ChevronLeft, Save, Users, Home, Heart, MapPin, Settings, Edit2, Trash2, X, Plus } from 'lucide-react'
import { ProfileIconDisplay, ProfileIconPicker } from '@/components/ProfileIcons'

type Member = {
    id: string
    name: string
    role: string
    points: number
    pin: string
    icon?: string | null
}

export default function FamilyManagePage() {
    const router = useRouter()
    const { currentMember } = useMember()
    const [name, setName] = useState('')
    const [motto, setMotto] = useState('')
    const [location, setLocation] = useState('')
    const [members, setMembers] = useState<Member[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const searchParams = useSearchParams()
    const urlFamilyId = searchParams.get('familyId')
    const activeFamilyId = currentMember?.familyId || urlFamilyId

    // Edit & Delete State
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editFormData, setEditFormData] = useState({ name: '', role: '', pin: '', icon: 'star' })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [memberToDelete, setMemberToDelete] = useState<Member | null>(null)

    const loadFamily = useCallback(async () => {
        if (!activeFamilyId) return
        try {
            const res = await fetch(`/api/families/${activeFamilyId}`, { cache: 'no-store' })
            if (res.ok) {
                const data = await res.json()
                setName(data.name || '')
                setMotto(data.motto || '')
                setLocation(data.location || '')
                setMembers(data.members || [])
            }
        } catch (e) {
            console.error('Failed to load family data', e)
        }
        setLoading(false)
    }, [activeFamilyId])

    useEffect(() => {
        if (!activeFamilyId) {
            router.push('/')
            return
        }

        if (currentMember && currentMember.role !== 'PARENT') {
            router.push('/')
            return
        }

        loadFamily()
    }, [currentMember, activeFamilyId, router, loadFamily])

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

    const handleEditClick = (member: Member) => {
        setEditingId(member.id)
        setEditFormData({
            name: member.name,
            role: member.role,
            pin: member.pin,
            icon: member.icon || 'star'
        })
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditFormData({ name: '', role: '', pin: '', icon: 'star' })
    }

    const handleSaveEdit = async () => {
        if (!editingId) return
        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/members/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData),
            })
            if (res.ok) {
                setEditingId(null)
                await loadFamily()
            } else {
                const errorData = await res.json()
                alert(`수정 실패: ${errorData.error}`)
            }
        } catch (err) {
            console.error(err)
            alert('저장 중 오류가 발생했습니다.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteClick = (member: Member) => {
        setMemberToDelete(member)
    }

    const confirmDelete = async () => {
        if (!memberToDelete) return
        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/members/${memberToDelete.id}`, { method: 'DELETE' });
            if (res.ok) {
                setMemberToDelete(null)
                await loadFamily()
            } else {
                alert('멤버 삭제에 실패했습니다.')
            }
        } catch (err) {
            console.error(err)
            alert('오류가 발생했습니다.')
        } finally {
            setIsSubmitting(false)
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
                        가족 정보 설정
                    </span>
                </div>
            </header>

            <section className="card" style={{ padding: '2.5rem 2rem', borderRadius: 'var(--radius-lg)', position: 'relative', overflow: 'hidden', marginBottom: '1.5rem' }}>
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
                                <Save size={22} /> 정보 변경 저장
                            </span>
                        )}
                    </button>
                </form>
            </section>

            {activeFamilyId && (
                <section className="card" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
                    <h2 style={{ fontSize: '1.2rem', color: 'var(--color-text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={24} color="var(--color-primary)" />
                        구성원 관리
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {members.map((member) => (
                            <div key={member.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-light)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div
                                        style={{
                                            width: '40px', height: '40px', borderRadius: '50%',
                                            background: member.role === 'PARENT' ? 'var(--color-primary)' : 'var(--bg-card)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: 'var(--shadow-sm)',
                                            border: member.role === 'CHILD' ? '2px solid var(--border-light)' : 'none'
                                        }}
                                    >
                                        <ProfileIconDisplay name={member.icon || 'star'} size={24} color={member.role === 'PARENT' ? '#FFFFFF' : 'var(--color-text-main)'} />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
                                                {member.name}
                                            </h3>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span style={{
                                                fontSize: '0.75rem', color: '#333333',
                                                background: member.role === 'PARENT' ? 'rgba(255, 202, 40, 0.3)' : 'rgba(224, 224, 224, 0.5)',
                                                padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontWeight: 'bold'
                                            }}>
                                                {member.role === 'PARENT' ? '대표' : '자녀'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => handleEditClick(member)}
                                        style={{
                                            background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                                            borderRadius: '50%', width: '32px', height: '32px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--color-text-muted)', cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(member)}
                                        style={{
                                            background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                                            borderRadius: '50%', width: '32px', height: '32px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <Link href={`/register?familyId=${activeFamilyId}`} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            padding: '1rem', background: 'transparent', borderRadius: 'var(--radius-md)',
                            border: '2px dashed var(--border-light)', color: 'var(--color-text-muted)',
                            textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.2s', marginTop: '0.5rem'
                        }}>
                            <Plus size={20} /> 새 구성원 추가
                        </Link>
                    </div>
                </section>
            )}

            {/* Edit Member Modal */}
            {editingId && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', marginBottom: 0, maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 style={{ fontSize: '1.2rem', color: 'var(--color-text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Edit2 size={24} color="var(--color-secondary)" />
                            구성원 수정
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label className="label" style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-main)', marginBottom: '8px', fontWeight: 'bold' }}>이름</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={editFormData.name}
                                    onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                                    placeholder="예: 아빠, 첫째"
                                />
                            </div>
                            <div>
                                <label className="label" style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-main)', marginBottom: '8px', fontWeight: 'bold' }}>역할</label>
                                <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-main)', padding: '6px', borderRadius: 'var(--radius-full)' }}>
                                    <button
                                        type="button"
                                        onClick={() => setEditFormData({ ...editFormData, role: 'CHILD' })}
                                        style={{
                                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            padding: '12px', borderRadius: 'var(--radius-full)', border: 'none',
                                            background: editFormData.role === 'CHILD' ? 'var(--bg-card)' : 'transparent',
                                            color: editFormData.role === 'CHILD' ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                                            fontWeight: editFormData.role === 'CHILD' ? 'bold' : 'normal',
                                            boxShadow: editFormData.role === 'CHILD' ? 'var(--shadow-sm)' : 'none',
                                            transition: 'all 0.2s', cursor: 'pointer'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.5rem' }}>🧙</span>
                                        <span>자녀</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditFormData({ ...editFormData, role: 'PARENT' })}
                                        style={{
                                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            padding: '12px', borderRadius: 'var(--radius-full)', border: 'none',
                                            background: editFormData.role === 'PARENT' ? 'var(--bg-card)' : 'transparent',
                                            color: editFormData.role === 'PARENT' ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                                            fontWeight: editFormData.role === 'PARENT' ? 'bold' : 'normal',
                                            boxShadow: editFormData.role === 'PARENT' ? 'var(--shadow-sm)' : 'none',
                                            transition: 'all 0.2s', cursor: 'pointer'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.5rem' }}>🪄</span>
                                        <span>부모</span>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="label" style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-main)', marginBottom: '8px', fontWeight: 'bold' }}>프로필 아이콘</label>
                                <ProfileIconPicker
                                    selected={editFormData.icon}
                                    onSelect={(icon) => setEditFormData({ ...editFormData, icon })}
                                />
                            </div>
                            <div>
                                <label className="label" style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-main)', marginBottom: '4px', fontWeight: 'bold' }}>비밀번호 변경</label>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '8px' }}>새로운 4자리 숫자를 입력하세요.</p>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={4}
                                    className="input"
                                    value={editFormData.pin}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        if (val.length <= 4) setEditFormData({ ...editFormData, pin: val });
                                    }}
                                    placeholder="0000"
                                    style={{ letterSpacing: '4px', fontWeight: 'bold', textAlign: 'center' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button className="btn" onClick={handleCancelEdit} disabled={isSubmitting} style={{ background: 'var(--bg-main)', color: 'var(--color-text-main)', flex: 1 }}>
                                    <X size={16} style={{ marginRight: '4px' }} /> 취소
                                </button>
                                <button className="btn btn-primary" onClick={handleSaveEdit} disabled={isSubmitting} style={{ flex: 1 }}>
                                    <Save size={16} style={{ marginRight: '4px' }} /> {isSubmitting ? '저장 중...' : '저장'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {memberToDelete && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', textAlign: 'center', marginBottom: 0 }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: 'var(--radius-full)', background: '#FFEBEE',
                            color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem auto'
                        }}>
                            <Trash2 size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.2rem', color: 'var(--color-text-main)', marginBottom: '1rem' }}>정말 삭제하시겠습니까?</h2>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5', wordBreak: 'keep-all' }}>
                            <strong style={{ color: '#ef4444' }}>{memberToDelete.name}</strong> 멤버의 모든 등록된 할 일, 일과, 포인트 정보가 <strong style={{ color: '#ef4444' }}>영구적으로 삭제</strong>됩니다.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                className="btn"
                                style={{ flex: 1, padding: '0.8rem', background: 'var(--bg-main)', color: 'var(--color-text-main)' }}
                                onClick={() => setMemberToDelete(null)}
                                disabled={isSubmitting}
                            >
                                취소
                            </button>
                            <button
                                className="btn"
                                style={{ flex: 1, padding: '0.8rem', background: '#ef4444', color: 'white' }}
                                onClick={confirmDelete}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? '삭제 중...' : '삭제 완료'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
