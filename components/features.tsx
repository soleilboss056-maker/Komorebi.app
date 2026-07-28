import { Coins, Gamepad2, Languages, ShieldCheck, Ticket } from 'lucide-react'

const features = [
  {
    icon: ShieldCheck,
    title: 'Guard & Protection Anti-Raid',
    description:
      "Bloque le spam, les liens malveillants, la pub non autorisée et les raids automatiques. Captcha interactif et sanctions graduelles instantanées.",
    tone: 'accent',
  },
  {
    icon: Ticket,
    title: 'Système de Tickets Avancé',
    description:
      'Création de salons de support en un clic avec menus déroulants interactifs (Support, Candidatures, Partenariats) et transcription automatique.',
    tone: 'primary',
  },
  {
    icon: Languages,
    title: 'Traduction Multilingue',
    description:
      "Réagissez simplement avec un emoji drapeau sur n'importe quel message pour recevoir sa traduction privée immédiate.",
    tone: 'primary',
  },
  {
    icon: Coins,
    title: 'Économie & ZenEggs Boutique',
    description:
      "Système monétaire complet avec travail, bonus quotidiens, braquages, cartes cadeaux, salaires par rôle et boutique d'œufs mystères.",
    tone: 'accent',
  },
  {
    icon: Gamepad2,
    title: 'Mini-Jeux & RPG Tactique',
    description:
      'Jouez directement dans Discord : Morpion, Pendu, Combats de monstres RPG, Casino (Poker, Roulette, Machine à sous) et Dino.',
    tone: 'primary',
  },
]

export function Features() {
  return (
    <section id="fonctionnalites" className="border-b border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Fonctionnalités avancées
          </p>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Tout ce dont votre communauté a besoin dans un seul Bot
          </h2>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground">
            Chaque module est conçu pour offrir une réactivité maximale et une expérience
            utilisateur parfaite.
          </p>
        </div>

        <ul className="mt-14 grid gap-6 md:grid-cols-2">
          {features.map(({ icon: Icon, title, description, tone }) => (
            <li
              key={title}
              className="rounded-2xl border border-border/70 bg-card p-6 transition-colors hover:border-primary/40"
            >
              <div
                className={
                  tone === 'accent'
                    ? 'mb-5 inline-flex size-10 items-center justify-center rounded-xl bg-accent/15 text-accent'
                    : 'mb-5 inline-flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary'
                }
              >
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
