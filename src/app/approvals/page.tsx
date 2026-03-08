'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Clock, ClipboardCheck, ChevronLeft, User as UserIcon } from 'lucide-react'
import { useMember } from '@/context/MemberContext'

type Task = {
    id: string
    title: string
    points: number
    type: 'EARN' | 'SPEND' | 'TATTLE' | 'HOURGLASS' | 'MISSION' | 'COUNTER'
    resultMessage?: string | null
    creator: { id: string; name: string }
    assigneeId?: string
    createdAt: string
    approvals: { member: { id: string; name: string }, comment?: string | null }[]
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

    // Feedback modal state
    const [actionTask, setActionTask] = useState<{ id: string, action: 'APPROVE' | 'REJECT', title: string } | null>(null)
    const [feedback, setFeedback] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchData = async () => {
        if (!currentMember?.familyId) return;
        try {
            const [tasksRes, membersRes] = await Promise.all([
                fetch(`/api/tasks?status=PENDING&familyId=${currentMember.familyId}`),
                fetch(`/api/members?familyId=${currentMember.familyId}`)
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

    const promptAction = (task: Task, action: 'APPROVE' | 'REJECT') => {
        setActionTask({ id: task.id, action, title: task.title })
        setFeedback('')
    }

    const handleConfirmAction = async () => {
        if (!currentMember || !actionTask) return

        setIsSubmitting(true)
        try {
            const res = await fetch('/api/approve-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: actionTask.id,
                    action: actionTask.action,
                    memberId: currentMember.id,
                    comment: feedback.trim()
                })
            })

            const data = await res.json()

            if (res.ok) {
                if (data.message) {
                    // Refresh data to show updated approval status seamlessly
                    fetchData()
                } else {
                    // Fully approved
                    setTasks(prev => prev.filter(t => t.id !== actionTask.id))
                    router.refresh()
                }
                setActionTask(null)
            } else {
                alert(data.error || '처리 실패')
            }
        } catch (error) {
            alert('오류 발생')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div>
            <header className="header" style={{ display: 'flex', alignItems: 'center', paddingTop: '1rem' }}>
                <Link href={currentMember?.familyId ? `/family/${currentMember.familyId}/dashboard` : '/'} style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)', textDecoration: 'none', marginRight: '1rem' }}>
                    <ChevronLeft size={32} />
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-main)', gap: '8px' }}>
                    <ClipboardCheck size={32} color="var(--color-secondary)" />
                    <span className="text-playful" style={{ fontSize: '1.4rem', letterSpacing: '-0.02em' }}>
                        승인 대기
                    </span>
                </div>
            </header>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</div>
            ) : tasks.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-muted)' }}>
                    <CheckCircle size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                    <p>대기 중인 요청이 없습니다.<br />평화로운 위미네요! 🌱</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {tasks.map(task => {
                        const personWhoDidIt = (task.type === 'HOURGLASS' || task.type === 'EARN' || task.type === 'MISSION' || task.type === 'COUNTER') ? (task.assigneeId || task.creator.id) : task.creator.id;
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
                                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                                            {task.creator.name} • {new Date(task.createdAt).toLocaleDateString()}
                                            {task.assigneeId && task.assigneeId !== task.creator.id && (
                                                <span style={{ marginLeft: '4px', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>(담당: {allMembers.find(m => m.id === task.assigneeId)?.name})</span>
                                            )}
                                        </div>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>{task.title}</h3>
                                        <div style={{
                                            fontWeight: 'bold',
                                            fontSize: '1.1rem',
                                            color: (task.type === 'EARN' || task.type === 'HOURGLASS' || task.type === 'MISSION' || task.type === 'COUNTER') ? 'var(--color-secondary)' : 'var(--color-accent)'
                                        }}>
                                            {(task.type === 'EARN' || task.type === 'HOURGLASS' || task.type === 'MISSION' || task.type === 'COUNTER') ? '+' : '-'}{Math.abs(task.points)} 콩
                                        </div>
                                        {task.resultMessage && (
                                            <div style={{
                                                marginTop: '0.75rem',
                                                padding: '0.75rem',
                                                background: 'var(--bg-main)',
                                                borderRadius: 'var(--radius-sm)',
                                                borderLeft: '4px solid var(--color-primary)',
                                                fontSize: '0.9rem',
                                                color: 'var(--color-text-main)',
                                                whiteSpace: 'pre-wrap'
                                            }}>
                                                <div style={{ fontWeight: 'bold', marginBottom: '4px', color: 'var(--color-primary)', fontSize: '0.8rem' }}>결과 보고:</div>
                                                {task.resultMessage}
                                            </div>
                                        )}
                                    </div>

                                    {!isPersonWhoDidIt && !alreadyApproved && !(task.type === 'TATTLE' && currentMember?.id === task.assigneeId) && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => promptAction(task, 'APPROVE')}
                                                className="btn"
                                                style={{ padding: '10px', borderRadius: '50%', background: '#E0F2F1', color: 'var(--color-secondary)', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                                            >
                                                <CheckCircle size={24} />
                                            </button>
                                            <button
                                                onClick={() => promptAction(task, 'REJECT')}
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
                                    borderTop: '1px solid var(--border-light)',
                                    paddingTop: '0.75rem',
                                    fontSize: '0.85rem'
                                }}>
                                    <div style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontSize: '0.8rem' }}>승인 현황:</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {requiredApprovers.map(approver => {
                                            const approvalRecord = task.approvals.find(a => a.member.id === approver.id)
                                            const isApproved = !!approvalRecord
                                            return (
                                                <div key={approver.id} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '6px 12px',
                                                    borderRadius: 'var(--radius-full)',
                                                    background: isApproved ? 'var(--bg-main)' : 'var(--bg-card)',
                                                    border: isApproved ? 'none' : '1px solid var(--border-light)',
                                                    color: isApproved ? 'var(--color-secondary)' : 'var(--color-text-muted)',
                                                    opacity: isApproved ? 1 : 0.8,
                                                    transition: 'all 0.2s',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {isApproved ? <CheckCircle size={16} /> : <UserIcon size={16} />}
                                                    <span style={{ fontWeight: isApproved ? 'bold' : 'normal' }}>{approver.name}</span>
                                                    {isApproved && approvalRecord.comment && (
                                                        <span style={{
                                                            marginLeft: '4px',
                                                            color: 'var(--color-text-main)',
                                                            fontStyle: 'italic',
                                                            background: 'var(--bg-card)',
                                                            padding: '2px 8px',
                                                            borderRadius: '8px',
                                                            flex: 1,
                                                            wordBreak: 'break-word',
                                                            border: '1px solid var(--border-light)'
                                                        }}>
                                                            "{approvalRecord.comment}"
                                                        </span>
                                                    )}
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

            {/* Feedback Modal */}
            {actionTask && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '400px', animation: 'fadeIn 0.2s ease-out' }}>
                        <h3 className="text-playful" style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {actionTask.action === 'APPROVE' ? <CheckCircle color="var(--color-secondary)" /> : <XCircle color="var(--color-accent)" />}
                            {actionTask.action === 'APPROVE' ? '승인하기' : '거절하기'}
                        </h3>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            <strong style={{ color: 'var(--color-text-main)' }}>{actionTask.title}</strong> 에 대한 한마디를 남겨보세요. (선택사항)
                        </p>
                        <textarea
                            className="input"
                            placeholder="예: 참 잘했어요! 정말 고마워~ 💕"
                            value={feedback}
                            onChange={e => setFeedback(e.target.value)}
                            style={{ width: '100%', minHeight: '100px', marginBottom: '1.5rem', resize: 'vertical' }}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setActionTask(null)}
                                className="btn"
                                style={{ flex: 1, background: 'var(--bg-main)', color: 'var(--color-text-main)' }}
                                disabled={isSubmitting}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleConfirmAction}
                                className="btn btn-primary"
                                style={{ flex: 1, background: actionTask.action === 'APPROVE' ? 'var(--color-secondary)' : 'var(--color-accent)' }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? '처리 중...' : '확인'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    )
}
