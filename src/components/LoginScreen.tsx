'use client'

import { useState, useEffect } from 'react'
import { useMember } from '@/context/MemberContext'
import { Sprout } from 'lucide-react'
import Link from 'next/link'

type Member = {
    id: string
    name: string
    role: string
    points: number
}

export default function LoginScreen() {
    const { login } = useMember()
    const [members, setMembers] = useState<Member[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/members')
            .then(res => res.json())
            .then(data => setMembers(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
            <Sprout size={48} className="floating" color="var(--color-secondary)" />
            <div style={{ color: '#607D8B' }}>가족 정보를 불러오는 중...</div>
        </div>
    )

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '1rem',
        }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <div className="logo floating" style={{ justifyContent: 'center', marginBottom: '0.5rem', fontSize: '2.5rem' }}>
                    <Sprout size={48} />
                    <span>Wimi Bean</span>
                </div>
                <p style={{ color: '#546E7A', fontSize: '1.1rem', fontFamily: 'var(--font-outfit)' }}>Happy Bean, Happy Family! 🌱</p>
            </div>

            <div className="glass-panel" style={{
                padding: '2rem',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#37474F' }}>누구신가요?</h2>

                {members.map(member => (
                    <button
                        key={member.id}
                        onClick={() => login(member)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem',
                            background: 'rgba(255,255,255,0.6)',
                            border: '1px solid rgba(255,255,255,0.8)',
                            borderRadius: '16px',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            color: '#37474F',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }}
                    >
                        <div style={{
                            background: member.role === 'PARENT' ? 'linear-gradient(135deg, #FFD54F, #FFecb3)' : 'linear-gradient(135deg, #80CBC4, #E0F2F1)',
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}>
                            {member.role === 'PARENT' ? '👑' : '🌱'}
                        </div>
                        <span style={{ flex: 1, textAlign: 'left' }}>{member.name}</span>
                        <span style={{ fontSize: '0.9rem', color: 'var(--color-secondary)', background: 'rgba(0, 191, 165, 0.1)', padding: '4px 8px', borderRadius: '8px' }}>
                            {member.points.toLocaleString()} 콩
                        </span>
                    </button>
                ))}

                {members.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#607D8B', padding: '1rem' }}>
                        등록된 가족이 없습니다.<br />
                        <Link href="/register" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            가족 등록하기
                        </Link>
                    </div>
                )}
                {/* Quick register link even if members exist, for convenience */}
                {members.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <Link href="/register" style={{ color: '#90A4AE', textDecoration: 'none', fontSize: '0.9rem' }}>
                            새로운 가족이신가요? <span style={{ textDecoration: 'underline' }}>등록하기</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
