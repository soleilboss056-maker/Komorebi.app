'use client'

import { useState } from 'react'

type Category = 'general' | 'fun' | 'economy' | 'leveling' | 'tickets'

const filters: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'Toutes les commandes' },
  { id: 'general', label: 'Général & Infos' },
  { id: 'fun', label: 'Divertissement & RPG' },
  { id: 'economy', label: 'Économie' },
  { id: 'leveling', label: 'XP & Niveaux' },
  { id: 'tickets', label: 'Tickets' },
]

const commands: { name: string; category: Category; description: string }[] = [
  {
    name: '/help',
    category: 'general',
    description: "Affiche le menu d'aide complet avec toutes les commandes disponibles.",
  },
  {
    name: '/ping',
    category: 'general',
    description: 'Vérifie la latence de la passerelle Discord et du serveur Komorebi.',
  },
  {
    name: '/profile',
    category: 'general',
    description: 'Consultez votre carte de profil, niveau XP, solde bancaire et statistiques.',
  },
  {
    name: '/ticket',
    category: 'tickets',
    description: "Ouvre un ticket d'assistance technique privé avec le support.",
  },
  {
    name: '/morpion',
    category: 'fun',
    description: 'Lancez une partie interactive de Morpion (Tic-Tac-Toe) avec un ami.',
  },
  {
    name: '/pendu',
    category: 'fun',
    description: 'Devinez le mot mystère avant d’épuiser vos essais.',
  },
  {
    name: '/combattre',
    category: 'fun',
    description: 'Affrontez un monstre ou un joueur dans un duel RPG au tour par tour.',
  },
  {
    name: '/rpg-profil',
    category: 'fun',
    description: 'Consultez vos statistiques de héros (PV, Attaque, Défense, Arme, Équipement).',
  },
  {
    name: '/work',
    category: 'economy',
    description: "Gagnez votre salaire quotidien en pièces d'or.",
  },
  {
    name: '/daily',
    category: 'economy',
    description: 'Réclamez votre récompense journalière gratuite.',
  },
  {
    name: '/balance',
    category: 'economy',
    description: 'Consultez le montant de votre portefeuille et de votre compte bancaire.',
  },
  {
    name: '/pay',
    category: 'economy',
    description: "Transférez des pièces d'or à un autre membre du serveur.",
  },
  {
    name: '/rank',
    category: 'leveling',
    description: "Affiche votre rang d'expérience (XP) et votre niveau actuel.",
  },
  {
    name: '/leaderboard',
    category: 'leveling',
    description: 'Consultez le classement des membres les plus actifs du serveur.',
  },
]

const badges: Record<Category, string> = {
  general: 'General',
  fun: 'Fun',
  economy: 'Economy',
  leveling: 'Leveling',
  tickets: 'Tickets',
}

export function Commands() {
  const [active, setActive] = useState<Category | 'all'>('all')
  const visible = active === 'all' ? commands : commands.filter((c) => c.category === active)

  return (
    <section id="commandes" className="border-b border-border/60 bg-card/20">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Catalogue des commandes
          </p>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Des dizaines de commandes Slash interactives
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Prêtes à l’emploi avec autocomplétion intelligente sur Discord.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Filtrer les commandes"
          className="mt-10 flex flex-wrap justify-center gap-2"
        >
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={active === filter.id}
              onClick={() => setActive(filter.id)}
              className={
                active === filter.id
                  ? 'rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground'
                  : 'rounded-full border border-border/70 bg-card px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground'
              }
            >
              {filter.label}
            </button>
          ))}
        </div>

        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {visible.map((command) => (
            <li
              key={command.name}
              className="rounded-xl border border-border/70 bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-4">
                <code className="rounded-md bg-secondary px-2 py-1 font-mono text-xs text-foreground">
                  {command.name}
                </code>
                <span className="mt-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                  {badges[command.category]}
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {command.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
