/**
 * Mission board driving Komo's XP and levels.
 *
 * Everything here is static, hand-authored content. Mission progress lives in
 * the client (see `fun-context`), except for the two Discord missions whose
 * truth comes from the signed server session — a visitor cannot fake
 * "j'ai ajouté le bot" because the guild is reported by Discord itself during
 * the OAuth token exchange.
 */

export const MISSION_IDS = [
  'install',
  'connect',
  'move',
  'chat',
  'buttons',
  'secrets',
  'explore',
] as const

export type MissionId = (typeof MISSION_IDS)[number]

export type Mission = {
  id: MissionId
  title: string
  description: string
  xp: number
  /** How many units are needed. 1 = simple boolean mission. */
  goal: number
  /** Rendered next to the mission. */
  icon: 'rocket' | 'link' | 'move' | 'chat' | 'pointer' | 'key' | 'compass'
  /** Server-verified missions cannot be completed client-side. */
  verified?: boolean
  /** Short line Komo says when the mission is completed. */
  done: string
}

export const MISSIONS: readonly Mission[] = [
  {
    id: 'install',
    title: 'Ajouter Komorebi à un serveur',
    description:
      'La mission principale. Choisis un serveur dont tu es admin : Discord me confirme l’installation et le compteur monte.',
    xp: 200,
    goal: 1,
    icon: 'rocket',
    verified: true,
    done: 'Installation confirmée par Discord ! Je prends mes quartiers, tu peux compter sur moi.',
  },
  {
    id: 'connect',
    title: 'Connecter ton compte Discord',
    description:
      'Je lis seulement ton pseudo et ton avatar (scopes identify + guilds). Aucun jeton n’est conservé.',
    xp: 120,
    goal: 1,
    icon: 'link',
    verified: true,
    done: 'Compte Discord relié. Je sais enfin comment t’appeler, c’est plus sympa.',
  },
  {
    id: 'move',
    title: 'Me déplacer à la souris',
    description:
      'Attrape-moi et pose-moi où tu veux à l’écran. Coin haut droit, milieu, sous un bouton : je m’adapte.',
    xp: 90,
    goal: 1,
    icon: 'move',
    done: 'Nouveau poste de garde adopté. Je me souviendrai de cet endroit.',
  },
  {
    id: 'chat',
    title: 'Me faire parler 12 fois',
    description: 'Clique sur moi, survole les cartes, appuie sur les boutons. J’ai un avis sur tout.',
    xp: 110,
    goal: 12,
    icon: 'chat',
    done: 'Douze répliques. J’ai la gorge en aluminium chaud, mais j’adore ça.',
  },
  {
    id: 'buttons',
    title: 'Déclencher 8 boutons différents',
    description: 'Chaque bouton de la page me fait dire un mot différent. Fais-en parler huit.',
    xp: 130,
    goal: 8,
    icon: 'pointer',
    done: 'Huit boutons, huit répliques. Cette page est officiellement bavarde.',
  },
  {
    id: 'secrets',
    title: 'Trouver les 6 secrets',
    description:
      'Konami, œuf caché, faux ban, mes origines, mode zen, bas de page. Chacun débloque une actu classée.',
    xp: 240,
    goal: 6,
    icon: 'key',
    done: 'Tous les secrets sont tombés. Tu connais mes dossiers mieux que moi.',
  },
  {
    id: 'explore',
    title: 'Lire la page en entier',
    description: 'Descends jusqu’au bout. Oui, il y a quelque chose tout en bas.',
    xp: 80,
    goal: 1,
    icon: 'compass',
    done: 'Page lue de haut en bas. Badge Explorateur, et mon respect avec.',
  },
]

export const TOTAL_XP = MISSIONS.reduce((sum, mission) => sum + mission.xp, 0)

/** Level thresholds. Komo gains a rank (and a bit of ego) at each step. */
export const LEVELS: readonly { level: number; at: number; title: string }[] = [
  { level: 1, at: 0, title: 'Veilleuse' },
  { level: 2, at: 120, title: 'Gardienne' },
  { level: 3, at: 300, title: 'Sentinelle' },
  { level: 4, at: 520, title: 'Capitaine' },
  { level: 5, at: 760, title: 'Archiviste' },
  { level: 6, at: TOTAL_XP, title: 'Komorebi' },
]

export function levelFor(xp: number) {
  let current = LEVELS[0]
  for (const step of LEVELS) {
    if (xp >= step.at) current = step
  }
  const next = LEVELS.find((step) => step.at > xp) ?? null
  const span = next ? next.at - current.at : 1
  const progress = next ? Math.min(1, Math.max(0, (xp - current.at) / span)) : 1
  return { ...current, next, progress }
}

/** Komo announces her own promotions. */
export const LEVEL_UP_LINES: Record<number, string> = {
  2: 'Niveau 2 : Gardienne. Mes servomoteurs ont gagné en confiance.',
  3: 'Niveau 3 : Sentinelle. Je vois maintenant les raids arriver deux secondes plus tôt.',
  4: 'Niveau 4 : Capitaine. J’ai le droit de donner des ordres aux autres bots. En théorie.',
  5: 'Niveau 5 : Archiviste. Je connais chaque secret de cette page par cœur.',
  6: 'Niveau 6 : Komorebi. Toutes les missions accomplies. Je suis officiellement au maximum.',
}
