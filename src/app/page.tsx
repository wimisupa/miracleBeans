'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sprout, Plus, Users, LogIn } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMember } from '@/context/MemberContext'
import { useSession, signIn } from 'next-auth/react'

type Family = {
    id: string
    name: string
    motto: string | null
    location: string | null
    _count: {
        members: number
    }
}

export default function Home() {
    const router = useRouter()
    const { logout } = useMember()
    const [families, setFamilies] = useState<Family[]>([])
    const [loading, setLoading] = useState(true)

    const { data: session, status } = useSession()

    useEffect(() => {
        // Clear previous local session when visiting the root page to ensure clean navigation
        logout()

        if (status === 'authenticated') {
            fetch('/api/families')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setFamilies(data)
                    } else {
                        console.error('API Error or invalid data:', data)
                        setFamilies([])
                    }
                    setLoading(false)
                })
                .catch(e => {
                    console.error('Fetch error:', e)
                    setFamilies([])
                    setLoading(false)
                })
        } else {
            setLoading(false)
        }
    }, [logout, status])

    return (
        <main>
            <header className="header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center', paddingTop: '2rem' }}>
                <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sprout size={36} color="var(--color-secondary)" />
                    <span style={{ fontSize: '2rem', fontWeight: '800' }}>Oh my cong</span>
                </div>
            </header>

            <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#37474F', marginBottom: '0.8rem' }}>
                    행복한 오마이콩에 오신 것을 환영합니다!
                </h1>
                <p style={{ color: '#607D8B', fontSize: '1rem' }}>
                    함께 성장하고 응원할 우리 가족을 선택해주세요.
                </p>
            </section>

            <section>
                {status === 'loading' || loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#90A4AE' }}>
                        로딩 중입니다...
                    </div>
                ) : status === 'unauthenticated' ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.4)', borderRadius: '24px', border: '1px dashed #B0BEC5' }}>
                        <p style={{ color: '#607D8B', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                            가족들과 기적의 콩을 모으기 위해 접속해주세요!
                        </p>
                        <button
                            onClick={() => signIn('google')}
                            style={{
                                backgroundColor: '#ffffff',
                                color: '#3c4043',
                                padding: '12px 24px',
                                fontSize: '1.05rem',
                                fontWeight: '600',
                                border: '1px solid #dadce0',
                                display: 'inline-flex', alignItems: 'center', gap: '12px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                borderRadius: '30px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s, box-shadow 0.2s',
                                fontFamily: 'Google Sans, Roboto, sans-serif'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f8f9fa'
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#ffffff'
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                        >
                            <img src="https://authjs.dev/img/providers/google.svg" width={24} height={24} alt="Google" style={{ marginRight: '8px' }} />
                            구글 계정으로 시작하기
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ marginBottom: '1rem', color: '#607D8B', textAlign: 'center' }}>
                            안녕하세요, <b>{session?.user?.name}</b>님! 참여할 가족을 선택하세요.
                        </div>
                        {families.map(family => (
                            <Link key={family.id} href={`/family/${family.id}`} style={{ textDecoration: 'none' }}>
                                <div className="card" style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '1.5rem', margin: 0,
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    cursor: 'pointer'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)'
                                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)'
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'none'
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '56px', height: '56px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, rgba(0, 191, 165, 0.2), rgba(0, 191, 165, 0.05))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'var(--color-primary)'
                                        }}>
                                            <Users size={28} />
                                        </div>
                                        <div>
                                            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#37474F' }}>
                                                {family.name} 가족
                                            </h2>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#607D8B', fontSize: '0.85rem' }}>
                                                {family.location && <span>📍 {family.location}</span>}
                                                {family.location && family.motto && <span style={{ opacity: 0.5 }}>|</span>}
                                                {family.motto && <span>{family.motto}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{
                                            background: '#ECEFF1', color: '#546E7A',
                                            padding: '4px 10px', borderRadius: '12px',
                                            fontSize: '0.8rem', fontWeight: 'bold'
                                        }}>
                                            {family._count.members}명
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {Reflect.ownKeys(families || {}).length === 0 && (
                            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,255,255,0.4)', border: '1px dashed #B0BEC5' }}>
                                <p style={{ color: '#607D8B', marginBottom: '1rem' }}>아직 등록된 가족이 없어요.</p>
                                <p style={{ fontSize: '0.9rem', color: '#90A4AE' }}>버튼을 눌러 우리 가족을 첫 번째로 만들어주세요!</p>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                            <Link href="/family/new" className="btn btn-primary" style={{
                                padding: '12px 24px', fontSize: '1.05rem',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                boxShadow: '0 4px 12px rgba(0, 191, 165, 0.3)'
                            }}>
                                <Plus size={20} />
                                새로운 가족 그룹 만들기
                            </Link>
                        </div>
                    </div>
                )}
            </section>
        </main>
    )
}
