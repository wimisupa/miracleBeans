'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Sparkles, Plus, Trash2, Timer, Coins, Calendar, Clock, Loader2 } from 'lucide-react'
import { useMember } from '@/context/MemberContext'

type Member = { id: string, name: string, role: string }
type Routine = {
    id: string
    title: string
    points: number
    type: 'EARN' | 'HOURGLASS'
    durationMinutes: number | null
    timeOfDay: string | null
    daysOfWeek: string
    creatorId: string
    assigneeId: string
    isActive: boolean
}

type Recommendation = {
    title: string
    points: number
    type: 'EARN' | 'HOURGLASS'
    timeOfDay: string
    durationMinutes?: number
    daysOfWeek: string
    comment: string
}

const DAYS = [
    { id: 'Mon', label: '월' },
    { id: 'Tue', label: '화' },
    { id: 'Wed', label: '수' },
    { id: 'Thu', label: '목' },
    { id: 'Fri', label: '금' },
    { id: 'Sat', label: '토' },
    { id: 'Sun', label: '일' }
]

export default function RoutinesPage() {
    const router = useRouter()
    const { currentMember } = useMember()
    const [familyMembers, setFamilyMembers] = useState<Member[]>([])

    const [routines, setRoutines] = useState<Routine[]>([])
    const [loadingRoutines, setLoadingRoutines] = useState(true)

    // Recommendations State
    const [recommendations, setRecommendations] = useState<Recommendation[]>([])
    const [loadingAI, setLoadingAI] = useState(false)

    // Form State
    const [showForm, setShowForm] = useState(false)
    const [title, setTitle] = useState('')
    const [points, setPoints] = useState(100)
    const [type, setType] = useState<'EARN' | 'HOURGLASS'>('EARN')
    const [durationMinutes, setDurationMinutes] = useState('')
    const [timeOfDay, setTimeOfDay] = useState('08:00')
    const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
    const [assigneeId, setAssigneeId] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!currentMember) return
        fetchRoutines()
        fetchMembers()
    }, [currentMember])

    const fetchMembers = async () => {
        const res = await fetch('/api/members')
        const data = await res.json()
        setFamilyMembers(data)
        if (currentMember) setAssigneeId(currentMember.id)
    }

    const fetchRoutines = async () => {
        if (!currentMember) return
        setLoadingRoutines(true)
        const res = await fetch('/api/routines')
        const data = await res.json()
        setRoutines(data.filter((r: Routine) => r.isActive && (r.creatorId === currentMember.id || r.assigneeId === currentMember.id)))
        setLoadingRoutines(false)
    }

    const handleAskJerry = async () => {
        if (!currentMember) return
        setLoadingAI(true)
        try {
            const res = await fetch('/api/jerry/recommend-routines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: currentMember.role, name: currentMember.name })
            })
            const data = await res.json()
            setRecommendations(data)
        } catch (e) {
            console.error(e)
            alert('제리가 지금 자고 있어요! 조금 이따 깨워주세요.')
        } finally {
            setLoadingAI(false)
        }
    }

    const toggleDay = (day: string) => {
        setSelectedDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        )
    }

    const handleSaveRoutine = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!title || !points || selectedDays.length === 0) return
        if (type === 'HOURGLASS' && !durationMinutes) {
            alert('타이머 시간을 입력해주세요!')
            return
        }

        setSaving(true)
        try {
            const res = await fetch('/api/routines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    type,
                    points: Number(points),
                    timeOfDay,
                    durationMinutes: type === 'HOURGLASS' ? Number(durationMinutes) : undefined,
                    daysOfWeek: selectedDays.join(','),
                    creatorId: currentMember?.id,
                    assigneeId: assigneeId || currentMember?.id
                })
            })
            if (res.ok) {
                await fetchRoutines()
                setShowForm(false)
                // Reset form
                setTitle('')
                setPoints(100)
                setType('EARN')
                setDurationMinutes('')
            }
        } catch (e) {
            console.error(e)
            alert('루틴 저장에 실패했어요.')
        } finally {
            setSaving(false)
        }
    }

    const handleAddRecommendation = async (rec: Recommendation) => {
        setSaving(true)
        try {
            const rawType = (rec.type || 'EARN').toUpperCase()
            const sanitizedType = rawType === 'HOURGLASS' ? 'HOURGLASS' : 'EARN'

            const reqBody = {
                title: rec.title || '새로운 루틴',
                type: sanitizedType,
                points: Number(rec.points) || 100,
                timeOfDay: rec.timeOfDay || '08:00',
                durationMinutes: sanitizedType === 'HOURGLASS' ? (Number(rec.durationMinutes) || 15) : undefined,
                daysOfWeek: Array.isArray(rec.daysOfWeek) ? rec.daysOfWeek.join(',') : (rec.daysOfWeek || 'Mon,Tue,Wed,Thu,Fri,Sat,Sun'),
                creatorId: currentMember?.id,
                assigneeId: currentMember?.id
            }

            const res = await fetch('/api/routines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reqBody)
            })
            if (res.ok) {
                alert('추천 루틴이 추가되었어요! 🌱')
                await fetchRoutines()
            } else {
                const err = await res.json()
                alert(`루틴 추가 실패: ${err.error}`)
            }
        } catch (e) {
            console.error(e)
            alert('루틴 추가 중 네트워크 에러가 발생했어요.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('이 루틴을 정말 삭제할까요?')) return
        try {
            const res = await fetch(`/api/routines/${id}`, { method: 'DELETE' })
            if (res.ok) {
                fetchRoutines()
            }
        } catch (e) {
            console.error(e)
        }
    }

    if (!currentMember) return null

    return (
        <div>
            <header className="header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
                    <ChevronLeft size={28} />
                </Link>
                <div className="logo" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={28} color="var(--color-primary)" />
                    <span>루틴 관리</span>
                </div>
            </header>

            {/* AI Recommendations Section */}
            <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(255, 235, 59, 0.1), rgba(255, 255, 255, 0.6))', border: '1px solid rgba(255, 213, 79, 0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.2rem', color: '#37474F', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={20} color="#FBC02D" />
                        제리의 루틴 추천 🐹✨
                    </h2>
                    <button
                        onClick={handleAskJerry}
                        disabled={loadingAI}
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.85rem', background: '#FBC02D', color: '#37474F' }}
                    >
                        {loadingAI ? <Loader2 size={16} className="spin" /> : '알려줘!'}
                    </button>
                </div>

                {recommendations.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {recommendations.map((rec, i) => (
                            <div key={i} style={{ background: 'white', padding: '1rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', position: 'relative' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#37474F', paddingRight: '40px' }}>{rec.title}</div>
                                <p style={{ fontSize: '0.9rem', color: '#78909C', margin: '6px 0', fontStyle: 'italic' }}>"{rec.comment}"</p>
                                <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: '#546E7A', marginTop: '8px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Coins size={14} color="#FBC02D" /> {rec.points}콩</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {rec.timeOfDay}</span>
                                    {rec.type === 'HOURGLASS' && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Timer size={14} color="var(--color-primary)" /> {rec.durationMinutes}분</span>}
                                </div>
                                <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#90A4AE' }}>
                                    반복: {rec.daysOfWeek.split(',').map(d => DAYS.find(x => x.id === d)?.label).join(', ')}
                                </div>
                                <button
                                    onClick={() => handleAddRecommendation(rec)}
                                    disabled={saving}
                                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--color-secondary)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                                >
                                    <Plus size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ fontSize: '0.9rem', color: '#78909C', textAlign: 'center', margin: '1rem 0' }}>
                        {loadingAI ? '제리가 고민 중이에요...' : '버튼을 눌러 나에게 딱 맞는 루틴을 추천받아보세요!'}
                    </p>
                )}
            </div>

            {/* My Routines List */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 8px' }}>
                <h2 style={{ fontSize: '1.3rem', color: '#37474F' }}>나의 루틴</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer' }}
                >
                    <Plus size={18} />
                    새 루틴 추가
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '2rem', border: '2px dashed var(--color-primary)', background: 'rgba(255,255,255,0.8)' }}>
                    <form onSubmit={handleSaveRoutine}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="label">루틴 이름</label>
                            <input type="text" className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="예: 아침 물 한잔 마시기" required />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label className="label">방식</label>
                                <select className="input" value={type} onChange={e => { setType(e.target.value as any); setDurationMinutes(''); }}>
                                    <option value="EARN">모으기 (즉시)</option>
                                    <option value="HOURGLASS">모래시계 (타이머)</option>
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label className="label">보상 콩</label>
                                <input type="number" className="input" value={points} onChange={e => setPoints(Number(e.target.value))} min="10" step="10" required />
                            </div>
                        </div>

                        {type === 'HOURGLASS' && (
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="label">진행 시간 (분)</label>
                                <input type="number" className="input" value={durationMinutes} onChange={e => setDurationMinutes(e.target.value)} placeholder="예: 15" min="1" required />
                            </div>
                        )}

                        <div style={{ marginBottom: '1rem' }}>
                            <label className="label">알림/예정 시간</label>
                            <input type="time" className="input" value={timeOfDay} onChange={e => setTimeOfDay(e.target.value)} required />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label className="label">누가 할까요?</label>
                            <select className="input" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                                {familyMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="label">반복할 요일</label>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between' }}>
                                {DAYS.map(day => (
                                    <button
                                        type="button"
                                        key={day.id}
                                        onClick={() => toggleDay(day.id)}
                                        style={{
                                            width: '36px', height: '36px', borderRadius: '50%',
                                            border: 'none', fontWeight: 'bold', fontSize: '0.9rem',
                                            cursor: 'pointer', transition: 'all 0.2s',
                                            background: selectedDays.includes(day.id) ? 'var(--color-primary)' : 'rgba(0,0,0,0.05)',
                                            color: selectedDays.includes(day.id) ? 'white' : '#78909C',
                                        }}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button type="button" onClick={() => setShowForm(false)} className="btn" style={{ flex: 1, background: '#E0E0E0', color: '#546E7A' }}>취소</button>
                            <button type="submit" disabled={saving || selectedDays.length === 0} className="btn btn-primary" style={{ flex: 2 }}>{saving ? '저장 중...' : '루틴 저장하기'}</button>
                        </div>
                    </form>
                </div>
            )}

            {loadingRoutines ? (
                <div style={{ textAlign: 'center', color: '#90A4AE', padding: '2rem' }}>불러오는 중...</div>
            ) : routines.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#90A4AE' }}>
                    <Calendar size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                    <p>아직 등록된 루틴이 없어요.<br />새로운 습관을 만들어볼까요?</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {routines.map(routine => (
                        <div key={routine.id} className="card" style={{ marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem' }}>
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#37474F', marginBottom: '4px' }}>
                                    {routine.title}
                                    <span style={{ fontSize: '0.8rem', background: '#ECEFF1', color: '#607D8B', padding: '2px 6px', borderRadius: '8px', marginLeft: '8px', fontWeight: 'normal' }}>
                                        {/* @ts-ignore */}
                                        {routine.assignee?.name}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: '#546E7A', marginTop: '6px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Coins size={14} color="#FBC02D" /> {routine.points}콩</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {routine.timeOfDay}</span>
                                    {routine.type === 'HOURGLASS' && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Timer size={14} color="var(--color-primary)" /> {routine.durationMinutes}분</span>}
                                </div>
                                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                                    {DAYS.map(d => (
                                        <span key={d.id} style={{ fontSize: '0.75rem', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: routine.daysOfWeek.includes(d.id) ? 'var(--color-secondary)' : '#ECEFF1', color: routine.daysOfWeek.includes(d.id) ? 'white' : '#B0BEC5' }}>
                                            {d.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <button onClick={() => handleDelete(routine.id)} style={{ background: 'none', border: 'none', color: '#EF5350', cursor: 'pointer', padding: '8px' }}>
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <style jsx global>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}
