import { ArrowRight, CheckCircle2, Zap } from 'lucide-react'
import { INVITE_URL } from '@/lib/constants'

const points = [
  'Hébergement 24/7 en continu',
  'Installation sans configuration requise',
  'Compatible "User Installable Apps"',
]

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 h-[420px] bg-[radial-gradient(60%_100%_at_50%_0%,oklch(0.45_0.2_300/0.45),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:py-28">
        <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Le Bot Discord Ultime pour{' '}
          <span className="text-primary">Gérer</span>,{' '}
          <span className="text-primary/80">Protéger</span> &amp;{' '}
          <span className="text-accent">Animer</span> votre Serveur.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          Intelligence Artificielle conversationnelle, système de tickets multilingue, modération
          Guard renforcée, mini-jeux RPG et économie complète. Un seul bot pour tout faire.
        </p>

        <div className="mt-10 flex justify-center">
          <a
            href={INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 rounded-2xl bg-primary px-7 py-4 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition-colors hover:bg-primary/90"
          >
            <Zap className="size-5" aria-hidden="true" />
            Ajouter Komorebi à Discord
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </a>
        </div>

        <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
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
