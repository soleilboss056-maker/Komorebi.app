import { CommandMarquee } from '@/components/command-marquee'
import { Commands } from '@/components/commands'
import { CtaFooter } from '@/components/cta-footer'
import { Features } from '@/components/features'
import { Hero } from '@/components/hero'
import { PageMotion } from '@/components/page-motion'
import { SiteHeader } from '@/components/site-header'
import { Stats } from '@/components/stats'

export default function Page() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <PageMotion />
      <SiteHeader />
      <main>
        <Hero />
        <CommandMarquee />
        <Stats />
        <Features />
        <Commands />
        <CtaFooter />
      </main>
    </div>
  )
}
