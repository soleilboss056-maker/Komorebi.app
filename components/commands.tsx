'use client'

import { useMemo, useState } from 'react'
import { Reveal } from '@/components/reveal'
import { SplitText } from '@/components/split-text'

type Category =
  | 'general'
  | 'moderation'
  | 'economy'
  | 'casino'
  | 'games'
  | 'rpg'
  | 'levels'
  | 'tickets'
  | 'config'
  | 'social'

type Command = { name: string; category: Category; description: string }

const categoryMeta: Record<Category, { label: string; short: string; tone: string }> = {
  general: { label: 'Général & Profils', short: 'Général', tone: 'text-muted-foreground' },
  moderation: { label: 'Modération', short: 'Modération', tone: 'text-sakura' },
  economy: { label: 'Économie', short: 'Économie', tone: 'text-accent' },
  casino: { label: 'Casino & Paris', short: 'Casino', tone: 'text-sakura' },
  games: { label: 'Mini-jeux', short: 'Jeux', tone: 'text-primary' },
  rpg: { label: 'RPG & Quêtes', short: 'RPG', tone: 'text-primary' },
  levels: { label: 'XP & Niveaux', short: 'Niveaux', tone: 'text-accent' },
  tickets: { label: 'Tickets & Recrutement', short: 'Tickets', tone: 'text-accent' },
  config: { label: 'Configuration', short: 'Config', tone: 'text-muted-foreground' },
  social: { label: 'Annonces & Social', short: 'Annonces', tone: 'text-sakura' },
}

