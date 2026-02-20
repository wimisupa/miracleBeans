'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, ArrowRight, Sprout, Gift, ChevronLeft, Coins, Siren } from 'lucide-react'
import { useMember } from '@/context/MemberContext'

type Member = {
    id: string
    name: string
    role: string
}

export default function NewTaskPage() {
    const router = useRouter()
    const { currentMember, refreshMember } = useMember()

    // Joint state
    const [type, setType] = useState<'EARN' | 'SPEND' | 'GIFT' | 'TATTLE'>('EARN')
    const [loading, setLoading] = useState(false)
    const [description, setDescription] = useState('')

    // Gift specific state
    const [receiverId, setReceiverId] = useState('')
    const [amount, setAmount] = useState(0)
    const [otherMembers, setOtherMembers] = useState<Member[]>([])

    // Task specific state
    const [jerryVerdict, setJerryVerdict] = useState<{ points: number, comment: string, emoji: string } | null>(null)

    // Jerry Thinking State
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

    // Redirect if not logged in
    useEffect(() => {
        if (!currentMember) {
            router.push('/')
        }
    }, [currentMember, router])

    // ... (fetch members effect omitted for brevity if unchanged, but included in full file context) ...

    // Fetch members for 'GIFT' or 'TATTLE' mode and refresh current member balance
    useEffect(() => {
        if (currentMember) {
            // Refresh balance to ensure accurate display
            refreshMember()
        }

        if ((type === 'GIFT' || type === 'TATTLE') && currentMember) {
            fetch('/api/members')
                .then(res => res.json())
                .then((data: Member[]) => {
                    setOtherMembers(data.filter(m => m.id !== currentMember.id))
                })
        }
    }, [type, currentMember?.id])

    if (!currentMember) return null

    // --- Handlers ---

    const handleAskJerry = async () => {
        if (!description || cooldown > 0) return

        setIsJerryThinking(true)
        setJerryVerdict(null) // Clear previous verdict

        try {
            const res = await fetch('/api/jerry/consult', {
                method: 'POST',
                body: JSON.stringify({ description, type })
            })

            if (res.status === 429) {
                alert('앗, 제리가 지금 밀린 일들을 처리하느라 너무 바빠요! 🐹💦\\n잠시 유배를 다녀올게요. 30초 뒤에 다시 시도해주세요.')
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

        setLoading(true)
        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: description,
                    description: description,
                    type,
                    points: jerryVerdict.points,
                    creatorId: currentMember.id,
                    targetMemberId: type === 'TATTLE' ? receiverId : undefined
                }),
            })

            if (res.ok) {
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
        if (!receiverId || amount <= 0) return

        setLoading(true)
        try {
            const res = await fetch('/api/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: currentMember.id,
                    receiverId,
                    amount,
                    message: description || '마음을 담아 선물'
                })
            })
            const data = await res.json()

            if (res.ok) {
                alert('콩을 선물했어요! 🌱')
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

    return (
        <div>
            <header className="header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
                    <ChevronLeft size={28} />
                </Link>
                <div className="logo" style={{ flex: 1 }}>
                    <Sprout size={28} />
                    <span>{type === 'GIFT' ? '콩 선물하기' : type === 'TATTLE' ? '제리에게 이르기' : '새로운 활동'}</span>
                </div>
            </header>

            <div className="card">
                {/* Mode Selection */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.5)', padding: '6px', borderRadius: '20px' }}>
                    {([
                        { id: 'EARN', icon: <Coins size={16} />, label: '모으기' },
                        { id: 'SPEND', icon: <ArrowRight size={16} />, label: '쓰기' },
                        { id: 'GIFT', icon: <Gift size={16} />, label: '선물' },
                        { id: 'TATTLE', icon: <Siren size={16} />, label: '이르기' }
                    ] as const).map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => {
                                setType(mode.id as any);
                                setJerryVerdict(null);
                                setDescription('');
                            }}
                            style={{
                                flex: 1,
                                padding: '10px 0',
                                borderRadius: '16px',
                                border: 'none',
                                background: type === mode.id ? 'white' : 'transparent',
                                color: type === mode.id ? 'var(--color-primary)' : '#607D8B',
                                fontWeight: 'bold',
                                boxShadow: type === mode.id ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                            }}
                        >
                            {mode.icon}
                            {mode.label}
                        </button>
                    ))}
                </div>

                {type === 'GIFT' ? (
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
                                            {m.role === 'PARENT' ? '👑' : '🌱'}
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
                                value={amount || ''}
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
                                placeholder="예: 사랑해!"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={loading || !receiverId || amount <= 0 || amount > currentMember.points}
                        >
                            {loading ? '보내는 중...' : '콩 보내기 🌱'}
                        </button>
                    </form>
                ) : type === 'TATTLE' ? (
                    <form onSubmit={handleSubmit}>
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
                                            {m.role === 'PARENT' ? '👑' : '🌱'}
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
                                    placeholder="예: 아빠가 청소 안 하고 TV 봐요"
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
                    <form onSubmit={handleSubmit}>


                        {/* 3. What? */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="label">
                                {type === 'EARN' ? '어떤 착한 일을 했나요?' : '무엇을 하고 싶나요?'}
                            </label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    className="input"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={type === 'EARN' ? '예: 설거지, 안마' : '예: 게임 1시간'}
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
                                    disabled={isJerryThinking || cooldown > 0}
                                >
                                    {isJerryThinking ? '...' : cooldown > 0 ? `${cooldown}초 대기` : '제리?'}
                                </button>
                            </div>
                        </div>

                        {/* Jerry's Verdict or Thinking State */}
                        {isJerryThinking ? (
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
                        ) : jerryVerdict && (
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
                                    <span>제리 심판의 판결:</span>
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
                            style={{ width: '100%', background: type === 'EARN' ? 'linear-gradient(135deg, #FFD54F 0%, #FFCA28 100%)' : 'linear-gradient(135deg, #FF8A80 0%, #FF5252 100%)', boxShadow: type === 'EARN' ? '0 4px 12px rgba(255, 193, 7, 0.3)' : '0 4px 12px rgba(255, 82, 82, 0.3)', color: 'white' }}
                            disabled={loading || !jerryVerdict || isJerryThinking}
                        >
                            {loading ? '등록 중...' : '신청하기'}
                            <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                        </button>
                    </form>
                )}
            </div>

            <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.98); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
        </div>
    )
}
