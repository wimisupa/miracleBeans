'use client'

import { MemberProvider, useMember } from "@/context/MemberContext"
import LoginScreen from "@/components/LoginScreen"
import { ReactNode } from "react"
import { usePathname } from "next/navigation"

function MemberGuard({ children }: { children: ReactNode }) {
    const { currentMember } = useMember()
    const pathname = usePathname()

    // Public routes that do not require authentication
    const isPublicRoute =
        pathname === '/' ||
        pathname === '/register' ||
        pathname === '/family/new' ||
        pathname.match(/^\/family\/[^\/]+$/); // matches /family/[id] but not /family/[id]/dashboard

    if (isPublicRoute) {
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