const commands: Command[] = [
  // Général & Profils
  {
    name: '/help',
    category: 'general',
    description: 'Affiche la liste complète et ordonnée de toutes les commandes du bot.',
  },
  {
    name: '/invite',
    category: 'general',
    description: "Récupère le lien d'invitation officiel du bot et du serveur de support.",
  },
  {
    name: '/avatar',
    category: 'general',
    description: "Affiche la photo de profil (avatar) d'un membre en haute définition.",
  },
  {
    name: '/banner',
    category: 'general',
    description: "Affiche la bannière d'un membre du serveur.",
  },
  {
    name: '/profile',
    category: 'general',
    description: "Affiche la carte d'identité et le profil complet d'un membre.",
  },
  {
    name: '/set-bio',
    category: 'general',
    description: 'Définissez votre bio sur votre mini-profil personnalisé.',
  },
  {
    name: '/user-info',
    category: 'general',
    description: "Affiche les informations détaillées d'un membre : rôles, arrivée, badges.",
  },
  {
    name: '/server-info',
    category: 'general',
    description: 'Affiche des informations détaillées et complètes sur le serveur.',
  },
  {
    name: '/status-bot',
    category: 'general',
    description: "Affiche l'état en direct du bot, le serveur de support et la latence.",
  },
  {
    name: '/timestamp',
    category: 'general',
    description: 'Génère des balises de temps Discord dynamiques prêtes à copier.',
  },
  {
    name: '/traduction',
    category: 'general',
    description: 'Traduire un message en temps réel (auto-suppression après lecture).',
  },
  {
    name: '/recherche-mots-clefs',
    category: 'general',
    description: 'Retrouve qui a mentionné un mot-clé ou un sujet récemment.',
  },
  {
    name: '/musique',
    category: 'general',
    description: "Lancer une musique, ajouter à la file d'attente et gérer la lecture.",
  },
  {
    name: '/vocal-limit',
    category: 'general',
    description: "Modifier la limite d'utilisateurs de votre salon vocal temporaire.",
  },
  {
    name: '/mute-salons',
    category: 'general',
    description: 'Masquer temporairement un salon sans quitter le serveur.',
  },

  // Modération
  {
    name: '/ban',
    category: 'moderation',
    description: 'Bannir définitivement un membre du serveur avec motif enregistré.',
  },
  {
    name: '/deban',
    category: 'moderation',
    description: 'Débannir un membre du serveur (Admin uniquement).',
  },
  {
    name: '/kick',
    category: 'moderation',
    description: 'Expulser temporairement un membre du serveur.',
  },
  {
    name: '/mute',
    category: 'moderation',
    description: 'Rendre muet temporairement un membre (Timeout).',
  },
  {
    name: '/demute',
    category: 'moderation',
    description: "Retirer le timeout d'un membre et lui redonner la parole.",
  },
  {
    name: '/warn',
    category: 'moderation',
    description: 'Donner un avertissement officiel à un membre (avec historique).',
  },
  {
    name: '/unwarn',
    category: 'moderation',
    description: 'Réinitialiser ou retirer les avertissements (warns) d’un membre.',
  },
  {
    name: '/clear',
    category: 'moderation',
    description: 'Supprimer en masse un nombre défini de messages dans un salon.',
  },
  {
    name: '/lock',
    category: 'moderation',
    description: 'Verrouille le salon actuel pour empêcher les membres d’écrire.',
  },
  {
    name: '/unlock',
    category: 'moderation',
    description: 'Déverrouille le salon actuel pour permettre aux membres d’écrire.',
  },
  {
    name: '/slowmode',
    category: 'moderation',
    description: 'Active ou modifie le mode lent (Slowmode) dans un salon.',
  },
  {
    name: '/guard-status',
    category: 'moderation',
    description: 'Affiche un état complet des modules actifs du système de protection.',
  },
  {
    name: '/role-give',
    category: 'moderation',
    description: 'Attribuer ou retirer un rôle à un membre instantanément.',
  },
  {
    name: '/role-temp',
    category: 'moderation',
    description: 'Assigner un rôle temporaire à un membre (Admin).',
  },

  // Économie
  {
    name: '/balance',
    category: 'economy',
    description: 'Affiche le solde en pièces d’un membre ou le vôtre.',
  },
  {
    name: '/daily',
    category: 'economy',
    description: 'Réclamer votre récompense quotidienne de pièces.',
  },
  {
    name: '/work',
    category: 'economy',
    description: 'Travaillez dur pour gagner des pièces honnêtement.',
  },
  {
    name: '/salaire',
    category: 'economy',
    description: 'Configurer ou réclamer le salaire récurrent associé à vos rôles.',
  },
  {
    name: '/deposit',
    category: 'economy',
    description: 'Dépose de l’argent de votre portefeuille vers votre banque.',
  },
  {
    name: '/withdraw',
    category: 'economy',
    description: 'Retire de l’argent de votre compte en banque vers votre portefeuille.',
  },
  {
    name: '/pay',
    category: 'economy',
    description: 'Donner une partie de vos pièces à un autre membre.',
  },
  {
    name: '/rob',
    category: 'economy',
    description: 'Tentez de détrousser le portefeuille d’un autre membre.',
  },
  {
    name: '/coins',
    category: 'economy',
    description: 'Gère le solde financier d’un membre (Admin uniquement).',
  },
  {
    name: '/leaderboard',
    category: 'economy',
    description: 'Affiche le classement général (Fortune ou XP).',
  },
  {
    name: '/shop-role add',
    category: 'economy',
    description: 'Ajoute un rôle à la boutique avec son prix et sa description.',
  },
  {
    name: '/shop-role delete',
    category: 'economy',
    description: 'Supprime un rôle de la boutique (Admin uniquement).',
  },
  {
    name: '/multiplier add',
    category: 'economy',
    description: 'Ajoute ou modifie un multiplicateur de gain pour un rôle.',
  },
  {
    name: '/multiplier role-remove',
    category: 'economy',
    description: 'Supprime le multiplicateur de gain d’un rôle.',
  },
  {
    name: '/multiplier user-add',
    category: 'economy',
    description: 'Attribue un multiplicateur personnel permanent ou temporaire.',
  },
  {
    name: '/multiplier user-remove',
    category: 'economy',
    description: 'Supprime le multiplicateur personnel d’un membre.',
  },

  // Casino & Paris
  {
    name: '/bet',
    category: 'casino',
    description: 'Parier vos pièces au jeu de pile ou face de casino.',
  },
  {
    name: '/blackjack',
    category: 'casino',
    description: 'Joue une partie de Blackjack palpitante contre le croupier.',
  },
  {
    name: '/casino-duel',
    category: 'casino',
    description: 'Propose un pari de duel de casino très risqué à un membre.',
  },
  {
    name: '/coinflip',
    category: 'casino',
    description: 'Lance une pièce de monnaie (Pile ou Face) pour doubler la mise.',
  },
  {
    name: '/dice',
    category: 'casino',
    description: 'Lance des dés contre le bot et parie des pièces !',
  },
  {
    name: '/roulette',
    category: 'casino',
    description: 'Parie tes pièces à la roulette du casino !',
  },
  {
    name: '/slots',
    category: 'casino',
    description: 'Tente ta chance à la machine à sous avec des bonus multiplicateurs.',
  },
  {
    name: '/race',
    category: 'casino',
    description: 'Participe à une course de chevaux virtuelle palpitante.',
  },
  {
    name: '/guess',
    category: 'casino',
    description: 'Devine un nombre secret entre 1 et 5 pour un gain multiplié.',
  },

  // Mini-jeux
  {
    name: '/morpion',
    category: 'games',
    description: 'Lance une partie interactive de Morpion contre un membre.',
  },
  {
    name: '/snake',
    category: 'games',
    description: 'Joue au jeu du Snake classique avec une grille interactive.',
  },
  {
    name: '/dino-runner',
    category: 'games',
    description: 'Saute les obstacles dans le mini-jeu du dinosaure et bats ton record.',
  },
  {
    name: '/chifoumi',
    category: 'games',
    description: 'Joue au Pierre-Feuille-Ciseaux (Chifoumi) contre le bot ou un membre.',
  },
  {
    name: '/trivia',
    category: 'games',
    description: 'Répondez à une question de culture générale et gagnez des pièces.',
  },
  {
    name: '/devinette',
    category: 'games',
    description: 'Résoudre une énigme amusante pour tenter de gagner une récompense.',
  },
  {
    name: '/lovecalc',
    category: 'games',
    description: 'Calcule la complicité et la compatibilité de couple entre deux membres.',
  },
  {
    name: '/hasard',
    category: 'games',
    description: 'Choisir un membre au hasard et lui attribuer une récompense.',
  },

  // RPG
  {
    name: '/fight',
    category: 'rpg',
    description: 'Lance un combat RPG stratégique pour gagner butin et expérience.',
  },
  {
    name: '/quest',
    category: 'rpg',
    description: 'Partez en quête et accomplissez des exploits héroïques.',
  },
  {
    name: '/rpg-shop',
    category: 'rpg',
    description: 'Ouvre l’armurerie sacrée pour acheter des classes et équipements.',
  },
  {
    name: '/rpg-stats',
    category: 'rpg',
    description: 'Affiche votre feuille de personnage RPG détaillée.',
  },

  // XP & Niveaux
  {
    name: '/rank',
    category: 'levels',
    description: 'Affiche votre carte de rang, votre XP et votre niveau actuel.',
  },
  {
    name: '/leveling-config',
    category: 'levels',
    description: 'Configure la progression d’XP et le système de récompenses de niveau.',
  },
  {
    name: '/set-level',
    category: 'levels',
    description: 'Modifier le niveau global d’un membre (Admin).',
  },
  {
    name: '/classement-config',
    category: 'levels',
    description: 'Configurer le salon du classement économie en temps réel.',
  },

  // Tickets & Recrutement
  {
    name: '/ticket',
    category: 'tickets',
    description: 'Ouvre le panneau de sélection de catégorie de ticket.',
  },
  {
    name: '/ticket-config',
    category: 'tickets',
    description: 'Configure les aspects techniques du système de tickets.',
  },
  {
    name: '/close',
    category: 'tickets',
    description: 'Ferme définitivement le ticket d’assistance actuel.',
  },
  {
    name: '/candidature panel',
    category: 'tickets',
    description: 'Ouvrir le panneau de recrutement pour que les membres postulent.',
  },
  {
    name: '/candidature setup',
    category: 'tickets',
    description: 'Personnaliser les questions du formulaire de candidature.',
  },

  // Configuration
  {
    name: '/config',
    category: 'config',
    description: 'Panneau central de configuration de tous les modules du bot.',
  },
  {
    name: '/autorole',
    category: 'config',
    description: 'Attribue automatiquement un ou plusieurs rôles à l’arrivée.',
  },
  {
    name: '/rolesmenu',
    category: 'config',
    description: 'Créer un menu interactif de sélection de rôles.',
  },
  {
    name: '/reglement',
    category: 'config',
    description: 'Publier le règlement interactif du serveur avec validation.',
  },
  {
    name: '/boost-config',
    category: 'config',
    description: 'Configure les messages et récompenses dédiés aux boosters.',
  },
  {
    name: '/anniversaire-config',
    category: 'config',
    description: 'Configure le salon et active/désactive les anniversaires.',
  },
  {
    name: '/anniversaire-set',
    category: 'config',
    description: 'Enregistre votre date d’anniversaire pour être souhaité.',
  },
  {
    name: '/setup-counting',
    category: 'config',
    description: 'Définir et installer le salon de comptage interactif.',
  },
  {
    name: '/vocal-temporaire',
    category: 'config',
    description: 'Configurez le système de salons vocaux temporaires.',
  },

  // Annonces & Social
  {
    name: '/annonce',
    category: 'social',
    description: 'Créer une annonce stylisée avec options d’embed et de mention.',
  },
  {
    name: '/annonce-attente',
    category: 'social',
    description: 'Consulter et gérer l’historique des annonces programmées.',
  },
  {
    name: '/annonce-programme',
    category: 'social',
    description: 'Planifier une annonce à publier automatiquement plus tard.',
  },
  {
    name: '/giveaway',
    category: 'social',
    description: 'Lancer un concours de giveaway de pièces ou de rôles.',
  },
  {
    name: '/claim',
    category: 'social',
    description: 'Réclamer un cadeau actif pour toucher instantanément la récompense.',
  },
  {
    name: '/giftcard add',
    category: 'social',
    description: 'Génère un nouveau code cadeau utilisable par les membres.',
  },
  {
    name: '/giftcard delete',
    category: 'social',
    description: 'Supprime un code cadeau existant du système.',
  },
  {
    name: '/social list',
    category: 'social',
    description: 'Affiche la liste de tous les flux réseaux sociaux configurés.',
  },
  {
    name: '/social delete',
    category: 'social',
    description: 'Supprime un flux automatique de notification existant.',
  },
  {
    name: '/social test',
    category: 'social',
    description: 'Envoie une notification de test pour vérifier un flux social.',
  },
]

