'use client'

import { useMember } from '@/context/MemberContext'
import { LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function GlobalHeader() {
    const { currentMember, logout } = useMember()
    const router = useRouter()

    const [showConfirm, setShowConfirm] = useState(false)

    const handleLogoutClick = () => {
        setShowConfirm(true)
    }

    const confirmLogout = () => {
        logout()
        setShowConfirm(false)
        router.push('/')
        router.refresh()
    }

    if (!currentMember) return null

    return (
        <>
            <div style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                zIndex: 1000
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                    padding: '6px 12px 6px 6px',
                    borderRadius: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    border: '1px solid rgba(255,255,255,0.6)'
                }}>
                    <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: currentMember.role === 'PARENT' ? '#FFD54F' : '#4DB6AC',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: 'bold', fontSize: '0.8rem'
                    }}>
                        {currentMember.name[0]}
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#37474F', fontWeight: 'bold' }}>
                        {currentMember.name}
                    </span>
                </div>



                <button
                    onClick={handleLogoutClick}
                    style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.6)',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#FF5252',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                    title="로그아웃"
                >
                    <LogOut size={18} />
                </button>
            </div>

            {showConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(2px)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }} onClick={() => setShowConfirm(false)}>
                    <div style={{
                        background: 'white',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        textAlign: 'center',
                        minWidth: '280px'
                    }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#37474F' }}>로그아웃 하시겠습니까?</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                            <button
                                onClick={() => setShowConfirm(false)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: '#F5F5F5',
                                    color: '#78909C',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                취소
                            </button>
                            <button
                                onClick={confirmLogout}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: '#FF5252',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    cursor: 'pointer'
                                }}
                            >
                                로그아웃
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </>
    )
}
