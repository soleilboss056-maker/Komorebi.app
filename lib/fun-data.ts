/**
 * Static, hand-written content for the interactive layer (mascot, easter eggs,
 * secret news).
 *
 * SECURITY NOTE: every string below is authored here and rendered as plain text
 * through JSX children only. Nothing in this file is ever injected as HTML
 * (no `dangerouslySetInnerHTML` anywhere in the project), and the mascot only
 * ever *looks up* keys in these records — it never renders text coming from the
 * DOM, the URL or user input. That makes the whole feature XSS-proof by design.
 */

export type Mood =
  | 'idle'
  | 'happy'
  | 'scared'
  | 'brave'
  | 'proud'
  | 'curious'
  | 'shocked'
  | 'party'
  | 'sleepy'

/** Small, cheap visual flourishes played around the mascot. */
export type Effect = 'raid' | 'shield' | 'ticket' | 'coin' | 'sparkle' | 'zzz'

/**
 * Arm/hand poses. The robot only ever moves its own limbs with CSS transforms,
 * so a gesture costs nothing on the main thread.
 */
export type Gesture = 'wave' | 'point' | 'flex' | 'shrug'

export type MascotLine = {
  text: string
  mood: Mood
  effect?: Effect
  /** Overrides the gesture normally derived from the mood. */
  gesture?: Gesture
  /** Optional second beat, shown a couple of seconds later (e.g. raid won). */
  follow?: { text: string; mood: Mood; effect?: Effect; gesture?: Gesture }
}

/* ------------------------------------------------------------------ *
 * Hover lines — keyed by the `data-mascot-key` attribute on elements. *
 * Unknown keys are simply ignored.                                    *
 * ------------------------------------------------------------------ */

export const HOVER_LINES: Record<string, MascotLine> = {
  guard: {
    text: 'Même pas peur des raids ! J’en ai stoppé un pendant que tu lisais ça.',
    mood: 'brave',
    effect: 'shield',
  },
  tickets: {
    text: 'Un ticket ouvert, un salon créé, une transcription archivée. Zéro clic perdu.',
    mood: 'happy',
    effect: 'ticket',
  },
  translate: {
    text: 'Réagis avec un drapeau et je traduis en privé. Même le japonais du dimanche.',
    mood: 'curious',
    effect: 'sparkle',
  },
  economy: {
    text: 'Attention, tes ZenCoins me font envie... je plaisante. Presque.',
    mood: 'happy',
    effect: 'coin',
  },
  games: {
    text: 'Morpion, Pendu, RPG, Casino... prépare-toi à perdre avec le sourire.',
    mood: 'party',
    effect: 'sparkle',
  },
  invite: {
    text: 'Oui ! Clique. Je promets d’être sage. À 87 %.',
    mood: 'party',
    effect: 'sparkle',
  },
  'stat-members': {
    text: '10 000 membres surveillés et pas un seul spam passé aujourd’hui.',
    mood: 'proud',
    effect: 'shield',
  },
  'stat-servers': {
    text: '50 serveurs, 50 maisons. Je fais le ménage dans toutes.',
    mood: 'proud',
  },
  'stat-latency': {
    text: '15 ms. Je réponds avant que tu finisses ta commande.',
    mood: 'shocked',
  },
  'stat-commands': {
    text: 'Plus de 100 commandes. Oui, j’ai relu la doc. Deux fois.',
    mood: 'curious',
  },
  commands: {
    text: 'Tape « / » dans Discord et tout ça apparaît. Magie ? Non, du code.',
    mood: 'happy',
  },
  news: {
    text: 'Il y a des actus verrouillées ici. À toi de les faire tomber.',
    mood: 'curious',
  },
  trap: {
    text: 'Ne clique pas sur ce bouton. Vraiment. Bon, clique un peu.',
    mood: 'shocked',
  },
  egg: {
    text: 'Tu l’as trouvé... personne ne le trouve jamais !',
    mood: 'party',
    effect: 'sparkle',
  },
}

/* ---------------------------------------------------- *
 * Ambient scenarios — played on a slow, gentle rotation *
 * ---------------------------------------------------- */

