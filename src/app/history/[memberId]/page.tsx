'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, History, TrendingUp, TrendingDown, Sprout, Calendar, Clock, Timer, XCircle } from 'lucide-react'
import { useMember } from '@/context/MemberContext'
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
    const { currentMember } = useMember()

    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [memberName, setMemberName] = useState('')
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
        }
    }, [memberId])

    return (
        <div>
            <header className="header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1rem' }}>
                <Link href={currentMember?.familyId ? `/family/${currentMember.familyId}/dashboard` : '/'} style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
                    <ChevronLeft size={32} />
                </Link>
                <div className="logo" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-main)' }}>
                    <History size={32} color="var(--color-secondary)" />
                    <span className="text-playful" style={{ fontSize: '1.4rem', letterSpacing: '-0.02em' }}>{memberName ? `${memberName}의 기록` : '히스토리'}</span>
                </div>
            </header>

            <main className="container" style={{ padding: 0 }}>
                {/* ⏳ Todo Tasks Section */}
                <section style={{ padding: '1.5rem 1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-lg)', marginBottom: '1rem' }}>
                    <h2 className="text-playful" style={{ fontSize: '1.2rem', color: 'var(--color-text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.4rem' }}>⏳</span> 해야 할 일
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        <TodoTasksList memberId={memberId} hideStartButton={true} />
                    </div>
                </section>


                <h2 className="text-playful" style={{ fontSize: '1.2rem', color: 'var(--color-text-main)', padding: '0 1rem', marginBottom: '1rem', marginTop: '1rem' }}>히스토리</h2>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</div>
                ) : transactions.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                        <Sprout size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p>아직 콩 기록이 없어요.<br />첫 수확을 기다려보세요! 🌱</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 1rem' }}>
                        {transactions.map(tx => (
                            <div key={tx.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                    <div style={{
                                        width: '44px', height: '44px', minWidth: '44px',
                                        borderRadius: 'var(--radius-full)',
                                        background: tx.amount > 0 ? 'var(--bg-main)' : (tx.amount < 0 ? '#FFEBEE' : 'var(--bg-main)'),
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: tx.amount > 0 ? 'var(--color-secondary)' : (tx.amount < 0 ? 'var(--color-accent)' : 'var(--color-text-muted)'),
                                        boxShadow: 'none',
                                        border: '1px solid var(--border-light)'
                                    }}>
                                        {tx.amount > 0 ? <TrendingUp size={20} /> : (tx.amount < 0 ? <TrendingDown size={20} /> : <XCircle size={20} />)}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--color-text-main)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.4' }}>{tx.reason}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                            {new Date(tx.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-playful" style={{
                                    fontSize: '1.2rem',
                                    color: tx.amount > 0 ? 'var(--color-secondary)' : (tx.amount < 0 ? 'var(--color-accent)' : 'var(--color-text-muted)'),
                                    marginLeft: '1rem'
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
