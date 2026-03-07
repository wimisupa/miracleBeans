'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Sprout, Timer, ListTodo, ClipboardCheck, Activity, Zap, PenTool } from 'lucide-react'
import { useMember } from '@/context/MemberContext'

type Member = {
    id: string
    name: string
    role: string
}

export default function NewTaskPage() {
    const router = useRouter()
    const { currentMember } = useMember()

    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState('')

    // Assignee selection
    const [assigneeId, setAssigneeId] = useState('')
    const [familyMembers, setFamilyMembers] = useState<Member[]>([])

    type TaskType = 'EARN' | 'MISSION' | 'HOURGLASS' | 'COUNTER'
    const [taskType, setTaskType] = useState<TaskType>('MISSION')
    const [durationMinutes, setDurationMinutes] = useState<number | ''>('')
    const [targetCount, setTargetCount] = useState<number | ''>('')

    // Jerry specific state
    const [jerryVerdict, setJerryVerdict] = useState<{ points: number, comment: string, emoji: string } | null>(null)
    const [isJerryThinking, setIsJerryThinking] = useState(false)
    const [thinkingMessage, setThinkingMessage] = useState('')
    const [cooldown, setCooldown] = useState(0)

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(c => c - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [cooldown])

    const thinkingMessages = [
        "제리가 콩 보따리를 뒤적이는 중... 🐹",
        "수지타산을 계산하는 중... 🧮",
        "해바라기씨 까먹으며 고민 중... 🌻",
        "이 할 일의 가치를 평가 중... 💡"
    ]

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isJerryThinking) {
            setThinkingMessage(thinkingMessages[0])
            let i = 0
            interval = setInterval(() => {
                i = (i + 1) % thinkingMessages.length
                setThinkingMessage(thinkingMessages[i])
            }, 2000)
        }
        return () => clearInterval(interval)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isJerryThinking])

    useEffect(() => {
        if (!currentMember) {
            router.push('/')
        }
    }, [currentMember, router])

    useEffect(() => {
        if (currentMember?.familyId) {
            fetch(`/api/members?familyId=${currentMember.familyId}`)
                .then(res => res.json())
                .then((data: Member[]) => {
                    setFamilyMembers(data)
                    // Auto-select self by default
                    if (!assigneeId) {
                        setAssigneeId(currentMember.id)
                    }
                })
        }
    }, [currentMember?.familyId, currentMember?.id, assigneeId])

    if (!currentMember) return null

    const handleAskJerry = async () => {
        if (!title || cooldown > 0) return

        setIsJerryThinking(true)
        setJerryVerdict(null)

        try {
            const res = await fetch('/api/jerry/consult', {
                method: 'POST',
                body: JSON.stringify({ description: title, type: 'EARN' })
            })

            if (res.status === 429) {
                alert('앗, 제리가 지금 밀린 일들을 처리하느라 너무 바빠요! 🐹💦\n잠시 유배를 다녀올게요. 30초 뒤에 다시 시도해주세요.')
                setCooldown(30)
                setIsJerryThinking(false)
                return
            }

            const data = await res.json()
            setJerryVerdict(data)
        } catch (e) {
            console.error(e)
            alert('제리가 잠들었나봐요. 다시 시도해주세요.')
        } finally {
            setIsJerryThinking(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!jerryVerdict) return

        if (!assigneeId) {
            alert('이 할 일을 누가 할지 담당자를 선택해주세요.')
            return
        }

        if (taskType === 'HOURGLASS' && !durationMinutes) {
            alert('모래시계 타이머의 진행 시간을 입력해주세요.')
            return
        }

        if (taskType === 'COUNTER' && !targetCount) {
            alert('횟수 목표를 입력해주세요.')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title,
                    description: title,
                    type: taskType,
                    points: jerryVerdict.points,
                    creatorId: currentMember.id,
                    assigneeId: assigneeId,
                    durationMinutes: taskType === 'HOURGLASS' ? Number(durationMinutes) : undefined,
                    targetCount: taskType === 'COUNTER' ? Number(targetCount) : undefined
                }),
            })

            if (res.ok) {
                router.push(`/family/${currentMember.familyId}/dashboard`)
                router.refresh()
                return // Do not reset loading state, let the page transition
            } else {
                alert('실패했습니다.')
            }
        } catch (error) {
            console.error(error)
            alert('오류가 발생했습니다.')
        }

        setLoading(false)
    }

    // Reset jerry verdict if they change the title
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value)
        setJerryVerdict(null)
    }

    return (
        <div>
            <header className="header" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', paddingTop: '1rem' }}>
                <Link href={`/family/${currentMember?.familyId}/dashboard`} style={{ display: 'flex', alignItems: 'center', color: '#1A252C', textDecoration: 'none', marginRight: '1rem' }}>
                    <ChevronLeft size={32} />
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', color: '#1A252C', gap: '8px' }}>
                    <ListTodo size={32} color="var(--color-primary)" />
                    <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                        할 일 등록
                    </span>
                </div>
            </header>

            <div className="card">
                <form onSubmit={handleSubmit}>

                    {/* 1. Who? (Assignee) */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">누가 할 건가요?</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
                            {familyMembers.map(m => (
                                <div
                                    key={m.id}
                                    onClick={() => setAssigneeId(m.id)}
                                    style={{
                                        padding: '0.8rem',
                                        borderRadius: '16px',
                                        border: assigneeId === m.id ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.5)',
                                        background: assigneeId === m.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.4)',
                                        color: assigneeId === m.id ? 'white' : '#37474F',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    <div style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>
                                        {m.role === 'PARENT' ? '🪄' : '🧙'}
                                    </div>
                                    {m.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. What? (Title) */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">어떤 일을 할 건가요?</label>
                        <input
                            type="text"
                            className="input"
                            value={title}
                            onChange={handleTitleChange}
                            placeholder="예: 설거지, 수학문제 풀기, 책 30쪽 읽기"
                            required
                            style={{ width: '100%' }}
                        />
                    </div>

                    {/* 2.5. Task Type Selection (Segmented Control) */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">어떤 종류의 할 일인가요?</label>
                        <div style={{
                            display: 'flex',
                            background: 'rgba(236, 239, 241, 0.6)',
                            padding: '4px',
                            borderRadius: '16px',
                            gap: '4px',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            {[
                                { id: 'EARN', label: '⚡️ 즉시 완료', icon: <Zap size={18} /> },
                                { id: 'MISSION', label: '📝 결과 보고', icon: <PenTool size={18} /> },
                                { id: 'HOURGLASS', label: '⏳ 타이머', icon: <Timer size={18} /> },
                                { id: 'COUNTER', label: '🏃 동작 측정', icon: <Activity size={18} /> },
                            ].map((typeOption) => {
                                const isSelected = taskType === typeOption.id;
                                return (
                                    <div
                                        key={typeOption.id}
                                        onClick={() => setTaskType(typeOption.id as TaskType)}
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '4px',
                                            padding: '10px 4px',
                                            borderRadius: '12px',
                                            background: isSelected ? 'white' : 'transparent',
                                            color: isSelected ? 'var(--color-primary)' : '#78909C',
                                            fontWeight: isSelected ? '800' : '600',
                                            fontSize: '0.75rem',
                                            whiteSpace: 'nowrap',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.08)' : 'none',
                                            transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                        }}
                                    >
                                        {typeOption.icon}
                                        <span>{typeOption.label}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Extra Inputs based on Type */}
                    {taskType === 'HOURGLASS' && (
                        <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'white', borderRadius: '16px', border: '1px solid #ECEFF1', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', animation: 'fadeIn 0.3s ease' }}>
                            <label className="label">얼마나 할 건가요? (타이머)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="number"
                                    className="input"
                                    value={durationMinutes}
                                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                                    placeholder="예: 30"
                                    min="1"
                                    style={{ flex: 1 }}
                                />
                                <span style={{ color: '#607D8B', fontWeight: 'bold' }}>분</span>
                            </div>
                        </div>
                    )}

                    {taskType === 'COUNTER' && (
                        <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'white', borderRadius: '16px', border: '1px solid #ECEFF1', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', animation: 'fadeIn 0.3s ease' }}>
                            <label className="label">몇 번 하실 건가요? (동작 측정)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="number"
                                    className="input"
                                    value={targetCount}
                                    onChange={(e) => setTargetCount(Number(e.target.value))}
                                    placeholder="예: 100"
                                    min="1"
                                    style={{ flex: 1 }}
                                />
                                <span style={{ color: '#607D8B', fontWeight: 'bold' }}>회 (번)</span>
                            </div>
                        </div>
                    )}

                    {/* 4. Jerry Consultation */}
                    <div style={{ marginBottom: '2.5rem', marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                        <button
                            type="button"
                            onClick={handleAskJerry}
                            style={{
                                padding: '16px 40px',
                                fontSize: '1.2rem',
                                fontWeight: '900',
                                borderRadius: '24px',
                                border: 'none',
                                background: (isJerryThinking || cooldown > 0) ? '#CFD8DC' : 'linear-gradient(135deg, var(--color-primary) 0%, #00897B 100%)',
                                color: 'white',
                                cursor: (isJerryThinking || cooldown > 0) ? 'not-allowed' : 'pointer',
                                opacity: (isJerryThinking || cooldown > 0) ? 0.8 : 1,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: (isJerryThinking || cooldown > 0) ? 'none' : '0 8px 24px rgba(0, 191, 165, 0.4)',
                                transform: (isJerryThinking || cooldown > 0) ? 'scale(1)' : 'scale(1.02)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            disabled={isJerryThinking || cooldown > 0 || !title}
                            onMouseEnter={(e) => {
                                if (!isJerryThinking && cooldown === 0 && title) {
                                    e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'
                                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(0, 191, 165, 0.5)'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isJerryThinking && cooldown === 0 && title) {
                                    e.currentTarget.style.transform = 'scale(1.02)'
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 191, 165, 0.4)'
                                }
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>{isJerryThinking ? '🐹💭' : cooldown > 0 ? '⏳' : '🐹'}</span>
                            <span>{isJerryThinking ? '제리가 궁리중...' : cooldown > 0 ? `${cooldown}초 대기` : '제리의 판결'}</span>
                        </button>
                    </div>

                    {/* Jerry's Verdict or Thinking State */}
                    {isJerryThinking && (
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            border: '2px dashed #B0BEC5',
                            borderRadius: '20px',
                            padding: '2rem',
                            marginBottom: '1.5rem',
                            textAlign: 'center',
                            animation: 'pulse 1.5s infinite ease-in-out'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐹💭</div>
                            <div style={{ color: '#546E7A', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                {thinkingMessage}
                            </div>
                        </div>
                    )}

                    {!isJerryThinking && jerryVerdict && (
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            border: '2px solid #FFD54F',
                            borderRadius: '20px',
                            padding: '1.5rem',
                            marginBottom: '1.5rem',
                            animation: 'fadeIn 0.3s ease',
                            boxShadow: '0 8px 20px rgba(255, 213, 79, 0.15)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold', color: '#37474F' }}>
                                <span style={{ fontSize: '1.5rem' }}>{jerryVerdict.emoji}</span>
                                <span>제리의 제안:</span>
                            </div>
                            <p style={{ marginBottom: '0.5rem', color: '#546E7A' }}>"{jerryVerdict.comment}"</p>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FBC02D' }}>
                                {jerryVerdict.points} 콩
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
                        disabled={loading || !jerryVerdict || !assigneeId || (taskType === 'HOURGLASS' && !durationMinutes) || (taskType === 'COUNTER' && !targetCount)}
                    >
                        {loading ? '등록 중...' : '등록하기 ✨'}
                    </button>
                </form>
            </div>

            <style jsx global>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}
