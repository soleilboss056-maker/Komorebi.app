import { Commands } from '@/components/commands'
import { CtaFooter } from '@/components/cta-footer'
import { Features } from '@/components/features'
import { Hero } from '@/components/hero'
import { SiteHeader } from '@/components/site-header'
import { Stats } from '@/components/stats'

export default function Page() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <SiteHeader />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Commands />
        <CtaFooter />
      </main>
    </div>
  )
}
