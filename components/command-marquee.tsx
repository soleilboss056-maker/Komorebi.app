const highlights = [
  '/help',
  '/ban',
  '/blackjack',
  '/daily',
  '/ticket',
  '/rank',
  '/musique',
  '/giveaway',
  '/quest',
  '/roulette',
  '/traduction',
  '/autorole',
  '/profile',
  '/slots',
  '/warn',
  '/rpg-shop',
  '/annonce',
  '/leaderboard',
  '/snake',
  '/vocal-temporaire',
]

export function CommandMarquee() {
  return (
    <div
      aria-hidden="true"
      className="marquee-mask relative overflow-hidden border-y border-border/50 bg-card/30 py-3"
    >
      <div className="marquee-track gap-3">
        {[...highlights, ...highlights].map((command, index) => (
          <span
            key={`${command}-${index}`}
            className="shrink-0 rounded-full border border-border/60 bg-secondary/60 px-3 py-1.5 font-mono text-[11px] text-muted-foreground"
          >
            {command}
          </span>
        ))}
      </div>
    </div>
  )
}
