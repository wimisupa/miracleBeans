'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Users, Sprout, ArrowLeft, Plus, Settings, UserCog } from 'lucide-react'
import { useMember } from '@/context/MemberContext'

type Member = {
    id: string
    name: string
    role: string
    points: number
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

    useEffect(() => {
        if (!familyId) return

        // 1. Fetch Family Details
        fetch(`/api/families/${familyId}`)
            .then(res => res.json())
            .then(data => {
                if (!data.error) {
                    setFamily(data)
                    // Optional: filter members by this family ID if the API supported it
                    // For now we get from the family query itself
                    setMembers(data.members || [])
                }
                setLoading(false)
            })
            .catch(e => {
                console.error(e)
                setLoading(false)
            })
    }, [familyId])

    const handleMemberLogin = (member: Member) => {
        // Authenticate as this member
        login(member)
        // Redirect to the dashboard for this family
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
            <header className="header" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                    type="button"
                    onClick={() => router.push('/')}
                    style={{
                        background: 'transparent', border: 'none', padding: '8px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', color: '#607D8B'
                    }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <Users size={28} color="var(--color-secondary)" />
                    <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#37474F', margin: 0 }}>
                        {family.name}
                    </h1>
                </div>
            </header>



            <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#2C3E50', marginBottom: '0.8rem', letterSpacing: '-0.02em' }}>
                    {family.motto || '오늘도 행복한 하루 보내세요!'}
                </h2>
                <p style={{ color: '#7F8C8D', fontSize: '0.95rem', fontWeight: '500' }}>
                    본인을 선택해주세요.
                </p>
            </section>

            <section>
                {members.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: '#B0BEC5' }}>
                            <Users size={48} />
                        </div>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>
                            이 가족 그룹에 아직 구성원이 없습니다.
                        </p>
                        <Link href={`/register?familyId=${familyId}`} className="btn btn-primary">
                            <Plus size={18} style={{ marginRight: '8px', display: 'inline' }} />
                            첫 구성원 등록하기
                        </Link>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: '1.2rem',
                        padding: '0.5rem'
                    }}>
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="card"
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                                    textDecoration: 'none', color: 'inherit', position: 'relative',
                                    padding: '2rem 1rem', marginBottom: 0,
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    border: '1px solid rgba(255, 255, 255, 0.6)',
                                    background: 'rgba(255, 255, 255, 0.8)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)'
                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'none'
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.05)'
                                }}
                            >
                                <div
                                    onClick={() => handleMemberLogin(member)}
                                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
                                >
                                    <div
                                        style={{
                                            width: '72px',
                                            height: '72px',
                                            borderRadius: '50%',
                                            background: member.role === 'PARENT' ? 'linear-gradient(135deg, #FFD54F, #FFecb3)' : 'linear-gradient(135deg, #80CBC4, #E0F2F1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '1rem',
                                            fontSize: '2rem',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
                                        }}
                                    >
                                        {member.role === 'PARENT' ? '🪄' : '🧙'}
                                    </div>

                                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#37474F', fontWeight: 'bold' }}>
                                        {member.name}
                                    </h3>

                                    <div style={{
                                        fontSize: '0.9rem',
                                        color: member.role === 'PARENT' ? '#F57F17' : '#00796B',
                                        background: member.role === 'PARENT' ? 'rgba(255, 213, 79, 0.2)' : 'rgba(128, 203, 196, 0.2)',
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontWeight: 'bold'
                                    }}>
                                        {member.role === 'PARENT' ? '대표' : '자녀'}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Link href={`/register?familyId=${familyId}`} className="card" style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', justifyContent: 'center',
                            textDecoration: 'none', color: '#607D8B', cursor: 'pointer',
                            padding: '2rem 1rem', marginBottom: 0,
                            border: '2px dashed rgba(0, 191, 165, 0.4)',
                            background: 'rgba(255, 255, 255, 0.5)',
                            transition: 'all 0.2s',
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(0, 191, 165, 0.05)'
                                e.currentTarget.style.borderColor = 'var(--color-primary)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.5)'
                                e.currentTarget.style.borderColor = 'rgba(0, 191, 165, 0.4)'
                            }}>
                            <div style={{
                                width: '72px', height: '72px', borderRadius: '50%',
                                background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                            }}>
                                <Plus size={32} color="var(--color-primary)" />
                            </div>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                구성원 추가
                            </h3>
                        </Link>
                    </div>
                )}
            </section>

            {members.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem', paddingBottom: '2rem' }}>
                    <Link
                        href={`/members/manage?familyId=${familyId}`}
                        style={{
                            background: 'transparent',
                            padding: '8px 16px', cursor: 'pointer', borderRadius: '24px',
                            display: 'flex', alignItems: 'center', color: '#78909C', fontSize: '0.9rem',
                            textDecoration: 'none', transition: 'all 0.2s',
                            border: '1px solid rgba(96, 125, 139, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.5)'
                            e.currentTarget.style.color = '#455A64'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = '#78909C'
                        }}
                    >
                        <UserCog size={16} style={{ marginRight: '6px' }} />
                        구성원 수정
                    </Link>
                    <Link
                        href={`/family/manage?familyId=${familyId}`}
                        style={{
                            background: 'transparent',
                            padding: '8px 16px', cursor: 'pointer', borderRadius: '24px',
                            display: 'flex', alignItems: 'center', color: '#78909C', fontSize: '0.9rem',
                            textDecoration: 'none', transition: 'all 0.2s',
                            border: '1px solid rgba(96, 125, 139, 0.2)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.5)'
                            e.currentTarget.style.color = '#455A64'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = '#78909C'
                        }}
                    >
                        <Settings size={16} style={{ marginRight: '6px' }} />
                        가족 정보 수정
                    </Link>
                </div>
            )}
        </main>
    )
}
