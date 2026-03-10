'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, Trash2, Save, Edit2, X, Settings } from 'lucide-react'
import { useMember } from '@/context/MemberContext'
import { ProfileIconPicker, ProfileIconDisplay } from '@/components/ProfileIcons'

type Member = {
    id: string
    name: string
    role: string
    pin: string
    points: number
    icon?: string | null
}

function ManageMembersContent() {
    const router = useRouter()
    const { currentMember } = useMember()
    const [members, setMembers] = useState<Member[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editFormData, setEditFormData] = useState({ name: '', role: '', pin: '', icon: 'star' })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [memberToDelete, setMemberToDelete] = useState<Member | null>(null)

    const searchParams = useSearchParams();
    const urlFamilyId = searchParams.get('familyId');
    const activeFamilyId = currentMember?.familyId || urlFamilyId;

    const fetchMembers = async () => {
        if (!activeFamilyId) return;
        try {
            const res = await fetch(`/api/members?familyId=${activeFamilyId}`, { cache: 'no-store' })
            const data = await res.json()
            setMembers(data)
        } catch (err) {
            console.error('Failed to fetch members:', err)
        }
    }

    useEffect(() => {
        if (activeFamilyId) {
            fetchMembers()
        }
    }, [activeFamilyId])

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

    const handleSaveEdit = async (id: string) => {
        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/members/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editFormData),
            })

            if (res.ok) {
                alert('멤버 정보가 수정되었습니다.')
                setEditingId(null)
                await fetchMembers()

                // If logged in user updated their own info, reload to update context
                if (currentMember?.id === id) {
                    const saved = localStorage.getItem('miracle_po_member');
                    if (saved) {
                        try {
                            const parsed = JSON.parse(saved);
                            localStorage.setItem('miracle_po_member', JSON.stringify({ ...parsed, ...editFormData }));
                        } catch (e) { }
                    }
                    location.reload()
                }
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

    const confirmDelete = async (member: Member) => {
        setIsSubmitting(true)
        try {
            const res = await fetch(`/api/members/${member.id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('멤버가 성공적으로 삭제되었습니다.');
                await fetchMembers();

                if (currentMember?.id === member.id) {
                    localStorage.removeItem('miracle_po_member');
                    router.push('/');
                } else {
                    setMemberToDelete(null);
                }
            } else {
                alert('멤버 삭제에 실패했습니다.');
            }
        } catch (err) {
            console.error(err);
            alert('오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main style={{ paddingBottom: '2rem' }}>
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
                        구성원 수정
                    </span>
                </div>
            </header>

            <section className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    가족 구성원의 정보를 수정하거나 삭제할 수 있습니다.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {members.map(member => (
                        <div key={member.id} className="card" style={{ padding: '1rem', marginBottom: 0 }}>
                            {editingId === member.id ? (
                                // EDIT MODE
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label className="label" style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-main)', marginBottom: '8px', fontWeight: 'bold' }}>이름</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={editFormData.name}
                                            onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                                            placeholder="예: 아빠, 첫째"
                                            style={{ marginBottom: '1.5rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="label" style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-main)', marginBottom: '8px', fontWeight: 'bold' }}>역할</label>
                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--bg-main)', padding: '6px', borderRadius: 'var(--radius-full)' }}>
                                            <button
                                                type="button"
                                                onClick={() => setEditFormData({ ...editFormData, role: 'CHILD' })}
                                                style={{
                                                    flex: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    padding: '12px',
                                                    borderRadius: 'var(--radius-full)',
                                                    border: 'none',
                                                    background: editFormData.role === 'CHILD' ? 'var(--bg-card)' : 'transparent',
                                                    color: editFormData.role === 'CHILD' ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                                                    fontWeight: editFormData.role === 'CHILD' ? 'bold' : 'normal',
                                                    boxShadow: editFormData.role === 'CHILD' ? 'var(--shadow-sm)' : 'none',
                                                    transition: 'all 0.2s',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <span style={{ fontSize: '1.5rem' }}>🧙</span>
                                                <span>자녀</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditFormData({ ...editFormData, role: 'PARENT' })}
                                                style={{
                                                    flex: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    padding: '12px',
                                                    borderRadius: 'var(--radius-full)',
                                                    border: 'none',
                                                    background: editFormData.role === 'PARENT' ? 'var(--bg-card)' : 'transparent',
                                                    color: editFormData.role === 'PARENT' ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                                                    fontWeight: editFormData.role === 'PARENT' ? 'bold' : 'normal',
                                                    boxShadow: editFormData.role === 'PARENT' ? 'var(--shadow-sm)' : 'none',
                                                    transition: 'all 0.2s',
                                                    cursor: 'pointer'
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
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                        <button className="btn" onClick={handleCancelEdit} disabled={isSubmitting} style={{ background: 'var(--bg-main)', color: 'var(--color-text-main)' }}>
                                            <X size={16} style={{ marginRight: '4px' }} /> 취소
                                        </button>
                                        <button className="btn btn-primary" onClick={() => handleSaveEdit(member.id)} disabled={isSubmitting}>
                                            <Save size={16} style={{ marginRight: '4px' }} /> 저장
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // VIEW MODE
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '50%',
                                            background: member.role === 'PARENT' ? 'var(--color-primary)' : 'var(--bg-main)',
                                            border: member.role === 'CHILD' ? '1px solid var(--border-light)' : 'none',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                                        }}>
                                            <ProfileIconDisplay name={member.icon || (member.role === 'PARENT' ? 'star' : 'star')} size={24} color={member.role === 'PARENT' ? '#FFFFFF' : 'var(--color-text-main)'} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text-main)' }}>{member.name}</h3>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                {member.role === 'PARENT' ? '부모' : '아이'} • {member.points.toLocaleString()}콩
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleEditClick(member)}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '8px' }}
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => setMemberToDelete(member)}
                                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {members.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                            등록된 가족이 없습니다.
                        </div>
                    )}
                </div>
            </section>

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
                                onClick={() => confirmDelete(memberToDelete)}
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

export default function ManageMembers() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ManageMembersContent />
        </Suspense>
    )
}
