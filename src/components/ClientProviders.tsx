'use client'

import { MemberProvider, useMember } from "@/context/MemberContext"
import LoginScreen from "@/components/LoginScreen"
import { ReactNode } from "react"

function MemberGuard({ children }: { children: ReactNode }) {
    const { currentMember } = useMember()

    // If not logged in, show login screen
    if (!currentMember) {
        return <LoginScreen />
    }

    return <>{children}</>
}

export default function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <MemberProvider>
            <MemberGuard>
                {children}
            </MemberGuard>
        </MemberProvider>
    )
}
