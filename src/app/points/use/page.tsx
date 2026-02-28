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
            fetch('/api/members')
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
                body: JSON.stringify({ description, type: 'TATTLE' })
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
                alert('정의의 이름으로 제리에게 신고 완료! 🐹⚖️')
                router.push('/')
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
                alert('콩을 선물했어요! 🧙')
                router.push('/')
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
        if (!description) {
            alert('무엇에 사용할 건가요?')
            return
        }

        // Spend logic: deduct points immediately
        setLoading(true)
        try {
            const evaluateRes = await fetch('/api/jerry/consult', {
                method: 'POST',
                body: JSON.stringify({ description, type: 'SPEND' })
            })
            if (!evaluateRes.ok) throw new Error('Jerry consultation failed')
            const jerryData = await evaluateRes.json()

            if (currentMember.points < jerryData.points) {
                alert(`콩이 부족해요! (필요: ${jerryData.points}콩, 현재: ${currentMember.points}콩)`)
                setLoading(false)
                return
            }

            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: description,
                    description: description,
                    type: 'SPEND',
                    points: -jerryData.points, // Deduct
                    creatorId: currentMember.id,
                }),
            })

            if (res.ok) {
                // Auto approve SPEND tasks for immediate deduction
                const task = await res.json()
                await fetch(`/api/tasks/${task.id}/approve`, { method: 'POST' })

                alert(`${jerryData.points}콩을 사용하여 '${description}' 쿠폰을 발행했어요! 🎉`)
                router.push('/')
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
            <header className="header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
                    <ChevronLeft size={28} />
                </Link>
                <div className="logo" style={{ flex: 1 }}>
                    <Sprout size={28} />
                    <span>콩 사용/선물</span>
                </div>
            </header>

            <div className="card">
                {/* Mode Selection */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.5)', padding: '6px', borderRadius: '20px', overflowX: 'auto' }}>
                    {([
                        { id: 'SPEND', icon: <ArrowRight size={16} />, label: '쓰기' },
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
                                borderRadius: '16px',
                                border: 'none',
                                background: activeTab === mode.id ? 'white' : 'transparent',
                                color: activeTab === mode.id ? '#FFB74D' : '#607D8B',
                                fontWeight: 'bold',
                                fontSize: '0.95rem',
                                boxShadow: activeTab === mode.id ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
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
                        <div style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(255, 235, 59, 0.1), rgba(255, 255, 255, 0.4))', padding: '1.5rem', borderRadius: '24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.6)' }}>
                            <div style={{ fontSize: '0.9rem', color: '#607D8B', marginBottom: '0.5rem' }}>나의 콩</div>
                            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#FBC02D', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
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
                                            borderRadius: '20px',
                                            border: receiverId === m.id ? '2px solid var(--color-secondary)' : '1px solid rgba(255,255,255,0.5)',
                                            background: receiverId === m.id ? 'rgba(0, 191, 165, 0.1)' : 'rgba(255,255,255,0.4)',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                                            {m.role === 'PARENT' ? '🪄' : '🧙'}
                                        </div>
                                        <div style={{ fontWeight: 'bold', color: '#37474F' }}>{m.name}</div>
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
                            className="btn btn-primary"
                            style={{ width: '100%', background: '#FFB74D', color: '#fff' }}
                            disabled={loading || !receiverId || Number(amount) <= 0 || Number(amount) > currentMember.points}
                        >
                            {loading ? '보내는 중...' : '콩 보내기 🧙'}
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
                                            borderRadius: '20px',
                                            border: receiverId === m.id ? '2px solid #D32F2F' : '1px solid rgba(255,255,255,0.5)',
                                            background: receiverId === m.id ? 'rgba(211, 47, 47, 0.1)' : 'rgba(255,255,255,0.4)',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                                            {m.role === 'PARENT' ? '🪄' : '🧙'}
                                        </div>
                                        <div style={{ fontWeight: 'bold', color: '#37474F' }}>{m.name}</div>
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
                                    className="btn btn-primary"
                                    style={{
                                        minWidth: '80px',
                                        padding: '0 16px',
                                        borderRadius: '12px',
                                        background: (isJerryThinking || cooldown > 0) ? '#B0BEC5' : 'linear-gradient(135deg, #FF5252 0%, #E53935 100%)',
                                        color: 'white',
                                        cursor: (isJerryThinking || cooldown > 0) ? 'not-allowed' : 'pointer',
                                        opacity: (isJerryThinking || cooldown > 0) ? 0.7 : 1
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
                                background: 'rgba(255, 255, 255, 0.9)',
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
                        ) : jerryVerdict && (
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                border: '2px solid #D32F2F',
                                borderRadius: '20px',
                                padding: '1.5rem',
                                marginBottom: '1.5rem',
                                animation: 'fadeIn 0.3s ease',
                                boxShadow: '0 8px 20px rgba(211, 47, 47, 0.15)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 'bold', color: '#D32F2F' }}>
                                    <span style={{ fontSize: '1.5rem' }}>{jerryVerdict.emoji}</span>
                                    <span>제리의 판결:</span>
                                </div>
                                <p style={{ marginBottom: '0.5rem', color: '#37474F', fontSize: '1.1rem' }}>"{jerryVerdict.comment}"</p>
                                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#D32F2F' }}>
                                    -{jerryVerdict.points} 콩 (벌금)
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', background: 'linear-gradient(135deg, #D32F2F 0%, #B71C1C 100%)', color: 'white', boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)' }}
                            disabled={loading || !jerryVerdict || !receiverId || isJerryThinking}
                        >
                            {loading ? '신고 접수 중...' : '정의구현 하기 ⚖️'}
                            <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmitSpend}>
                        <div style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(255, 235, 59, 0.1), rgba(255, 255, 255, 0.4))', padding: '1.5rem', borderRadius: '24px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.6)' }}>
                            <div style={{ fontSize: '0.9rem', color: '#607D8B', marginBottom: '0.5rem' }}>나의 콩</div>
                            <div style={{ fontSize: '2rem', fontWeight: '900', color: '#FBC02D', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                {currentMember.points.toLocaleString()} 콩
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="label">콩을 어디에 사용할까요?</label>
                            <input
                                type="text"
                                className="input"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="예: 게임기 30분, 외식 메뉴 선택권"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', background: 'var(--color-primary)' }}
                            disabled={loading || !description}
                        >
                            {loading ? '승인 및 결제 진행 중...' : '콩 사용하기 ✨'}
                            <ArrowRight size={20} style={{ marginLeft: '8px' }} />
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
