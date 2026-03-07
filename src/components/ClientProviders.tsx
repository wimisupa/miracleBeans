'use client'

import { SessionProvider } from "next-auth/react"
import { MemberProvider, useMember } from "@/context/MemberContext"
import { ReactNode, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

function MemberGuard({ children }: { children: ReactNode }) {
    const { currentMember, isLoaded } = useMember()
    const pathname = usePathname()

    // Public routes that do not require authentication
    const isPublicRoute =
        pathname === '/' ||
        pathname === '/register' ||
        pathname === '/family/new' ||
        pathname === '/members/manage' ||
        pathname === '/motion-test' ||
        pathname.match(/^\/family\/[^\/]+$/); // matches /family/[id] and /family/manage

    const router = useRouter()

    useEffect(() => {
        if (isLoaded && !isPublicRoute && !currentMember) {
            router.push('/')
        }
    }, [isLoaded, isPublicRoute, currentMember, router])

    if (!isLoaded) {
        return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#90A4AE' }}>확인 중...</div>
    }

    if (isPublicRoute) {
        return <>{children}</>
    }

    // If not logged in and loaded, return null while redirecting
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
