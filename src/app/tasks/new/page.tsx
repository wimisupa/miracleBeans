'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Sprout, Timer, ListTodo, ClipboardCheck } from 'lucide-react'
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

    // Mission toggle
    const [isMission, setIsMission] = useState(true)

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
                    type: isMission ? 'MISSION' : (useTimer ? 'HOURGLASS' : 'EARN'),
                    points: jerryVerdict.points,
                    creatorId: currentMember.id,
                    assigneeId: assigneeId,
                    durationMinutes: useTimer ? Number(durationMinutes) : undefined
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

                    {/* 2.5. Mission Toggle (MISSION) */}
                    <div style={{
                        marginBottom: '1.5rem',
                        padding: '1.5rem',
                        borderRadius: '20px',
                        background: isMission ? 'rgba(0, 191, 165, 0.05)' : 'rgba(255,255,255,0.6)',
                        border: isMission ? '2px solid var(--color-primary)' : '1px solid #E0E0E0',
                        transition: 'all 0.3s ease'
                    }}>
                        <div
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                            onClick={() => { setIsMission(!isMission); if (!isMission) setUseTimer(false); }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ClipboardCheck size={24} color={isMission ? 'var(--color-primary)' : '#90A4AE'} />
                                <span style={{ fontWeight: 'bold', color: isMission ? 'var(--color-primary)' : '#607D8B' }}>
                                    결과 보고 필요 (미션)
                                </span>
                            </div>
                            <div style={{
                                width: '50px', height: '28px', borderRadius: '14px',
                                background: isMission ? 'var(--color-primary)' : '#CFD8DC',
                                position: 'relative', transition: 'background 0.3s'
                            }}>
                                <div style={{
                                    width: '24px', height: '24px', borderRadius: '50%', background: 'white',
                                    position: 'absolute', top: '2px', left: isMission ? '24px' : '2px',
                                    transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }} />
                            </div>
                        </div>
                    </div>

                    {/* 3. Timer Toggle (HOURGLASS) */}
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
                            onClick={() => { setUseTimer(!useTimer); if (!useTimer) setIsMission(false); }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Timer size={24} color={useTimer ? 'var(--color-primary)' : '#90A4AE'} />
                                <span style={{ fontWeight: 'bold', color: useTimer ? 'var(--color-primary)' : '#607D8B' }}>
                                    모래시계 적용
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
                                <label className="label">얼마나 할 건가요?</label>
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
                        disabled={loading || !jerryVerdict || !assigneeId || (useTimer && !durationMinutes)}
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
