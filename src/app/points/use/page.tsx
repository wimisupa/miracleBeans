'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Gift, ChevronLeft, Siren, Sprout } from 'lucide-react'
import { useMember } from '@/context/MemberContext'

type Member = {
    id: string
    name: string
    role: string
}

export default function PointUsagePage() {
    const router = useRouter()
    const { currentMember, refreshMember } = useMember()

    const [activeTab, setActiveTab] = useState<'SPEND' | 'GIFT' | 'TATTLE'>('SPEND')
    const [loading, setLoading] = useState(false)
    const [description, setDescription] = useState('')

    // Gift/Tattle specific state
    const [receiverId, setReceiverId] = useState('')
    const [amount, setAmount] = useState<number | ''>('')
    const [otherMembers, setOtherMembers] = useState<Member[]>([])

    // Tattle specific state
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
        "제리가 법전을 뒤적이는 중... 📚",
        "해바라기씨 까먹으며 고민 중... 🌻",
        "판례를 분석하는 중... 🧐",
        "공정한 판결을 위해 명상 중... 🧘",
        "쳇바퀴 돌리며 머리 식히는 중... 🎡",
        "엄마 아빠의 마음을 읽는 중... 📡"
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
    }, [isJerryThinking])

    useEffect(() => {
        if (!currentMember) {
            router.push('/')
        }
    }, [currentMember, router])

    useEffect(() => {
        if (currentMember) {
            refreshMember()
        }

        if ((activeTab === 'GIFT' || activeTab === 'TATTLE') && currentMember) {
            fetch(`/api/members?familyId=${currentMember.familyId}`)
                .then(res => res.json())
                .then((data: Member[]) => {
                    setOtherMembers(data.filter(m => m.id !== currentMember.id))
                })
        }
    }, [activeTab, currentMember?.id])

    if (!currentMember) return null

    const handleAskJerry = async () => {
        if (!description || cooldown > 0) return

        setIsJerryThinking(true)
        setJerryVerdict(null)

        try {
            const res = await fetch('/api/jerry/consult', {
                method: 'POST',
                body: JSON.stringify({ description, type: activeTab === 'TATTLE' ? 'TATTLE' : 'SPEND' })
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

    const handleSubmitTattle = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!jerryVerdict || !receiverId) return

        setLoading(true)
        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: description,
                    description: description,
                    type: 'TATTLE',
                    points: jerryVerdict.points,
                    creatorId: currentMember.id,
                    targetMemberId: receiverId
                }),
            })

            if (res.ok) {
                router.push(`/family/${currentMember.familyId}/dashboard`)
                router.refresh()
            } else {
                alert('실패했습니다.')
            }
        } catch (error) {
            console.error(error)
            alert('오류가 발생했습니다.')
        } finally {
            setLoading(false)
        }
    }

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault()
        const transferAmount = Number(amount)
        if (!receiverId || transferAmount <= 0) return

        setLoading(true)
        try {
            const res = await fetch('/api/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: currentMember.id,
                    receiverId,
                    amount: transferAmount,
                    message: description || '마음을 담아 선물'
                })
            })
            const data = await res.json()

            if (res.ok) {
                router.push(`/family/${currentMember.familyId}/dashboard`)
                router.refresh()
            } else {
                alert(data.error || '실패했어요.')
            }
        } catch (error) {
            alert('오류 발생')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitSpend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!jerryVerdict || !description) return

        if (currentMember.points < jerryVerdict.points) {
            alert(`콩이 부족해요! (필요: ${jerryVerdict.points}콩, 현재: ${currentMember.points}콩)`)
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: description,
                    description: description,
                    type: 'SPEND',
                    points: -jerryVerdict.points, // Deduct
                    creatorId: currentMember.id,
                }),
            })

            if (res.ok) {
                const task = await res.json()
                await fetch(`/api/tasks/${task.id}/approve`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'APPROVE' })
                })

                router.push(`/family/${currentMember.familyId}/dashboard`)
                router.refresh()
            } else {
                alert('실패했습니다.')
            }
        } catch (error) {
            console.error(error)
            alert('오류 발생')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <header className="header" style={{ display: 'flex', alignItems: 'center', paddingTop: '1rem' }}>
                <Link href={`/family/${currentMember.familyId}/dashboard`} style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-muted)', textDecoration: 'none', marginRight: '1rem' }}>
                    <ChevronLeft size={32} />
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-main)', gap: '8px' }}>
                    <Gift size={32} color="var(--color-primary)" />
                    <span className="text-playful" style={{ fontSize: '1.4rem', letterSpacing: '-0.02em' }}>
                        콩 쓰기
                    </span>
                </div>
            </header>

            <div className="card">
                {/* Mode Selection */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--bg-main)', padding: '6px', borderRadius: 'var(--radius-full)', overflowX: 'auto', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                    {([
                        { id: 'SPEND', icon: <Sprout size={16} />, label: '쓰기' },
                        { id: 'GIFT', icon: <Gift size={16} />, label: '선물' },
                        { id: 'TATTLE', icon: <Siren size={16} />, label: '이르기' }
                    ] as const).map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => {
                                setActiveTab(mode.id as any);
                                setJerryVerdict(null);
                                setDescription('');
                                setAmount('');
                                setReceiverId('');
                            }}
                            style={{
                                flex: 1,
                                minWidth: '70px',
                                padding: '10px 4px',
                                borderRadius: 'var(--radius-full)',
                                border: 'none',
                                background: activeTab === mode.id ? 'var(--bg-card)' : 'transparent',
                                color: activeTab === mode.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                fontWeight: activeTab === mode.id ? '800' : '600',
                                fontSize: '0.95rem',
                                boxShadow: activeTab === mode.id ? 'var(--shadow-sm)' : 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transform: activeTab === mode.id ? 'scale(1.02)' : 'scale(1)'
                            }}
                        >
                            {mode.icon}
                            {mode.label}
                        </button>
                    ))}
                </div>

                {/* Sub Forms based on Tab */}
                {activeTab === 'GIFT' ? (
                    <form onSubmit={handleTransfer}>
                        <div style={{ marginBottom: '1.5rem', background: '#FFF3E0', padding: '1rem', borderRadius: '16px', border: '1px solid #FFE0B2' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#E65100', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                <Gift size={20} />
                                <span>가족에게 콩 선물하기</span>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: '#EF6C00' }}>
                                응원하거나 칭찬하고 싶은 가족에게<br />
                                나의 콩을 선물해 보세요! 🎁
                            </p>
                        </div>

                        <div style={{ marginBottom: '1.5rem', background: 'var(--bg-main)', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-light)' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>나의 콩</div>
                            <div className="text-playful" style={{ fontSize: '2rem', color: '#FBC02D' }}>
                                {currentMember.points.toLocaleString()} 콩
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="label">누구에게 보낼까요?</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {otherMembers.map(m => (
                                    <div
                                        key={m.id}
                                        onClick={() => setReceiverId(m.id)}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: 'var(--radius-sm)',
                                            border: receiverId === m.id ? '2px solid var(--color-primary)' : '1px solid var(--border-light)',
                                            background: receiverId === m.id ? 'var(--bg-card)' : 'var(--bg-main)',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxShadow: receiverId === m.id ? 'var(--shadow-sm)' : 'none'
                                        }}
                                    >
                                        <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                                            {m.role === 'PARENT' ? '🪄' : '🧙'}
                                        </div>
                                        <div style={{ fontWeight: 'bold', color: 'var(--color-text-main)' }}>{m.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="label">얼마나 보낼까요?</label>
                            <input
                                type="number"
                                className="input"
                                placeholder="예: 100"
                                value={amount}
                                onChange={e => setAmount(Number(e.target.value))}
                                min="1"
                                max={currentMember.points}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="label">메시지 (옵션)</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="예: 마음을 담아 선물해"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary animate-pop"
                            style={{ width: '100%', justifyContent: 'center' }}
                            disabled={loading || !receiverId || Number(amount) <= 0 || Number(amount) > currentMember.points}
                        >
                            {loading ? '보내는 중...' : '보내기 🧙'}
                        </button>
                    </form>
                ) : activeTab === 'TATTLE' ? (
                    <form onSubmit={handleSubmitTattle}>
                        <div style={{ marginBottom: '1.5rem', background: '#FFEBEE', padding: '1rem', borderRadius: '16px', border: '1px solid #FFCDD2' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#D32F2F', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                <Siren size={20} />
                                <span>제리에게 고자질하기</span>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: '#B71C1C' }}>
                                가족의 규칙 위반이나 게으름을 신고하세요.<br />
                                제리가 공정하게 판단하여 벌금을 부과합니다! 🐹⚖️
                            </p>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="label">누구를 이를까요?</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {otherMembers.map(m => (
                                    <div
                                        key={m.id}
                                        onClick={() => setReceiverId(m.id)}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: 'var(--radius-sm)',
                                            border: receiverId === m.id ? '2px solid #D32F2F' : '1px solid var(--border-light)',
                                            background: receiverId === m.id ? '#FFEBEE' : 'var(--bg-main)',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxShadow: receiverId === m.id ? 'var(--shadow-sm)' : 'none'
                                        }}
                                    >
                                        <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                                            {m.role === 'PARENT' ? '🪄' : '🧙'}
                                        </div>
                                        <div style={{ fontWeight: 'bold', color: 'var(--color-text-main)' }}>{m.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label className="label">무엇을 신고하나요?</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="input"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="예: 양치를 안 했어요"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={handleAskJerry}
                                    className="btn btn-primary animate-pop"
                                    style={{
                                        minWidth: '80px',
                                        padding: '0 16px',
                                        background: (isJerryThinking || cooldown > 0) ? 'var(--bg-main)' : '#ef4444',
                                        color: (isJerryThinking || cooldown > 0) ? 'var(--color-text-muted)' : 'white',
                                        border: (isJerryThinking || cooldown > 0) ? '1px solid var(--border-light)' : 'none',
                                        cursor: (isJerryThinking || cooldown > 0) ? 'not-allowed' : 'pointer',
                                    }}
                                    disabled={isJerryThinking || cooldown > 0}
                                >
                                    {isJerryThinking ? '...' : cooldown > 0 ? `${cooldown}초 대기` : '심판!'}
                                </button>
                            </div>
                        </div>

                        {/* Jerry's Verdict or Thinking State */}
                        {isJerryThinking ? (
                            <div style={{
                                background: 'var(--bg-main)',
                                border: '1px dashed var(--border-light)',
                                borderRadius: 'var(--radius-md)',
                                padding: '2rem',
                                marginBottom: '1.5rem',
                                textAlign: 'center',
                                animation: 'pulse 1.5s infinite ease-in-out'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐹💭</div>
                                <div style={{ color: 'var(--color-text-muted)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                    {thinkingMessage}
                                </div>
                            </div>
                        ) : jerryVerdict && (
                            <div style={{
                                background: 'var(--bg-card)',
                                border: '1px solid #ef4444',
                                borderRadius: 'var(--radius-md)',
                                padding: '1.5rem',
                                marginBottom: '1.5rem',
                                animation: 'fadeIn 0.3s ease',
                                boxShadow: 'var(--shadow-sm)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                                    <span style={{ fontSize: '1.5rem' }}>{jerryVerdict.emoji}</span>
                                    <span>제리의 판결:</span>
                                </div>
                                <p style={{ marginBottom: '0.5rem', color: 'var(--color-text-main)', fontSize: '1.1rem' }}>"{jerryVerdict.comment}"</p>
                                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ef4444' }}>
                                    -{jerryVerdict.points} 콩 (벌금)
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary animate-pop"
                            style={{ width: '100%', background: '#ef4444', color: 'white', justifyContent: 'center' }}
                            disabled={loading || !jerryVerdict || !receiverId || isJerryThinking}
                        >
                            {loading ? '신고 접수 중...' : '정의구현 ⚖️'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmitSpend}>
                        <div style={{ marginBottom: '1.5rem', background: '#E0F2F1', padding: '1rem', borderRadius: '16px', border: '1px solid #B2DFDB' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00796B', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                <Sprout size={20} />
                                <span>사용할 콩 제리에게 묻기</span>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: '#00695C' }}>
                                콩을 어디에 사용할지 적어주세요.<br />
                                제리가 공정하게 가격을 책정합니다! 🐹✨
                            </p>
                        </div>

                        <div style={{ marginBottom: '1.5rem', background: 'var(--bg-main)', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-light)' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>나의 콩</div>
                            <div className="text-playful" style={{ fontSize: '2rem', color: '#FBC02D' }}>
                                {currentMember.points.toLocaleString()} 콩
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="label">콩을 어디에 사용할까요?</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="input"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="예: 게임기 30분, 간식 구매"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={handleAskJerry}
                                    className="btn btn-primary animate-pop"
                                    style={{
                                        minWidth: '80px',
                                        padding: '0 16px',
                                        background: (isJerryThinking || cooldown > 0) ? 'var(--bg-main)' : 'var(--color-primary)',
                                        color: (isJerryThinking || cooldown > 0) ? 'var(--color-text-muted)' : '#333333',
                                        border: (isJerryThinking || cooldown > 0) ? '1px solid var(--border-light)' : 'none',
                                        cursor: (isJerryThinking || cooldown > 0) ? 'not-allowed' : 'pointer',
                                    }}
                                    disabled={isJerryThinking || cooldown > 0 || !description}
                                >
                                    {isJerryThinking ? '...' : cooldown > 0 ? `${cooldown}초 대기` : '판정'}
                                </button>
                            </div>
                        </div>

                        {/* Jerry's Verdict or Thinking State */}
                        {isJerryThinking ? (
                            <div style={{
                                background: 'var(--bg-main)',
                                border: '1px dashed var(--border-light)',
                                borderRadius: 'var(--radius-md)',
                                padding: '2rem',
                                marginBottom: '1.5rem',
                                textAlign: 'center',
                                animation: 'pulse 1.5s infinite ease-in-out'
                            }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐹💭</div>
                                <div style={{ color: 'var(--color-text-muted)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                    {thinkingMessage}
                                </div>
                            </div>
                        ) : jerryVerdict && (
                            <div style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--color-primary)',
                                borderRadius: 'var(--radius-md)',
                                padding: '1.5rem',
                                marginBottom: '1.5rem',
                                animation: 'fadeIn 0.3s ease',
                                boxShadow: 'var(--shadow-sm)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
                                    <span style={{ fontSize: '1.5rem' }}>{jerryVerdict.emoji}</span>
                                    <span>제리의 결정:</span>
                                </div>
                                <p style={{ marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>"{jerryVerdict.comment}"</p>
                                <div className="text-playful" style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }}>
                                    {jerryVerdict.points} 콩 (필요)
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary animate-pop"
                            style={{ width: '100%', justifyContent: 'center' }}
                            disabled={loading || !jerryVerdict || isJerryThinking || currentMember.points < jerryVerdict.points}
                        >
                            {loading ? '승인 및 결제 진행 중...' : '사용하기 ✨'}
                        </button>
                    </form>
                )}
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
