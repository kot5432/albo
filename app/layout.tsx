import '../styles/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Alba - 思いを挑戦に変える',
  description: '小さな一歩から始める挑戦管理アプリ - 思いを挑戦に変える',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen antialiased">
        <div className="min-h-screen bg-gray-900 text-white">
          {children}
        </div>
      </body>
    </html>
  )
}