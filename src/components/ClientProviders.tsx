'use client'

import { SessionProvider } from "next-auth/react"
import { MemberProvider, useMember } from "@/context/MemberContext"
import { ReactNode, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

function MemberGuard({ children }: { children: ReactNode }) {
    const { currentMember } = useMember()
    const pathname = usePathname()

    // Public routes that do not require authentication
    const isPublicRoute =
        pathname === '/' ||
        pathname === '/register' ||
        pathname === '/family/new' ||
        pathname.match(/^\/family\/[^\/]+$/); // matches /family/[id] but not /family/[id]/dashboard

    const router = useRouter()

    useEffect(() => {
        if (!isPublicRoute && !currentMember) {
            router.push('/')
        }
    }, [isPublicRoute, currentMember, router])

    if (isPublicRoute) {
        return <>{children}</>
    }

    // If not logged in, return null while redirecting
    if (!currentMember) {
        return null
    }

    return <>{children}</>
}

export default function ClientProviders({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <MemberProvider>
                <MemberGuard>
                    {children}
                </MemberGuard>
            </MemberProvider>
        </SessionProvider>
    )
}
