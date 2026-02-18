'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Member = {
    id: string
    name: string
    role: string
    points: number
}

type MemberContextType = {
    currentMember: Member | null
    login: (member: Member) => void
    logout: () => void
    refreshMember: () => Promise<void>
}

const MemberContext = createContext<MemberContextType | undefined>(undefined)

export function MemberProvider({ children }: { children: ReactNode }) {
    const [currentMember, setCurrentMember] = useState<Member | null>(null)

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('miracle_po_member')
        if (saved) {
            try {
                setCurrentMember(JSON.parse(saved))
            } catch (e) {
                localStorage.removeItem('miracle_po_member')
            }
        }
    }, [])

    const login = (member: Member) => {
        setCurrentMember(member)
        localStorage.setItem('miracle_po_member', JSON.stringify(member))
    }

    const logout = () => {
        setCurrentMember(null)
        localStorage.removeItem('miracle_po_member')
    }

    const refreshMember = async () => {
        if (!currentMember) return
        try {
            const res = await fetch('/api/members')
            const members = await res.json()
            const updated = members.find((m: Member) => m.id === currentMember.id)
            if (updated) {
                setCurrentMember(updated)
                localStorage.setItem('miracle_po_member', JSON.stringify(updated))
            }
        } catch (e) {
            console.error('Failed to refresh member', e)
        }
    }

    return (
        <MemberContext.Provider value={{ currentMember, login, logout, refreshMember }}>
            {children}
        </MemberContext.Provider>
    )
}

export function useMember() {
    const context = useContext(MemberContext)
    if (context === undefined) {
        throw new Error('useMember must be used within a MemberProvider')
    }
    return context
}
