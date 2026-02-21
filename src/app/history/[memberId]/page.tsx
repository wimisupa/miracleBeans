'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, History, TrendingUp, TrendingDown, Sprout, Calendar, Clock, Timer } from 'lucide-react'
import TodoTasksList from '@/components/TodoTasksList'

type Transaction = {
    id: string
    amount: number
    reason: string
    createdAt: string
    member: { name: string }
}

export default function HistoryPage() {
    const params = useParams()
    const memberId = params.memberId as string

    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [memberName, setMemberName] = useState('')
    const [todayRoutines, setTodayRoutines] = useState<any[]>([])

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/transactions?memberId=${memberId}`)
                if (res.ok) {
                    const data = await res.json()
                    setTransactions(data)
                    if (data.length > 0) {
                        setMemberName(data[0].member.name)
                    } else {
                        // If no transactions, fetch member name separately or show generic fallback
                        const memberRes = await fetch(`/api/members`) // Inefficient but works for now to find name
                        const members = await memberRes.json()
                        const member = members.find((m: any) => m.id === memberId)
                        if (member) setMemberName(member.name)
                    }
                }
            } catch (error) {
                console.error('Failed to fetch history')
            } finally {
                setLoading(false)
            }
        }

        if (memberId) {
            fetchHistory()
            fetch(`/api/routines/today?memberId=${memberId}`)
                .then(res => res.json())
                .then(data => setTodayRoutines(data))
                .catch(err => console.error(err))
        }
    }, [memberId])

    return (
        <div>
            <header className="header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
                    <ChevronLeft size={28} />
                </Link>
                <div className="logo" style={{ flex: 1 }}>
                    <History size={28} />
                    <span>{memberName ? `${memberName}의 기록` : '히스토리'}</span>
                </div>
            </header>

            <main className="container" style={{ padding: 0 }}>
                {/* ⏳ Todo Tasks Section */}
                <section style={{ padding: '1.5rem 1rem', background: 'rgba(255,255,255,0.7)', borderRadius: '24px', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.1rem', color: '#455A64', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>⏳</span> 해야 할 일
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <TodoTasksList memberId={memberId} hideStartButton={true} />
                    </div>
                </section>

                {/* Today's Routines */}
                {todayRoutines.length > 0 && (
                    <section style={{ padding: '1.5rem 1rem', background: 'rgba(255,255,255,0.7)', borderRadius: '24px', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.1rem', color: '#455A64', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={20} color="var(--color-primary)" />
                            <span>해야 할 루틴</span>
                        </h2>
                        <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '8px' }}>
                            {todayRoutines.map(routine => (
                                <div key={routine.id} className="card" style={{
                                    minWidth: '150px',
                                    flexShrink: 0,
                                    marginBottom: 0,
                                    opacity: routine.isCompletedDaily ? 0.6 : 1,
                                    background: routine.isCompletedDaily ? '#F5F5F5' : 'white',
                                    border: routine.isCompletedDaily ? '1px solid #E0E0E0' : '1px solid var(--color-primary)',
                                    display: 'flex', flexDirection: 'column', gap: '8px',
                                    padding: '1rem'
                                }}>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#37474F', minHeight: '40px' }}>{routine.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#78909C', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={12} /> {routine.timeOfDay}
                                        {routine.type === 'HOURGLASS' && <><Timer size={12} /> {routine.durationMinutes}분</>}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#FBC02D', fontWeight: 'bold' }}>+{routine.points}콩</div>
                                    <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: '0.8rem', color: routine.isCompletedDaily ? '#90A4AE' : 'var(--color-primary)', fontWeight: 'bold' }}>
                                        {routine.isCompletedDaily ? '달성 완료 🎉' : '진행 예정'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <h2 style={{ fontSize: '1.1rem', color: '#455A64', padding: '0 1rem', marginBottom: '1rem', marginTop: '1rem' }}>히스토리</h2>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</div>
                ) : transactions.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#607D8B' }}>
                        <Sprout size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p>아직 콩 기록이 없어요.<br />첫 수확을 기다려보세요! 🌱</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 1rem' }}>
                        {transactions.map(tx => (
                            <div key={tx.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '44px', height: '44px',
                                        borderRadius: '50%',
                                        background: tx.amount > 0 ? '#E0F2F1' : '#FFEBEE',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: tx.amount > 0 ? 'var(--color-secondary)' : 'var(--color-accent)',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                    }}>
                                        {tx.amount > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#37474F' }}>{tx.reason}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#90A4AE' }}>
                                            {new Date(tx.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div style={{
                                    fontWeight: '900',
                                    fontSize: '1.2rem',
                                    color: tx.amount > 0 ? 'var(--color-secondary)' : 'var(--color-accent)'
                                }}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
