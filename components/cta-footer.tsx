import Image from 'next/image'
import { Rocket } from 'lucide-react'
import { INVITE_URL } from '@/lib/constants'
import { Reveal } from '@/components/reveal'

export function CtaFooter() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal variant="zoom">
          <div className="spotlight scroll-zoom group relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl border border-primary/25 bg-[linear-gradient(100deg,oklch(0.3_0.14_302),oklch(0.26_0.1_340)_40%,oklch(0.24_0.07_210)_70%,oklch(0.3_0.14_302))] bg-[length:220%_100%] p-8 animate-gradient-pan md:flex-row md:items-center">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-[oklch(0.73_0.2_350/0.25)] blur-3xl animate-glow"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-[linear-gradient(100deg,transparent,oklch(1_0_0/0.12),transparent)] animate-sheen"
            />
            <div className="relative flex items-center gap-5">
              <Image
                src="/komorebi-avatar.png"
                alt=""
                width={160}
                height={160}
                className="hidden size-16 shrink-0 rounded-full ring-2 ring-primary/40 animate-float sm:block"
              />
              <div>
                <h2 className="text-balance text-xl font-bold sm:text-2xl">
                  Prêt à transformer votre serveur Discord ?
                </h2>
                <p className="mt-2 text-sm text-[oklch(0.85_0.03_300)]">
                  Ajoutez Komorebi en quelques secondes sans aucun frais.
                </p>
              </div>
            </div>
            <a
              href={INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="magnetic group relative inline-flex shrink-0 items-center gap-2 rounded-xl bg-card px-6 py-3 text-sm font-semibold text-card-foreground shadow-lg transition-shadow duration-300 hover:shadow-xl"
            >
              Inviter Komorebi Maintenant
              <Rocket
                className="size-4 text-primary transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src="/komorebi-avatar.png"
              alt=""
              width={48}
              height={48}
              className="size-6 rounded-full ring-1 ring-primary/40"
            />
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
