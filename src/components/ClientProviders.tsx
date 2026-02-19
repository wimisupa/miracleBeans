'use client'

import { MemberProvider, useMember } from "@/context/MemberContext"
import LoginScreen from "@/components/LoginScreen"
import GlobalHeader from "@/components/GlobalHeader"
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
            <GlobalHeader />
            <MemberGuard>
                {children}
            </MemberGuard>
        </MemberProvider>
    )
}
