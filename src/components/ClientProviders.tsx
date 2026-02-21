'use client'

import { MemberProvider, useMember } from "@/context/MemberContext"
import LoginScreen from "@/components/LoginScreen"
import { ReactNode } from "react"
import { usePathname } from "next/navigation"

function MemberGuard({ children }: { children: ReactNode }) {
    const { currentMember } = useMember()
    const pathname = usePathname()

    // Always allow access to the registration page, even if logged out
    if (pathname === '/register') {
        return <>{children}</>
    }

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
