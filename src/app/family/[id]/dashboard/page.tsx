'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Trophy, ClipboardCheck, ListTodo, Sprout, Calendar, Clock, Timer, Gift, Settings, Home, Users } from 'lucide-react'
import { useMember } from '@/context/MemberContext'
import { useRouter } from 'next/navigation'
import TodoTasksList from '@/components/TodoTasksList'

type Member = {
  id: string
  name: string
  role: string
  points: number
  pin: string
}

export default function Dashboard({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { currentMember } = useMember()
  const [members, setMembers] = useState<Member[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [familyId, setFamilyId] = useState<string | null>(null)

  // Family State
  const [family, setFamily] = useState<{ name: string, motto: string | null, location: string | null } | null>(null)

  useEffect(() => {
    params.then(p => {
      setFamilyId(p.id)
    })
  }, [params])

  useEffect(() => {
    if (familyId) {
      fetch(`/api/families/${familyId}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setFamily(data)
            setMembers(data.members || [])
          }
        })
        .catch(console.error)
    }
  }, [familyId])

  useEffect(() => {
    if (!currentMember?.familyId) return
    fetch(`/api/tasks?familyId=${currentMember.familyId}`).then(res => res.json()).then(tasks => {
      setPendingCount(tasks.filter((t: any) => t.status === 'PENDING').length)
    })
  }, [currentMember?.familyId])

  const handleMemberClick = (member: Member) => {
    // Navigate directly to history regardless of user
    router.push(`/history/${member.id}`)
  }


  return (
    <main>
      <header className="header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#1A252C', gap: '8px' }}>
            <Users size={32} color="var(--color-secondary)" />
            <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
              {family?.name}
            </span>
          </div>
        </div>
        {currentMember && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px',
              background: 'rgba(255,255,255,0.6)',
              borderRadius: '20px',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.5)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <span style={{ fontSize: '0.9rem', color: '#37474F' }}>
                <span style={{ fontWeight: 'bold' }}>{currentMember.name}</span>님
              </span>
            </div>
            <button
              onClick={() => {
                // Logout logic (clearing local storage & route to selection)
                localStorage.removeItem('miracle_po_member');
                window.location.href = `/family/${currentMember.familyId}`;
              }}
              style={{
                background: 'rgba(255,255,255,0.6)',
                borderRadius: '50%',
                width: '36px', height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#FF5252',
                border: '1px solid rgba(255,255,255,0.5)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s',
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        )}
      </header>

      <section className="glass-panel" style={{ borderRadius: '24px', padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
          <Link href="/" className="btn" style={{ padding: '6px 14px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(4px)', color: '#455A64', textDecoration: 'none', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '20px' }}>
            <Sprout size={16} style={{ marginRight: '4px' }} />
            오마이콩
          </Link>
        </div>
        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.8rem', fontWeight: '800', color: '#2C3E50', letterSpacing: '-0.02em', minHeight: '40px' }}>
          {family === null ? '' : (family.motto ? family.motto : '서로 돕고 사랑하며 콩을 모아보세요 🧙')}
        </h1>
        {family === null || !family.location ? (
          <div style={{ marginBottom: '1.5rem', minHeight: '20px' }} />
        ) : (
          <p style={{ color: '#90A4AE', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            📍 {family.location}
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem', marginBottom: '1.5rem' }}>
          {/* 1. 할 일 등록 */}
          <Link href="/tasks/new" className="card" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', color: 'inherit', border: 'none',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))',
            marginBottom: 0, padding: '1.2rem 0.5rem', textAlign: 'center'
          }}>
            <div style={{
              background: 'var(--color-primary)',
              padding: '12px',
              borderRadius: '50%',
              marginBottom: '10px',
              boxShadow: '0 4px 10px rgba(0, 191, 165, 0.3)'
            }}>
              <ListTodo size={28} color="white" />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#37474F', wordBreak: 'keep-all' }}>할 일 등록</span>
          </Link>

          {/* 2. 루틴 관리 */}
          <Link href="/routines" className="card" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', color: 'inherit', border: 'none',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))',
            marginBottom: 0, padding: '1.2rem 0.5rem', textAlign: 'center'
          }}>
            <div style={{
              background: 'var(--color-primary)',
              padding: '12px',
              borderRadius: '50%',
              marginBottom: '10px',
              boxShadow: '0 4px 10px rgba(0, 191, 165, 0.3)'
            }}>
              <Calendar size={28} color="white" />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#37474F', wordBreak: 'keep-all' }}>루틴 관리</span>
          </Link>

          {/* 3. 콩 쓰기 */}
          <Link href="/points/use" className="card" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', color: 'inherit', border: 'none',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))',
            marginBottom: 0, padding: '1.2rem 0.5rem', textAlign: 'center'
          }}>
            <div style={{
              background: 'var(--color-primary)',
              padding: '12px',
              borderRadius: '50%',
              marginBottom: '10px',
              boxShadow: '0 4px 10px rgba(255, 213, 79, 0.3)'
            }}>
              <Gift size={28} color="white" />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#37474F', wordBreak: 'keep-all' }}>콩 쓰기</span>
          </Link>

          {/* 4. 승인 대기 */}
          <Link href="/approvals" className="card" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', color: 'inherit', position: 'relative',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))',
            marginBottom: 0, padding: '1.2rem 0.5rem', textAlign: 'center'
          }}>
            {pendingCount > 0 && (
              <span style={{
                position: 'absolute', top: '-5px', right: '-5px',
                background: 'var(--color-accent)', color: 'white',
                borderRadius: '50%', width: '28px', height: '28px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: 'bold',
                boxShadow: '0 2px 5px rgba(255, 82, 82, 0.4)'
              }}>
                {pendingCount}
              </span>
            )}
            <div style={{
              background: 'var(--color-secondary)',
              padding: '12px',
              borderRadius: '50%',
              marginBottom: '10px',
              boxShadow: '0 4px 10px rgba(128, 203, 196, 0.3)'
            }}>
              <ClipboardCheck size={28} color="white" />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#37474F', wordBreak: 'keep-all' }}>승인 대기</span>
          </Link>
        </div>

        {/* Member TODO Tasks */}
        {currentMember && (
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.2rem', color: '#455A64', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>⏳</span> 해야 할 일
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <TodoTasksList memberId={currentMember.id} />
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.3rem', color: '#2C3E50', fontWeight: '800', margin: 0, letterSpacing: '-0.01em' }}>구성원</h2>
        </div>

        {members.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>아직 등록된 구성원이 없어요!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '16px', margin: '0 -8px', padding: '0 8px 16px 8px' }}>
            {members.map((member) => (
              <div
                key={member.id}
                className="card"
                onClick={() => handleMemberClick(member)}
                style={{
                  minWidth: '140px',
                  flexShrink: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                  textDecoration: 'none', color: 'inherit', cursor: 'pointer',
                  padding: '1.5rem 1rem', marginBottom: 0,
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                  background: 'rgba(255, 255, 255, 0.65)'
                }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: member.role === 'PARENT' ? 'linear-gradient(135deg, #FFD54F, #FFecb3)' : 'linear-gradient(135deg, #80CBC4, #E0F2F1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem',
                    fontSize: '1.8rem',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  {member.role === 'PARENT' ? '🪄' : '🧙'}
                </div>

                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#37474F' }}>
                  {member.name}
                </h3>

                <div style={{
                  fontSize: '1.25rem', fontWeight: '900',
                  color: 'var(--color-secondary)',
                  background: 'rgba(0, 191, 165, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '12px'
                }}>
                  {member.points.toLocaleString()} 콩
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
