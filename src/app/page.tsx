'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sprout, Plus, Users, LogIn } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useMember } from '@/context/MemberContext'
import { useSession, signIn, signOut } from 'next-auth/react'

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
        // Only clear session if explicitly needed, otherwise reloading the dashboard 
        // while the user is already logged in as a member would unexpectedly clear their session
        // loggout() was here previously

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
            <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', marginBottom: '1rem' }}>
                <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sprout size={32} color="var(--color-primary)" />
                    <span className="text-playful" style={{ fontSize: '1.8rem', color: 'var(--color-text-main)' }}>오마이콩</span>
                </div>
                {status === 'authenticated' && (
                    <button
                        onClick={() => signOut()}
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-light)',
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.85rem',
                            color: 'var(--color-text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                    >
                        로그아웃
                    </button>
                )}
            </header>

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

                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                            <p style={{ fontSize: '0.85rem', color: '#90A4AE', marginBottom: '8px' }}>
                                📱 아이폰 사파리 접속 오류가 발생하나요?
                            </p>
                            <a
                                href="/caddy-profile.mobileconfig"
                                style={{
                                    display: 'inline-block',
                                    fontSize: '0.85rem', color: '#00BFA5',
                                    textDecoration: 'underline', fontWeight: 'bold'
                                }}
                            >
                                보안 인증서 프로파일 설치하기
                            </a>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <h1 className="text-playful" style={{ fontSize: '1.6rem', color: 'var(--color-text-main)', marginBottom: '0.6rem' }}>
                                안녕하세요, {session?.user?.name}님!
                            </h1>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', fontWeight: '500' }}>
                                함께할 가족을 선택해주세요.
                            </p>
                        </div>
                        {families.map(family => (
                            <Link key={family.id} href={`/family/${family.id}`} style={{ textDecoration: 'none' }}>
                                <div className="card reward-hover" style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '1.5rem', margin: 0, cursor: 'pointer'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            width: '56px', height: '56px', flexShrink: 0,
                                            borderRadius: 'var(--radius-md)',
                                            background: 'var(--color-secondary)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#666666'
                                        }}>
                                            <Users size={28} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--color-text-main)', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {family.name}
                                                </h2>
                                                <span style={{
                                                    background: 'var(--color-primary)', color: '#333333',
                                                    padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                                                    fontSize: '0.8rem', fontWeight: '700',
                                                    whiteSpace: 'nowrap', display: 'inline-block'
                                                }}>
                                                    {family._count.members}명
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 10px', color: 'var(--color-text-muted)', fontSize: '0.9rem', wordBreak: 'keep-all', fontWeight: '500' }}>
                                                {family.motto && <span>{family.motto}</span>}
                                                {family.motto && family.location && <span style={{ opacity: 0.3 }}>|</span>}
                                                {family.location && <span>📍 {family.location}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ flexShrink: 0, marginLeft: '12px', color: 'var(--border-light)' }}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 18l6-6-6-6" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {Reflect.ownKeys(families || {}).length === 0 && (
                            <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-main)', border: '1px dashed var(--border-light)', boxShadow: 'none' }}>
                                <div style={{ marginBottom: '1rem', color: 'var(--color-secondary)' }}>
                                    <Sprout size={48} />
                                </div>
                                <p style={{ color: 'var(--color-text-main)', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: '600' }}>아직 등록된 가족이 없어요.</p>
                                <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>아래 버튼을 눌러 첫 번째 가족을 만들어주세요!</p>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                            <Link href="/family/new" className="btn btn-primary" style={{
                                width: '100%', maxWidth: '400px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            }}>
                                <Plus size={22} strokeWidth={2.5} />
                                새로운 가족 만들기
                            </Link>
                        </div>
                    </div>
                )}
            </section>
        </main>
    )
}