export const SCENARIOS: MascotLine[] = [
  {
    text: 'Alerte raid ! 12 comptes viennent de rejoindre en 3 secondes...',
    mood: 'scared',
    effect: 'raid',
    follow: {
      text: 'Raid neutralisé. 12 bans, 0 dégât. Je retourne à mon thé.',
      mood: 'proud',
      effect: 'shield',
    },
  },
  {
    text: 'Lien de phishing détecté dans #général. Suppression immédiate.',
    mood: 'brave',
    effect: 'shield',
    follow: { text: 'Message supprimé, auteur averti. Bien tenté.', mood: 'proud' },
  },
  {
    text: 'Nouveau ticket : « mon rôle a disparu ». J’enquête.',
    mood: 'curious',
    effect: 'ticket',
    follow: { text: 'Rôle rendu, ticket fermé, transcription envoyée.', mood: 'happy' },
  },
  {
    text: 'Quelqu’un vient de perdre 4 000 ZenCoins à la roulette. Pas moi.',
    mood: 'happy',
    effect: 'coin',
  },
  {
    text: 'Boss hebdomadaire vaincu par ton serveur. Loot : un œuf légendaire.',
    mood: 'party',
    effect: 'coin',
  },
  {
    text: 'On m’a réagi avec un drapeau japonais. Traduction envoyée en privé.',
    mood: 'happy',
    effect: 'sparkle',
  },
  {
    text: 'Captcha envoyé au nouveau membre. S’il est un robot, on sera deux.',
    mood: 'curious',
  },
  {
    text: '3 h du matin, serveur calme. Je garde un œil ouvert.',
    mood: 'sleepy',
    effect: 'zzz',
  },
  {
    text: 'Tentative de spam d’invitations : 47 messages bloqués d’un coup.',
    mood: 'brave',
    effect: 'shield',
  },
  {
    text: 'Psst... essaie le Code Konami : ↑ ↑ ↓ ↓ ← → ← → B A.',
    mood: 'curious',
    effect: 'sparkle',
  },
]

/* -------------------------------------------------------------- *
 * Self-talk — Komo comments on herself while she walks around.    *
 * -------------------------------------------------------------- */

export const SELF_TALK: MascotLine[] = [
  {
    text: 'Je m’appelle Komo. Deux bras, deux chenilles, un seul objectif : ton serveur au calme.',
    mood: 'happy',
    gesture: 'wave',
  },
  {
    text: 'Je me dégourdis les servomoteurs. Rester au même endroit, ça rouille.',
    mood: 'idle',
    gesture: 'shrug',
  },
  {
    text: 'Mon châssis est en aluminium recyclé de vieux serveurs. Écolo et nostalgique.',
    mood: 'proud',
    gesture: 'flex',
  },
  {
    text: 'Techniquement je suis un robot. Émotionnellement, je suis un chat.',
    mood: 'curious',
    gesture: 'shrug',
  },
  {
    text: 'Mon antenne clignote quand je détecte un raid. Là, elle est tranquille.',
    mood: 'idle',
  },
  {
    text: 'Je peux soulever 47 bannissements d’un seul bras. Regarde-moi ça.',
    mood: 'brave',
    gesture: 'flex',
    effect: 'shield',
  },
  {
    text: 'Je marche à gauche, je marche à droite. C’est ma pause déjeuner.',
    mood: 'happy',
  },
  {
    text: 'On m’a codée en une nuit. Ça se voit à mes genoux, mais je tiens debout.',
    mood: 'curious',
    gesture: 'shrug',
  },
  {
    text: 'Mon cœur est un voyant lumineux. Il bat à 15 ms, comme le bot.',
    mood: 'proud',
  },
  {
    text: 'Je n’ai pas de doigts, j’ai trois pinces. Ça suffit pour te faire signe.',
    mood: 'happy',
    gesture: 'wave',
  },
  {
    text: 'Parfois je m’arrête net et je réfléchis. Ne t’inquiète pas, je n’ai pas planté.',
    mood: 'sleepy',
  },
  {
    text: 'Je surveille cette page comme je surveille un salon Discord. Sans cligner.',
    mood: 'brave',
  },
]

/* -------------------------------------------------------------- *
 * Invite call-out — played when the invite button reaches screen. *
 * Komo walks under it and points at it with her pincers.           *
 * -------------------------------------------------------------- */

