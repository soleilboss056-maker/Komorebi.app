import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const _inter = Inter({ subsets: ['latin'] })
const _mono = JetBrains_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Komorebi Bot — Le Bot Discord Ultime pour votre Serveur',
  description:
    'Intelligence Artificielle conversationnelle, tickets multilingues, modération Guard renforcée, mini-jeux RPG et économie complète. Un seul bot pour tout faire.',
  generator: 'v0.app',
  icons: {
    icon: '/komorebi-avatar.png',
    apple: '/komorebi-avatar.png',
  },
  openGraph: {
    title: 'Komorebi Bot — Le Bot Discord Ultime',
    description:
      'IA conversationnelle, tickets multilingues, Guard anti-raid, mini-jeux RPG et économie complète.',
    images: ['/komorebi-avatar.png'],
    type: 'website',
    locale: 'fr_FR',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#12101a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className="dark bg-background">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
