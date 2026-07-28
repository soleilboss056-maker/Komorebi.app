import { Bot, Rocket } from 'lucide-react'
import { INVITE_URL } from '@/lib/constants'

export function CtaFooter() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-primary/25 bg-[linear-gradient(100deg,oklch(0.28_0.12_300),oklch(0.24_0.06_240))] p-8 md:flex-row md:items-center">
          <div>
            <h2 className="text-balance text-xl font-bold sm:text-2xl">
              Prêt à transformer votre serveur Discord ?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ajoutez Komorebi en quelques secondes sans aucun frais.
            </p>
          </div>
          <a
            href={INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-card px-6 py-3 text-sm font-semibold text-card-foreground transition-colors hover:bg-card/80"
          >
            Inviter Komorebi Maintenant
            <Rocket className="size-4 text-primary" aria-hidden="true" />
          </a>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-primary" aria-hidden="true" />
            <span>Komorebi Bot © 2026</span>
          </div>
          <a
            href={INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            Inviter le Bot
          </a>
        </div>
      </footer>
    </>
  )
}