export const INVITE_CALL: MascotLine[] = [
  {
    text: 'Psst ! C’est là-haut. Clique sur « Ajouter le bot », je m’installe en 10 secondes.',
    mood: 'party',
    gesture: 'point',
    effect: 'sparkle',
  },
  {
    text: 'Regarde mes pinces : elles montrent le bouton d’invitation. Ce n’est pas un hasard.',
    mood: 'happy',
    gesture: 'point',
  },
  {
    text: 'Juste au-dessus. Un clic et j’arrive avec le Guard, les tickets et les monstres.',
    mood: 'party',
    gesture: 'point',
    effect: 'shield',
  },
  {
    text: 'Je te fais signe depuis tout à l’heure. Ajoute le bot, on va bien s’amuser.',
    mood: 'happy',
    gesture: 'wave',
  },
]

/* ------------------------------- *
 * Mode conseils (click on mascot) *
 * ------------------------------- */

export const TIPS: string[] = [
  'Survole les cartes de fonctionnalités : je commente absolument tout.',
  'Le Code Konami (↑ ↑ ↓ ↓ ← → ← → B A) déclenche une pluie de monstres RPG.',
  'Un œuf brillant est caché sur cette page. Il est petit. Très petit.',
  'Le bouton « Ne pas cliquer » ne doit pas être cliqué. Évidemment.',
  'Tape z-e-n au clavier pour débloquer un secret très... calme.',
  'Clique-moi 10 fois si tu veux connaître mes origines honteuses.',
  'Chaque secret trouvé déverrouille une actualité cachée plus bas.',
  'Descends jusqu’au bas de la page pour le badge Explorateur.',
  'Le compteur de latence ne ment pas : je réponds en moins de 15 ms.',
  'Astuce Discord : tape « / » puis « ticket » pour ouvrir un support.',
]

/* ------------------------------------------------------------------ *
 * Click reactions — every interactive element on the page makes Komo   *
 * say something. Named keys come from `data-komo-say` attributes;       *
 * anything else falls back to the generic pool below.                  *
 * ------------------------------------------------------------------ */

export const CLICK_LINES: Record<string, MascotLine> = {
  install: {
    text: 'Autorisation Discord en route ! Choisis ton serveur, je m’occupe du reste.',
    mood: 'party',
    gesture: 'point',
    effect: 'sparkle',
  },
  connect: {
    text: 'Connexion Discord : je lis ton pseudo et ton avatar, rien d’autre. Promis sur mes servomoteurs.',
    mood: 'curious',
    effect: 'shield',
  },
  logout: {
    text: 'Session effacée. J’oublie tout, comme si tu n’étais jamais passé.',
    mood: 'sleepy',
    gesture: 'shrug',
  },
  'nav-features': {
    text: 'Direction les fonctionnalités. C’est la partie où je me vante un peu.',
    mood: 'happy',
    gesture: 'point',
  },
  'nav-commands': {
    text: 'Le catalogue de commandes ! Prends une chaise, il est long.',
    mood: 'curious',
  },
  'nav-stats': {
    text: 'Les statistiques. Spoiler : elles sont flatteuses.',
    mood: 'proud',
  },
  'nav-news': {
    text: 'Les actus. Certaines sont verrouillées, à toi de les faire tomber.',
    mood: 'curious',
    effect: 'sparkle',
  },
  logo: {
    text: 'Retour en haut. Mon avatar, mes cerisiers, ma fierté.',
    mood: 'happy',
    gesture: 'wave',
  },
  'hero-features': {
    text: 'Bon choix : regarde d’abord ce que je sais faire, invite-moi ensuite.',
    mood: 'happy',
    gesture: 'point',
  },
  'command-filter': {
    text: 'Filtre appliqué. Je trie plus vite que je ne bannis, et je bannis vite.',
    mood: 'proud',
    effect: 'sparkle',
  },
  'command-more': {
    text: 'Encore des commandes ! Je t’avais dit que la liste était longue.',
    mood: 'party',
  },
  'command-search': {
    text: 'Tape trois lettres, je trouve la commande. Comme l’autocomplétion sur Discord.',
    mood: 'curious',
  },
  'scroll-top': {
    text: 'Hop, on remonte. Je garde ma place, moi, sauf si tu me déplaces.',
    mood: 'happy',
  },
  'mission-board': {
    text: 'Le tableau de missions ! Termine-les toutes et je monte au niveau maximum.',
    mood: 'brave',
    effect: 'shield',
  },
  'komo-pin': {
    text: 'Bloquée sur place. Je ne bouge plus d’un boulon jusqu’à nouvel ordre.',
    mood: 'brave',
  },
  'komo-free': {
    text: 'Libre ! Je repars me balader où je veux sur l’écran.',
    mood: 'party',
    gesture: 'wave',
  },
  'komo-reset': {
    text: 'Retour à mon coin d’origine, en bas à gauche. Le confort de l’habitude.',
    mood: 'sleepy',
  },
  footer: {
    text: 'Tu es arrivé au pied de la page. Il n’y a plus que moi ici.',
    mood: 'sleepy',
    effect: 'zzz',
  },
}

