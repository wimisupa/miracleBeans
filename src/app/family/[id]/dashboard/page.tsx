'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Trophy, ClipboardCheck, ListTodo, Sprout, Calendar, Clock, Timer, Gift, Settings, Home, Users } from 'lucide-react'
import { useMember } from '@/context/MemberContext'
import { useRouter } from 'next/navigation'
import TodoTasksList from '@/components/TodoTasksList'
import { ProfileIconDisplay } from '@/components/ProfileIcons'

type Member = {
  id: string
  name: string
  role: string
  points: number
  pin: string
  icon?: string | null
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
      fetch(`/api/families/${familyId}`, { cache: 'no-store' })
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
    fetch(`/api/tasks?familyId=${currentMember.familyId}`, { cache: 'no-store' }).then(res => res.json()).then(tasks => {
      setPendingCount(tasks.filter((t: any) => t.status === 'PENDING').length)
    })
  }, [currentMember?.familyId])

  const handleMemberClick = (member: Member) => {
    // Navigate directly to history regardless of user
    router.push(`/history/${member.id}`)
  }


  return (
    <main>
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-main)', gap: '8px' }}>
            <Users size={32} color="var(--color-primary)" />
            <span className="text-playful" style={{ fontSize: '1.4rem', letterSpacing: '-0.02em' }}>
              {family?.name}
            </span>
          </div>
        </div>
        {currentMember && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
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
                background: 'var(--bg-card)',
                borderRadius: '50%',
                width: '36px', height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-accent)',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.2s',
                cursor: 'pointer'
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

      <section className="card" style={{ padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
          <Link href="/" className="btn" style={{ padding: '6px 14px', fontSize: '0.85rem', background: 'var(--bg-main)', color: 'var(--color-text-main)', textDecoration: 'none', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-full)' }}>
            <Sprout size={16} color="var(--color-primary)" style={{ marginRight: '4px' }} />
            오마이콩
          </Link>
        </div>
        <h1 className="text-playful" style={{ marginBottom: '0.5rem', fontSize: '1.8rem', color: 'var(--color-text-main)', minHeight: '40px' }}>
          {family === null ? '' : (family.motto ? family.motto : '서로 돕고 사랑하며 콩을 모아보세요 🧙')}
        </h1>
        {family === null || !family.location ? (
          <div style={{ marginBottom: '1.5rem', minHeight: '20px' }} />
        ) : (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            📍 {family.location}
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {/* 1. 할 일 등록 */}
          <Link href="/tasks/new" className="card reward-hover" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', color: 'inherit',
            background: 'var(--bg-main)',
            marginBottom: 0, padding: '0.6rem 0.2rem', textAlign: 'center',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)'
          }}>
            <div style={{ marginBottom: '6px', color: '#FFE082' }}>
              <ListTodo size={24} />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'var(--color-text-main)', wordBreak: 'keep-all' }}>할 일 등록</span>
          </Link>

          {/* 2. 루틴 관리 */}
          <Link href="/routines" className="card reward-hover" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', color: 'inherit',
            background: 'var(--bg-main)',
            marginBottom: 0, padding: '0.6rem 0.2rem', textAlign: 'center',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)'
          }}>
            <div style={{ marginBottom: '6px', color: '#FFE082' }}>
              <Calendar size={24} />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'var(--color-text-main)', wordBreak: 'keep-all' }}>루틴 관리</span>
          </Link>

          {/* 3. 콩 쓰기 */}
          <Link href="/points/use" className="card reward-hover" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', color: 'inherit',
            background: 'var(--bg-main)',
            marginBottom: 0, padding: '0.6rem 0.2rem', textAlign: 'center',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)'
          }}>
            <div style={{ marginBottom: '6px', color: '#FFE082' }}>
              <Gift size={24} />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'var(--color-text-main)', wordBreak: 'keep-all' }}>콩 쓰기</span>
          </Link>

          {/* 4. 승인 대기 */}
          <Link href="/approvals" className="card reward-hover" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', color: 'inherit', position: 'relative',
            background: 'var(--bg-main)',
            marginBottom: 0, padding: '0.6rem 0.2rem', textAlign: 'center',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)'
          }}>
            {pendingCount > 0 && (
              <span className="animate-pop" style={{
                position: 'absolute', top: '-4px', right: '-4px',
                background: 'var(--color-accent)', color: 'white',
                borderRadius: '50%', width: '22px', height: '22px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 'bold',
                boxShadow: '0 2px 5px rgba(255, 82, 82, 0.4)'
              }}>
                {pendingCount}
              </span>
            )}
            <div style={{ marginBottom: '0px', color: pendingCount > 0 ? 'var(--color-accent)' : 'var(--color-text-main)' }}>
              <ClipboardCheck size={22} />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'var(--color-text-main)', wordBreak: 'keep-all' }}>승인 대기</span>
          </Link>
        </div>

        {/* Member TODO Tasks */}
        {currentMember && (
          <div style={{ textAlign: 'left' }}>
            <h2 className="text-playful" style={{ fontSize: '1.2rem', color: 'var(--color-text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
          <h2 className="text-playful" style={{ fontSize: '1.3rem', color: 'var(--color-text-main)', margin: 0 }}>구성원</h2>
        </div>

        {members.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>아직 등록된 구성원이 없어요!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            {members.map((member) => (
              <div
                key={member.id}
                className="card reward-hover"
                onClick={() => handleMemberClick(member)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  textDecoration: 'none', color: 'inherit', cursor: 'pointer',
                  padding: '0.8rem 0.5rem', marginBottom: 0,
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                {/* First Line: Avatar and Name */}
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '6px', marginBottom: '0.4rem', width: '100%' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: member.role === 'PARENT' ? 'rgba(255, 202, 40, 0.3)' : 'var(--bg-main)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      boxShadow: 'var(--shadow-sm)',
                      flexShrink: 0,
                      border: member.role === 'CHILD' ? '1px solid var(--border-light)' : 'none'
                    }}
                  >
                    <ProfileIconDisplay name={member.icon || 'star'} size={20} color={member.role === 'PARENT' ? 'var(--color-text-main)' : 'var(--color-text-main)'} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-main)', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {member.name}
                  </h3>
                </div>

                {/* Second Line: Points Info */}
                <div style={{
                  fontSize: '0.75rem', fontWeight: '900',
                  color: 'var(--color-text-main)',
                  background: 'var(--color-primary)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  alignSelf: 'flex-start'
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
