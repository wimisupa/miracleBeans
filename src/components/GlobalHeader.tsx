'use client'

import { useMember } from '@/context/MemberContext'
import { LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function GlobalHeader() {
    const { currentMember, logout } = useMember()
    const router = useRouter()

    const handleLogoutClick = () => {
        logout()
        router.push('/')
        router.refresh()
    }

    if (!currentMember) return null

    return (
        <>
            <GlobalHeaderStyle />
            <div style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                zIndex: 1000
            }}>
                <div className="user-badge" style={{
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
                        color: 'white', fontWeight: 'bold', fontSize: '0.8rem',
                        flexShrink: 0
                    }}>
                        {currentMember.name[0]}
                    </div>
                    <span className="user-name" style={{ fontSize: '0.9rem', color: '#37474F', fontWeight: 'bold' }}>
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

        </>
    )
}

function GlobalHeaderStyle() {
    return (
        <style jsx global>{`
            @media (max-width: 480px) {
                .user-name {
                    display: none;
                }
                .user-badge {
                    padding-right: 6px !important;
                }
            }
        `}</style>
    )
}
