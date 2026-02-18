import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '위미콩 (Wimi Bean)',
  description: '우리 가족 포인트 관리 앱 - 모두 함께 행복한 위미!',
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
      <body className={inter.className}>
        <ClientProviders>
          <div className="container">
            {children}
          </div>
        </ClientProviders>
      </body>
    </html>
  )
}
