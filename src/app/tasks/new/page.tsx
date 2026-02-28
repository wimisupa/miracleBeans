'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Sprout, Timer, ListTodo } from 'lucide-react'
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

    // Timer toggle
    const [useTimer, setUseTimer] = useState(false)
    const [durationMinutes, setDurationMinutes] = useState<number | ''>('')

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
        if (currentMember) {
            fetch('/api/members')
                .then(res => res.json())
                .then((data: Member[]) => {
                    setFamilyMembers(data)
                    // Auto-select self by default
                    if (!assigneeId) {
                        setAssigneeId(currentMember.id)
                    }
                })
        }
    }, [currentMember?.id, assigneeId])

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

        if (useTimer && !durationMinutes) {
            alert('모래시계 타이머의 진행 시간을 입력해주세요.')
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
                    type: useTimer ? 'HOURGLASS' : 'EARN',
                    points: jerryVerdict.points,
                    creatorId: currentMember.id,
                    assigneeId: assigneeId,
                    durationMinutes: useTimer ? Number(durationMinutes) : undefined
                }),
            })

            if (res.ok) {
                router.push('/')
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
            <header className="header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
                    <ChevronLeft size={28} />
                </Link>
                <div className="logo" style={{ flex: 1 }}>
                    <ListTodo size={28} />
                    <span>할 일 등록</span>
                </div>
            </header>

            <div className="card">
                <form onSubmit={handleSubmit}>

                    {/* 1. Who? (Assignee) */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">누가 할 건가요? (담당자)</label>
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

                    {/* 2. Timer Toggle (HOURGLASS) */}
                    <div style={{
                        marginBottom: '1.5rem',
                        padding: '1.5rem',
                        borderRadius: '20px',
                        background: useTimer ? 'rgba(0, 191, 165, 0.05)' : 'rgba(255,255,255,0.6)',
                        border: useTimer ? '2px solid var(--color-primary)' : '1px solid #E0E0E0',
                        transition: 'all 0.3s ease'
                    }}>
                        <div
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                            onClick={() => setUseTimer(!useTimer)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Timer size={24} color={useTimer ? 'var(--color-primary)' : '#90A4AE'} />
                                <span style={{ fontWeight: 'bold', color: useTimer ? 'var(--color-primary)' : '#607D8B' }}>
                                    이 할 일에 모래시계 타이머 적용하기
                                </span>
                            </div>
                            {/* Simple CSS Toggle Switch */}
                            <div style={{
                                width: '50px', height: '28px', borderRadius: '14px',
                                background: useTimer ? 'var(--color-primary)' : '#CFD8DC',
                                position: 'relative', transition: 'background 0.3s'
                            }}>
                                <div style={{
                                    width: '24px', height: '24px', borderRadius: '50%', background: 'white',
                                    position: 'absolute', top: '2px', left: useTimer ? '24px' : '2px',
                                    transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }} />
                            </div>
                        </div>

                        {useTimer && (
                            <div style={{ marginTop: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                                <label className="label">얼마나 할 예정인가요? (분)</label>
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
                    </div>

                    {/* 3. What? (Title) */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label">어떤 착한 일을 할건가요?</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                className="input"
                                value={title}
                                onChange={handleTitleChange}
                                placeholder="예: 설거지, 수학문제 풀기, 책 30쪽 읽기"
                                required
                            />
                            <button
                                type="button"
                                onClick={handleAskJerry}
                                className="btn btn-primary"
                                style={{
                                    minWidth: '80px',
                                    padding: '0 16px',
                                    borderRadius: '12px',
                                    background: (isJerryThinking || cooldown > 0) ? '#B0BEC5' : 'var(--color-primary)',
                                    cursor: (isJerryThinking || cooldown > 0) ? 'not-allowed' : 'pointer',
                                    opacity: (isJerryThinking || cooldown > 0) ? 0.7 : 1
                                }}
                                disabled={isJerryThinking || cooldown > 0 || !title}
                            >
                                {isJerryThinking ? '...' : cooldown > 0 ? `${cooldown}초 대기` : '콩 묻기'}
                            </button>
                        </div>
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
                        disabled={loading || !jerryVerdict || !assigneeId || (useTimer && !durationMinutes)}
                    >
                        {loading ? '등록 중...' : '할 일 등록하기 ✨'}
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