/**
 * Fallback pool: the label of the clicked element is injected as plain text
 * through `{}` so any button, even one added later, still gets a reaction.
 */
export const GENERIC_CLICK: readonly { text: (label: string) => string; mood: Mood }[] = [
  { text: (label) => `« ${label} » : noté, j’enregistre dans mes journaux.`, mood: 'curious' },
  { text: (label) => `Tu as appuyé sur « ${label} ». Bon réflexe.`, mood: 'happy' },
  { text: (label) => `« ${label} » ? Je surveille, ne t’inquiète pas.`, mood: 'brave' },
  { text: (label) => `Clic sur « ${label} ». Mes voyants clignotent d’approbation.`, mood: 'proud' },
  { text: (label) => `« ${label} », d’accord. Je note ça juste après mon thé.`, mood: 'sleepy' },
  { text: (label) => `Oh, « ${label} » ! Personne ne clique jamais là.`, mood: 'shocked' },
  { text: (label) => `« ${label} » activé. Ambiance.`, mood: 'party', },
]

/** Lines used when Komo is picked up, dropped, or moved with the keyboard. */
export const DRAG_LINES = {
  grab: [
    { text: 'Aaah ! On me soulève. Tiens-moi bien, je n’ai pas de parachute.', mood: 'shocked' as Mood },
    { text: 'Chenilles dans le vide. Pose-moi où tu veux, je m’adapte.', mood: 'curious' as Mood },
    { text: 'Transport de mascotte en cours. Merci de ne pas me secouer.', mood: 'scared' as Mood },
  ],
  drop: [
    { text: 'Parfait, cet endroit me plaît. Je m’installe.', mood: 'happy' as Mood },
    { text: 'Nouveau poste de garde. Vue imprenable sur la page.', mood: 'proud' as Mood },
    { text: 'Atterrissage réussi. Chenilles au sol, mission reprise.', mood: 'brave' as Mood },
    { text: 'Ici ? D’accord. J’ai connu pire comme bureau.', mood: 'curious' as Mood },
  ],
  keyboard: [
    { text: 'Déplacement au clavier, très élégant. Les flèches, c’est mon carburant.', mood: 'happy' as Mood },
    { text: 'Un pas de plus. Continue, j’aime marcher au rythme des touches.', mood: 'curious' as Mood },
  ],
  edge: [
    { text: 'Stop ! Encore un pas et je tombe hors de l’écran.', mood: 'scared' as Mood },
    { text: 'C’est le bord. Techniquement, le vide. Je préfère rester ici.', mood: 'shocked' as Mood },
  ],
} as const

/* ---------------- *
 * Secrets & badges *
 * ---------------- */

export const SECRET_IDS = ['konami', 'egg', 'trap', 'komo', 'zen', 'explorer'] as const
export type SecretId = (typeof SECRET_IDS)[number]

export const BADGES: Record<SecretId, { label: string; hint: string }> = {
  konami: { label: 'Maître du Konami', hint: 'Une vieille combinaison de manette...' },
  egg: { label: 'Chasseur d’œufs', hint: 'Quelque chose brille dans un coin.' },
  trap: { label: 'Survivant du faux ban', hint: 'Un bouton te supplie de ne pas cliquer.' },
  komo: { label: 'Ami de Komo', hint: 'Insiste auprès de la mascotte. Beaucoup.' },
  zen: { label: 'Mode Zen', hint: 'Trois lettres, très relaxantes, au clavier.' },
  explorer: { label: 'Explorateur', hint: 'Tout au fond de la page.' },
}

/* ------------------------- *
 * News feed (public actus)  *
 * ------------------------- */

export type NewsItem = {
  id: string
  tag: string
  date: string
  title: string
  body: string
  tone: 'primary' | 'accent' | 'sakura'
}