const filters: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'Toutes' },
  ...(Object.keys(categoryMeta) as Category[]).map((id) => ({
    id,
    label: categoryMeta[id].label,
  })),
]

const PAGE_SIZE = 24

export function Commands() {
  const [active, setActive] = useState<Category | 'all'>('all')
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState(PAGE_SIZE)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return commands.filter((c) => {
      const matchCategory = active === 'all' || c.category === active
      const matchQuery =
        q.length === 0 ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      return matchCategory && matchQuery
    })
  }, [active, query])

  const shown = visible.slice(0, limit)

  const counts = useMemo(() => {
    const map = new Map<Category | 'all', number>([['all', commands.length]])
    for (const c of commands) map.set(c.category, (map.get(c.category) ?? 0) + 1)
    return map
  }, [])

  return (
    <section
      id="commandes"
      data-mascot-zone="party"
      data-mascot-key="commands"
      className="relative border-b border-border/60 bg-card/20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(50%_100%_at_50%_0%,oklch(0.55_0.2_350/0.14),transparent_70%)]"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Catalogue des commandes
          </p>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-shimmer">{commands.length} commandes</span>{' '}
            <SplitText text="Slash prêtes à l’emploi" step={18} start={120} />
          </h2>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
            Modération, économie, casino, RPG, niveaux, tickets et bien plus — avec autocomplétion
            intelligente directement sur Discord.
          </p>
        </Reveal>

        <Reveal delay={100} className="mx-auto mt-8 max-w-md">
          <label htmlFor="command-search" className="sr-only">
            Rechercher une commande
          </label>
          <div className="relative">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              id="command-search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setLimit(PAGE_SIZE)
              }}
              placeholder="Rechercher : ban, daily, blackjack…"
              className="w-full rounded-full border border-border/70 bg-card/80 py-2.5 pl-10 pr-4 font-mono text-xs text-foreground shadow-inner shadow-background/40 outline-none transition-all duration-300 placeholder:font-sans placeholder:text-muted-foreground focus:border-primary/60 focus:ring-2 focus:ring-primary/25"
            />
          </div>
        </Reveal>

        <div
          role="tablist"
          aria-label="Filtrer les commandes"
          className="mt-6 flex flex-wrap justify-center gap-2"
        >
          {filters.map((filter, index) => (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={active === filter.id}
              onClick={() => {
                setActive(filter.id)
                setLimit(PAGE_SIZE)
              }}
              style={{ animationDelay: `${index * 45}ms`, animationFillMode: 'both' }}
              className={
                active === filter.id
                  ? 'flex animate-pop-in items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition-all duration-300 hover:-translate-y-0.5'
                  : 'flex animate-pop-in items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-2 text-xs font-medium text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground active:scale-95'
              }
            >
              {filter.label}
              <span
                className={
                  active === filter.id
                    ? 'rounded-full bg-primary-foreground/20 px-1.5 py-0.5 font-mono text-[9px] text-primary-foreground'
                    : 'rounded-full bg-secondary px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground'
                }
              >
                {counts.get(filter.id) ?? 0}
              </span>
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <p className="mt-14 text-center text-sm text-muted-foreground">
            Aucune commande ne correspond à «&nbsp;{query}&nbsp;».
          </p>
        ) : (
          <ul className="paint-lazy mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((command, index) => (
              <li
                key={command.name}
                style={{
                  animationDelay: `${Math.min(index * 35, 420)}ms`,
                  animationFillMode: 'both',
                }}
                className="spotlight glow-border group relative animate-swing-in overflow-hidden rounded-xl border border-border/70 bg-card p-5 transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/15"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-px scale-x-0 bg-[linear-gradient(90deg,transparent,oklch(0.73_0.2_350),transparent)] transition-transform duration-500 group-hover:scale-x-100"
                />
                <div className="relative flex items-start justify-between gap-3">
                  <code className="rounded-md bg-secondary px-2 py-1 font-mono text-xs text-foreground transition-all duration-300 group-hover:bg-primary/20 group-hover:text-primary group-hover:shadow-md group-hover:shadow-primary/20">
                    {command.name}
                  </code>
                  <span
                    className={`mt-1 shrink-0 text-[9px] font-bold uppercase tracking-widest transition-all duration-300 group-hover:tracking-[0.14em] ${categoryMeta[command.category].tone}`}
                  >
                    {categoryMeta[command.category].short}
                  </span>
                </div>
                <p className="relative mt-4 text-sm leading-relaxed text-muted-foreground">
                  {command.description}
                </p>
              </li>
            ))}
          </ul>
        )}

        {shown.length < visible.length && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setLimit((value) => value + PAGE_SIZE)}
              className="group relative overflow-hidden rounded-full border border-primary/40 bg-primary/10 px-6 py-2.5 text-xs font-semibold text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/70 hover:bg-primary/20 hover:shadow-lg hover:shadow-primary/25 active:scale-95"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent,oklch(1_0_0/0.25),transparent)] transition-transform duration-700 group-hover:translate-x-full"
              />
              <span className="relative">
                Afficher plus ({visible.length - shown.length} restantes)
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
