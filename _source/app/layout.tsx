import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Noto_Sans_SC, Oswald } from 'next/font/google'
import './globals.css'

const notoSans = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-noto-sans',
  display: 'swap',
})

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '搅拌站报价助手 - 智能商砼报价小程序',
  description:
    '面向经销商、代理与供应商的搅拌站智能报价助手，实时查看附近搅拌站位置与本周、本月最新报价。',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#1b1917',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className={`${notoSans.variable} ${oswald.variable} bg-ink`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