export const PUBLIC_NEWS: NewsItem[] = [
  {
    id: 'guard-v4',
    tag: 'Guard',
    date: 'Juillet 2026',
    title: 'Guard v4 : captcha adaptatif',
    body: 'Le captcha change de difficulté selon le score de risque du compte. Les raids massifs sont coupés avant le premier message.',
    tone: 'accent',
  },
  {
    id: 'tickets-resume',
    tag: 'Tickets',
    date: 'Juillet 2026',
    title: 'Reprise de session sur les tickets',
    body: 'Un ticket fermé peut être réouvert avec tout son historique, et la transcription est archivée automatiquement.',
    tone: 'primary',
  },
  {
    id: 'flags-42',
    tag: 'Traduction',
    date: 'Juin 2026',
    title: '42 drapeaux reconnus',
    body: 'La traduction par réaction couvre désormais 42 langues, avec détection automatique de la langue source.',
    tone: 'sakura',
  },
  {
    id: 'install-counter',
    tag: 'Console',
    date: 'Juillet 2026',
    title: 'Compteur d’installations vérifié',
    body: 'Chaque ajout du bot est confirmé par Discord lui-même pendant l’autorisation. Le compteur de la console ne peut pas être gonflé.',
    tone: 'accent',
  },
  {
    id: 'raid-boss',
    tag: 'RPG',
    date: 'Mai 2026',
    title: 'Boss de raid hebdomadaire',
    body: 'Tout le serveur combat le même boss chaque semaine. Classement, butin partagé et cicatrices morales.',
    tone: 'primary',
  },
  {
    id: 'poker',
    tag: 'Casino',
    date: 'Mai 2026',
    title: 'Poker multi-joueurs',
    body: 'Tables jusqu’à 6 joueurs, mises en ZenCoins, et un croupier qui ne bluffe jamais. Officiellement.',
    tone: 'sakura',
  },
]

export type SecretNewsItem = NewsItem & { secret: SecretId }

export const SECRET_NEWS: SecretNewsItem[] = [
  {
    id: 'infinite-monsters',
    secret: 'konami',
    tag: 'Secret',
    date: 'Classé',
    title: 'Mode Monstre Infini',
    body: 'Une vague de monstres RPG sans fin, réservée à ceux qui connaissent les vieilles combinaisons de manette. Le skin doré du bot est offert avec.',
    tone: 'primary',
  },
  {
    id: 'creator-note',
    secret: 'egg',
    tag: 'Secret',
    date: 'Classé',
    title: 'Le mot du créateur',
    body: 'Komorebi tient son nom de la lumière qui filtre entre les feuilles. Le bot est né un soir de raid, pour que personne n’ait à veiller à ma place.',
    tone: 'sakura',
  },
  {
    id: 'komo-jail',
    secret: 'trap',
    tag: 'Secret',
    date: 'Classé',
    title: 'La prison de Komorebi',
    body: 'Un salon fictif où les faux bans vont mourir. Personne n’y est vraiment banni : c’est juste une salle d’attente avec de la musique douce.',
    tone: 'accent',
  },
  {
    id: 'komo-origin',
    secret: 'komo',
    tag: 'Secret',
    date: 'Classé',
    title: 'Komo était un bug',
    body: 'La mascotte est apparue à cause d’une boucle d’affichage cassée. Elle a tellement fait rire l’équipe qu’elle est devenue une fonctionnalité.',
    tone: 'primary',
  },
  {
    id: 'zen-mode',
    secret: 'zen',
    tag: 'Secret',
    date: 'Classé',
    title: 'Mode Zen',
    body: 'Les notifications se taisent, les pétales tombent plus lentement et Komo s’endort. Le seul mode où le bot ne fait rien, volontairement.',
    tone: 'accent',
  },
  {
    id: 'explorer-log',
    secret: 'explorer',
    tag: 'Secret',
    date: 'Classé',
    title: 'Journal de l’explorateur',
    body: 'Tu as lu la page jusqu’au bout. Statistiquement, tu fais partie des 3 % les plus curieux. Komo te salue bien bas.',
    tone: 'sakura',
  },
]

/** Message shown by the hidden egg dialog. */
export const EGG_MESSAGE = {
  title: 'Message secret du créateur',
  lines: [
    'Tu viens de trouver l’œuf caché de Komorebi.',
    'Ce bot a commencé comme un script de 40 lignes pour bannir un spammeur à 4 h du matin. Il gère aujourd’hui des serveurs entiers, des tickets, une économie et des monstres.',
    'Merci de fouiller les coins des pages. C’est exactement l’état d’esprit qu’il faut.',
  ],
}
