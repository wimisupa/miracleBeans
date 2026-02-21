'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock, ChevronLeft, User as UserIcon } from 'lucide-react'
import { useMember } from '@/context/MemberContext'

type Task = {
    id: string
    title: string
    points: number
    type: 'EARN' | 'SPEND' | 'TATTLE' | 'HOURGLASS'
    creator: { id: string; name: string }
    assigneeId?: string
    createdAt: string
    approvals: { member: { id: string; name: string } }[]
}

type Member = {
    id: string
    name: string
    role: string
}

export default function ApprovalsPage() {
    const router = useRouter()
    const { currentMember } = useMember()
    const [tasks, setTasks] = useState<Task[]>([])
    const [allMembers, setAllMembers] = useState<Member[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            const [tasksRes, membersRes] = await Promise.all([
                fetch('/api/tasks?status=PENDING'),
                fetch('/api/members')
            ])

            if (tasksRes.ok && membersRes.ok) {
                const tasksData = await tasksRes.json()
                const membersData = await membersRes.json()
                setTasks(tasksData)
                setAllMembers(membersData)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
        if (!currentMember) return

        try {
            const res = await fetch('/api/approve-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    action,
                    memberId: currentMember.id
                })
            })

            const data = await res.json()

            if (res.ok) {
                if (data.message) {
                    alert(data.message)
                    // Refresh data to show updated approval status
                    fetchData()
                } else {
                    // Fully approved
                    setTasks(prev => prev.filter(t => t.id !== id))
                    router.refresh()
                }
            } else {
                alert(data.error || '처리 실패')
            }
        } catch (error) {
            alert('오류 발생')
        }
    }

    return (
        <div>
            <header className="header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
                    <ChevronLeft size={28} />
                </Link>
                <div className="logo" style={{ flex: 1 }}>
                    <Clock size={28} />
                    <span>승인 대기열</span>
                </div>

            </header>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</div>
            ) : tasks.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#607D8B' }}>
                    <CheckCircle size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                    <p>대기 중인 요청이 없습니다.<br />평화로운 위미네요! 🌱</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {tasks.map(task => {
                        const personWhoDidIt = (task.type === 'HOURGLASS' || task.type === 'EARN') ? (task.assigneeId || task.creator.id) : task.creator.id;
                        const isPersonWhoDidIt = currentMember?.id === personWhoDidIt;
                        const alreadyApproved = task.approvals.some(a => a.member.id === currentMember?.id)

                        // Who needs to approve? Everyone except the person who did it.
                        // If TATTLE, also exclude assignee (target).
                        const requiredApprovers = allMembers.filter(m => {
                            if (m.id === personWhoDidIt) return false;
                            if (task.type === 'TATTLE' && m.id === task.assigneeId) return false;
                            return true;
                        })

                        return (
                            <div key={task.id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#90A4AE', marginBottom: '0.25rem' }}>
                                            {task.creator.name} • {new Date(task.createdAt).toLocaleDateString()}
                                            {task.assigneeId && task.assigneeId !== task.creator.id && (
                                                <span style={{ marginLeft: '4px', fontStyle: 'italic', color: '#B0BEC5' }}>(담당: {allMembers.find(m => m.id === task.assigneeId)?.name})</span>
                                            )}
                                        </div>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#37474F' }}>{task.title}</h3>
                                        <div style={{
                                            fontWeight: 'bold',
                                            fontSize: '1.1rem',
                                            color: (task.type === 'EARN' || task.type === 'HOURGLASS') ? 'var(--color-secondary)' : 'var(--color-accent)'
                                        }}>
                                            {(task.type === 'EARN' || task.type === 'HOURGLASS') ? '+' : '-'}{task.points} 콩
                                        </div>
                                    </div>

                                    {!isPersonWhoDidIt && !alreadyApproved && !(task.type === 'TATTLE' && currentMember?.id === task.assigneeId) && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleAction(task.id, 'APPROVE')}
                                                className="btn"
                                                style={{ padding: '10px', borderRadius: '50%', background: '#E0F2F1', color: 'var(--color-secondary)', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                                            >
                                                <CheckCircle size={24} />
                                            </button>
                                            <button
                                                onClick={() => handleAction(task.id, 'REJECT')}
                                                className="btn"
                                                style={{ padding: '10px', borderRadius: '50%', background: '#FFEBEE', color: 'var(--color-accent)', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                                            >
                                                <XCircle size={24} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Approval Status Bar */}
                                <div style={{
                                    borderTop: '1px solid rgba(0,0,0,0.05)',
                                    paddingTop: '0.75rem',
                                    fontSize: '0.85rem'
                                }}>
                                    <div style={{ color: '#78909C', marginBottom: '0.5rem', fontSize: '0.8rem' }}>승인 현황:</div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {requiredApprovers.map(approver => {
                                            const isApproved = task.approvals.some(a => a.member.id === approver.id)
                                            return (
                                                <div key={approver.id} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    background: isApproved ? '#E0F2F1' : '#ECEFF1',
                                                    color: isApproved ? 'var(--color-secondary)' : '#B0BEC5',
                                                    opacity: isApproved ? 1 : 0.8,
                                                    transition: 'all 0.2s'
                                                }}>
                                                    {isApproved ? <CheckCircle size={14} /> : <UserIcon size={14} />}
                                                    <span>{approver.name}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
