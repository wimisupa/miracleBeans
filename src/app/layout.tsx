import type { Metadata } from 'next'
import { Inter, Fredoka, Outfit } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const fredoka = Fredoka({ subsets: ['latin'], variable: '--font-fredoka' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export const metadata: Metadata = {
  title: '오마이콩 (Oh my cong)',
  description: '우리 가족 포인트 관리 앱 - 모두 함께 행복한 오마이콩!',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '오마이콩',
  }
}

import ClientProviders from '@/components/ClientProviders'

// ... (imports)

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} ${fredoka.variable} ${outfit.variable}`}>
        <ClientProviders>
          <div className="container">
            {children}
          </div>
        </ClientProviders>
      </body>
    </html>
  )
}
