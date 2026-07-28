import { CommandMarquee } from '@/components/command-marquee'
import { Commands } from '@/components/commands'
import { CtaFooter } from '@/components/cta-footer'
import { Features } from '@/components/features'
import { FunLayer } from '@/components/fun/fun-layer'
import { FunProvider } from '@/components/fun/fun-context'
import { Hero } from '@/components/hero'
import { PageMotion } from '@/components/page-motion'
import { SecretNews } from '@/components/secret-news'
import { SiteHeader } from '@/components/site-header'
import { Stats } from '@/components/stats'

export default function Page() {
  return (
    <FunProvider>
      <div className="min-h-screen bg-background font-sans">
        <PageMotion />
        <SiteHeader />
        <main>
          <Hero />
          <CommandMarquee />
          <Stats />
          <Features />
          <Commands />
          <SecretNews />
          <CtaFooter />
        </main>
        <FunLayer />
      </div>
    </FunProvider>
  )
}
