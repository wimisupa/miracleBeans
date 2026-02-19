import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Plus, Trophy, ClipboardList, Sparkles, Sprout } from 'lucide-react'

// Revalidate frequently to show updated points/tasks
export const revalidate = 0

async function getData() {
  const members = await prisma.member.findMany({
    orderBy: { createdAt: 'asc' },
  })
  const pendingCount = await prisma.task.count({
    where: { status: 'PENDING' }
  })
  return { members, pendingCount }
}

export default async function Home() {
  const { members, pendingCount } = await getData()

  return (
    <main>
      <header className="header">
        <div className="logo">
          <Sprout size={28} />
          <span>Wimi Bean</span>
        </div>
      </header>

      <section className="glass-panel" style={{ borderRadius: '24px', padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '0.5rem', fontSize: '1.5rem', fontWeight: '800', color: '#37474F' }}>우리 가족의 행복한 위미!</h1>
        <p style={{ color: '#607D8B', marginBottom: '1.5rem' }}>서로 돕고 사랑하며 콩을 모아보세요 🌱</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Link href="/tasks/new" className="card" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', color: 'inherit', border: 'none',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))',
            marginBottom: 0
          }}>
            <div style={{
              background: 'var(--color-primary)',
              padding: '12px',
              borderRadius: '50%',
              marginBottom: '10px',
              boxShadow: '0 4px 10px rgba(255, 193, 7, 0.3)'
            }}>
              <Sparkles size={28} color="#37474F" />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '1rem', color: '#37474F' }}>콩 모으기/쓰기</span>
          </Link>

          <Link href="/approvals" className="card" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none', color: 'inherit', position: 'relative',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))',
            marginBottom: 0
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
              boxShadow: '0 4px 10px rgba(0, 191, 165, 0.3)'
            }}>
              <ClipboardList size={28} color="white" />
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '1rem', color: '#37474F' }}>승인 대기열</span>
          </Link>
        </div>
      </section>

      <section>
        <div className="header" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#455A64' }}>가족 구성원</h2>
          <Link href="/register" className="btn" style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(4px)' }}>
            <Plus size={16} style={{ marginRight: '4px' }} />
            가족 추가
          </Link>
        </div>

        {members.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>아직 등록된 가족이 없어요!</p>
            <Link href="/register" className="btn btn-primary">
              가족 등록하기
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
            {members.map((member) => (
              <Link href={`/history/${member.id}`} key={member.id} className="card" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                textDecoration: 'none', color: 'inherit', cursor: 'pointer',
                padding: '1.5rem 1rem', marginBottom: 0
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
                  {member.role === 'PARENT' ? '👑' : '🌱'}
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#37474F' }}>{member.name}</h3>
                <div style={{
                  fontSize: '1.25rem', fontWeight: '900',
                  color: 'var(--color-secondary)',
                  background: 'rgba(0, 191, 165, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '12px'
                }}>
                  {member.points.toLocaleString()} 콩
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
