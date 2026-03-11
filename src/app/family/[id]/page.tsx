'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Users, ArrowLeft, Plus, Settings } from 'lucide-react'
import { useMember } from '@/context/MemberContext'
import { ProfileIconDisplay } from '@/components/ProfileIcons'

type Member = {
    id: string
    name: string
    role: string
    points: number
    pin: string
    icon?: string | null
}

export default function FamilyMemberSelectionPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { login } = useMember()
    const [members, setMembers] = useState<Member[]>([])
    const [family, setFamily] = useState<{ name: string, motto: string | null } | null>(null)
    const [loading, setLoading] = useState(true)
    const [familyId, setFamilyId] = useState<string | null>(null)



    useEffect(() => {
        params.then(p => {
            setFamilyId(p.id)
        })
    }, [params])

    const fetchFamilyInfo = async () => {
        if (!familyId) return
        try {
            const res = await fetch(`/api/families/${familyId}`, { cache: 'no-store' })
            const data = await res.json()
            if (!data.error) {
                setFamily(data)
                setMembers(data.members || [])
            }
            setLoading(false)
        } catch (e) {
            console.error(e)
            setLoading(false)
        }
    }

    useEffect(() => {
        if (familyId) {
            fetchFamilyInfo()
        }
    }, [familyId])

    const handleMemberLogin = (member: Member) => {
        login(member)
        router.push(`/family/${familyId}/dashboard`)
    }


    if (loading) {
        return (
            <main style={{ textAlign: 'center', paddingTop: '4rem', color: '#90A4AE' }}>
                가족 정보를 불러오는 중입니다...
            </main>
        )
    }

    if (!family) {
        return (
            <main style={{ textAlign: 'center', paddingTop: '4rem', color: '#FF5252' }}>
                가족 정보를 찾을 수 없습니다.
                <br /><br />
                <Link href="/" className="btn">돌아가기</Link>
            </main>
        )
    }

    return (
        <main>
            <header className="header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                    type="button"
                    onClick={() => router.push('/')}
                    style={{
                        background: 'transparent', border: 'none', padding: '8px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)'
                    }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <Users size={28} color="var(--color-primary)" />
                    <h1 className="text-playful" style={{ fontSize: '1.4rem', color: 'var(--color-text-main)', margin: 0 }}>
                        {family.name}
                    </h1>
                </div>
                <div>
                    <Link
                        href={`/family/manage?familyId=${familyId}`}
                        style={{
                            background: 'transparent', border: 'none', padding: '8px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)'
                        }}
                    >
                        <Settings size={24} />
                    </Link>
                </div>
            </header>

            <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 className="text-playful" style={{ fontSize: '1.6rem', color: 'var(--color-text-main)', marginBottom: '0.8rem' }}>
                    {family.motto || '오늘도 행복한 하루 보내세요!'}
                </h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>
                    본인을 선택해주세요.
                </p>
            </section>

            <section>
                {members.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--bg-main)', border: '1px dashed var(--border-light)', boxShadow: 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'var(--border-light)' }}>
                            <Users size={48} />
                        </div>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
                            이 가족 그룹에 아직 구성원이 없습니다.
                        </p>
                        <Link href={`/register?familyId=${familyId}`} className="btn btn-primary animate-pop">
                            <Plus size={18} style={{ marginRight: '8px', display: 'inline' }} />
                            첫 구성원 등록하기
                        </Link>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', padding: '0.5rem'
                    }}>
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="card reward-hover"
                                onClick={() => handleMemberLogin(member)}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                                    textDecoration: 'none', color: 'inherit', position: 'relative',
                                    padding: '0.8rem 0.5rem', marginBottom: 0, cursor: 'pointer',
                                    background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'none'
                                }}
                            >
                                {/* First Line: Avatar and Name */}
                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '6px', marginBottom: '0.4rem', width: '100%' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem'
                                    }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: member.role === 'PARENT' ? 'rgba(255, 202, 40, 0.3)' : 'var(--bg-main)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                        <ProfileIconDisplay name={member.icon || 'dog'} size={20} color={member.role === 'PARENT' ? 'var(--color-text-main)' : 'var(--color-text-main)'} />
                                        </div>
                                    <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-main)', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {member.name}
                                    </h3>
                                    </div>
                                </div>

                                {/* Second Line: Role Info & Actions */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                    <div style={{
                                        fontSize: '0.75rem', color: '#333333',
                                        background: member.role === 'PARENT' ? 'rgba(255, 202, 40, 0.3)' : 'rgba(224, 224, 224, 0.5)',
                                        padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontWeight: 'bold'
                                    }}>
                                        {member.role === 'PARENT' ? '대표' : '자녀'}
                                    </div>

                                </div>
                            </div>
                        ))}

                    </div>
                )}
            </section>


        </main>
    )
}
