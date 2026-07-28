import { Coins, Gamepad2, Languages, ShieldCheck, Ticket } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { SplitText } from '@/components/split-text'

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
    tone: 'sakura',
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
    tone: 'sakura',
  },
]

const toneClasses: Record<string, string> = {
  accent: 'bg-accent/15 text-accent',
  primary: 'bg-primary/15 text-primary',
  sakura: 'bg-[oklch(0.73_0.2_350/0.15)] text-[oklch(0.78_0.17_350)]',
}

export function Features() {
  return (
    <section id="fonctionnalites" className="relative border-b border-border/60">
      <div
        aria-hidden="true"
        className="hue-drift pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(50%_100%_at_50%_0%,oklch(0.5_0.2_302/0.14),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Fonctionnalités avancées
          </p>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            <SplitText text="Tout ce dont votre communauté a besoin dans un seul Bot" step={16} />
          </h2>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground">
            Chaque module est conçu pour offrir une réactivité maximale et une expérience
            utilisateur parfaite.
          </p>
        </Reveal>

        <ul className="mt-14 grid gap-6 md:grid-cols-2">
          {features.map(({ icon: Icon, title, description, tone }, index) => (
            <Reveal
              as="li"
              key={title}
              delay={index * 90}
              variant={index % 2 === 0 ? 'left' : 'right'}
            >
              <div className="spotlight glow-border tilt-3d group relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card p-6 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/15">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                />
                <div
                  className={`relative mb-5 inline-flex size-11 items-center justify-center rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg ${toneClasses[tone]}`}
                >
                  <Icon
                    className="size-5 transition-transform duration-500 group-hover:animate-wiggle"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="relative text-lg font-semibold transition-colors duration-300 group-hover:text-primary">
                  {title}
                </h3>
                <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
