import { Bot, Zap } from 'lucide-react'
import { INVITE_URL } from '@/lib/constants'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
            <Bot className="size-5" aria-hidden="true" />
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-accent ring-2 ring-background" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Komorebi Bot</span>
              <span className="rounded-md bg-primary/15 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-primary">
                v3.0 Officiel
              </span>
            </div>
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              Bot Discord Intelligent avec IA &amp; Protection
            </p>
          </div>
        </div>

        <nav aria-label="Navigation principale" className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex">
          <a className="transition-colors hover:text-foreground" href="#fonctionnalites">
            Fonctionnalités
          </a>
          <a className="transition-colors hover:text-foreground" href="#commandes">
            Commandes
          </a>
          <a className="transition-colors hover:text-foreground" href="#statistiques">
            Statistiques
          </a>
        </nav>

        <a
          href={INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
        >
          <Zap className="size-4" aria-hidden="true" />
          Inviter le Bot
        </a>
      </div>
    </header>
  )
}
