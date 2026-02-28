'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Save, Edit2, X } from 'lucide-react'
import { useMember } from '@/context/MemberContext'

type Member = {
    id: string
    name: string
    role: string
    pin: string
    points: number
}

export default function ManageMembers() {
    const router = useRouter()
    const { currentMember } = useMember()
    const [members, setMembers] = useState<Member[]>([])
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editFormData, setEditFormData] = useState({ name: '', role: '', pin: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [memberToDelete, setMemberToDelete] = useState<Member | null>(null)

    const fetchMembers = async () => {
        try {
            const res = await fetch('/api/members')
            const data = await res.json()
            setMembers(data)
        } catch (err) {
            console.error('Failed to fetch members:', err)
        }
    }

    useEffect(() => {
        fetchMembers()
    }, [])

    const handleEditClick = (member: Member) => {
        setEditingId(member.id)
        setEditFormData({
            name: member.name,
            role: member.role,
            pin: member.pin
        })
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditFormData({ name: '', role: '', pin: '' })
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
            <header className="header" style={{ marginBottom: '2rem' }}>
                <button className="icon-btn" onClick={() => router.push('/')}>
                    <ArrowLeft size={24} />
                </button>
                <h1>가족 관리</h1>
                <div style={{ width: 40 }} /> {/* Spacer */}
            </header>

            <section className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                <p style={{ color: '#607D8B', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                    가족 구성원의 정보를 수정하거나 삭제할 수 있습니다.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {members.map(member => (
                        <div key={member.id} className="card" style={{ padding: '1rem', marginBottom: 0 }}>
                            {editingId === member.id ? (
                                // EDIT MODE
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label className="label" style={{ display: 'block', fontSize: '0.9rem', color: '#455A64', marginBottom: '8px', fontWeight: 'bold' }}>이름</label>
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
                                        <label className="label" style={{ display: 'block', fontSize: '0.9rem', color: '#455A64', marginBottom: '8px', fontWeight: 'bold' }}>역할</label>
                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <button
                                                type="button"
                                                className="btn"
                                                onClick={() => setEditFormData({ ...editFormData, role: 'CHILD' })}
                                                style={{
                                                    flex: 1,
                                                    border: '2px solid transparent',
                                                    background: editFormData.role === 'CHILD' ? 'var(--color-secondary)' : 'rgba(255,255,255,0.5)',
                                                    color: editFormData.role === 'CHILD' ? 'white' : '#607D8B',
                                                    flexDirection: 'column',
                                                    padding: '1.5rem 1rem',
                                                    gap: '0.5rem',
                                                    borderRadius: '20px',
                                                    boxShadow: editFormData.role === 'CHILD' ? '0 4px 12px rgba(0, 191, 165, 0.3)' : 'none'
                                                }}
                                            >
                                                <span style={{ fontSize: '2rem' }}>🧙</span>
                                                <span style={{ fontWeight: 'bold' }}>자녀</span>
                                            </button>
                                            <button
                                                type="button"
                                                className="btn"
                                                onClick={() => setEditFormData({ ...editFormData, role: 'PARENT' })}
                                                style={{
                                                    flex: 1,
                                                    border: '2px solid transparent',
                                                    background: editFormData.role === 'PARENT' ? '#FFD54F' : 'rgba(255,255,255,0.5)',
                                                    color: editFormData.role === 'PARENT' ? '#37474F' : '#607D8B',
                                                    flexDirection: 'column',
                                                    padding: '1.5rem 1rem',
                                                    gap: '0.5rem',
                                                    borderRadius: '20px',
                                                    boxShadow: editFormData.role === 'PARENT' ? '0 4px 12px rgba(255, 193, 7, 0.3)' : 'none'
                                                }}
                                            >
                                                <span style={{ fontSize: '2rem' }}>🪄</span>
                                                <span style={{ fontWeight: 'bold' }}>부모</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="label" style={{ display: 'block', fontSize: '0.9rem', color: '#455A64', marginBottom: '4px', fontWeight: 'bold' }}>비밀번호 변경</label>
                                        <p style={{ color: '#90A4AE', fontSize: '0.85rem', marginBottom: '8px' }}>새로운 4자리 숫자를 입력하세요.</p>
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
                                        <button className="btn" onClick={handleCancelEdit} disabled={isSubmitting}>
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
                                            background: member.role === 'PARENT' ? 'linear-gradient(135deg, #FFD54F, #FFecb3)' : 'linear-gradient(135deg, #80CBC4, #E0F2F1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                                        }}>
                                            {member.role === 'PARENT' ? '🪄' : '🧙'}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#37474F' }}>{member.name}</h3>
                                            <span style={{ fontSize: '0.8rem', color: '#607D8B' }}>
                                                {member.role === 'PARENT' ? '부모' : '아이'} • {member.points.toLocaleString()}콩
                                            </span>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => handleEditClick(member)}
                                            style={{ background: 'transparent', border: 'none', color: '#607D8B', cursor: 'pointer', padding: '8px' }}
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => setMemberToDelete(member)}
                                            style={{ background: 'transparent', border: 'none', color: '#FF5252', cursor: 'pointer', padding: '8px' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    {members.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#607D8B' }}>
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
                            width: '64px', height: '64px', borderRadius: '50%', background: '#FFEBEE',
                            color: '#FF5252', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem auto'
                        }}>
                            <Trash2 size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.2rem', color: '#37474F', marginBottom: '1rem' }}>정말 삭제하시겠습니까?</h2>
                        <p style={{ color: '#607D8B', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5', wordBreak: 'keep-all' }}>
                            <strong style={{ color: '#FF5252' }}>{memberToDelete.name}</strong> 멤버의 모든 등록된 할 일, 일과, 포인트 정보가 <strong style={{ color: '#FF5252' }}>영구적으로 삭제</strong>됩니다.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                className="btn"
                                style={{ flex: 1, padding: '0.8rem', background: 'rgba(0,0,0,0.05)', color: '#607D8B' }}
                                onClick={() => setMemberToDelete(null)}
                                disabled={isSubmitting}
                            >
                                취소
                            </button>
                            <button
                                className="btn"
                                style={{ flex: 1, padding: '0.8rem', background: '#FF5252', color: 'white' }}
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
