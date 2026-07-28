import Image from 'next/image'
import { ArrowRight, CheckCircle2, Sparkles, Zap } from 'lucide-react'
import { INVITE_URL } from '@/lib/constants'
import { Petals } from '@/components/petals'

const points = [
  'Hébergement 24/7 en continu',
  'Installation sans configuration requise',
  'Compatible "User Installable Apps"',
]

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-border/60">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 h-[520px] bg-[radial-gradient(60%_100%_at_50%_0%,oklch(0.45_0.22_302/0.5),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-40 size-72 rounded-full bg-[oklch(0.55_0.22_350/0.18)] blur-3xl animate-glow"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-64 size-72 rounded-full bg-[oklch(0.6_0.14_190/0.14)] blur-3xl animate-glow [animation-delay:2s]"
      />
      <Petals />

      <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
        <div className="flex justify-center animate-fade-up">
          <div className="relative animate-float">
            <span
              aria-hidden="true"
              className="absolute -inset-6 rounded-full bg-[conic-gradient(from_0deg,oklch(0.61_0.25_302),oklch(0.73_0.2_350),oklch(0.8_0.13_185),oklch(0.61_0.25_302))] opacity-30 blur-xl animate-orbit"
            />
            <Image
              src="/komorebi-avatar.png"
              alt="Avatar de Komorebi : robot sous des cerisiers en fleurs la nuit"
              width={512}
              height={512}
              priority
              className="relative size-28 rounded-full ring-2 ring-primary/40 shadow-2xl shadow-primary/30 sm:size-36"
            />
          </div>
        </div>

        <div
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary animate-fade-up [animation-delay:100ms]"
          style={{ animationFillMode: 'both' }}
        >
          <Sparkles className="size-3.5" aria-hidden="true" />
          Propulsé par l&apos;Intelligence Artificielle
        </div>

        <h1
          className="mt-6 text-balance text-4xl font-extrabold leading-tight tracking-tight animate-fade-up [animation-delay:200ms] sm:text-5xl md:text-6xl"
          style={{ animationFillMode: 'both' }}
        >
          Le Bot Discord Ultime pour{' '}
          <span className="text-shimmer">Gérer, Protéger &amp; Animer</span> votre Serveur.
        </h1>

        <p
          className="mx-auto mt-6 max-w-2xl text-pretty leading-relaxed text-muted-foreground animate-fade-up [animation-delay:300ms]"
          style={{ animationFillMode: 'both' }}
        >
          Intelligence Artificielle conversationnelle, système de tickets multilingue, modération
          Guard renforcée, mini-jeux RPG et économie complète. Un seul bot pour tout faire.
        </p>

        <div
          className="mt-10 flex flex-col items-center justify-center gap-4 animate-fade-up [animation-delay:400ms] sm:flex-row"
          style={{ animationFillMode: 'both' }}
        >
          <a
            href={INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary/50 active:scale-95 sm:w-auto"
          >
            <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent,oklch(1_0_0/0.4),transparent)] transition-transform duration-700 group-hover:translate-x-full" />
            <Zap className="relative size-5" aria-hidden="true" />
            <span className="relative">Ajouter Komorebi à Discord</span>
            <ArrowRight
              className="relative size-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </a>
          <a
            href="#fonctionnalites"
            className="inline-flex w-full items-center justify-center rounded-2xl border border-border bg-card/60 px-7 py-4 text-base font-medium text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:text-foreground sm:w-auto"
          >
            Voir les fonctionnalités
          </a>
        </div>

        <ul
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground animate-fade-up [animation-delay:500ms]"
          style={{ animationFillMode: 'both' }}
        >
          {points.map((point) => (
            <li key={point} className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-accent" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
