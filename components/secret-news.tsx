'use client'

import { Check, Lock, Newspaper, Sparkles } from 'lucide-react'
import { BADGES, PUBLIC_NEWS, SECRET_IDS, SECRET_NEWS, type NewsItem } from '@/lib/fun-data'
import { HiddenEgg } from '@/components/fun/hidden-egg'
import { TrapButton } from '@/components/fun/trap-button'
import { useFun } from '@/components/fun/fun-context'
import { Reveal } from '@/components/reveal'
import { SplitText } from '@/components/split-text'

const toneClasses: Record<NewsItem['tone'], string> = {
  accent: 'bg-accent/15 text-accent',
  primary: 'bg-primary/15 text-primary',
  sakura: 'bg-[oklch(0.73_0.2_350/0.15)] text-[oklch(0.78_0.17_350)]',
}

function NewsCard({ item, secret = false }: { item: NewsItem; secret?: boolean }) {
  return (
    <article
      className={`spotlight glow-border group relative h-full overflow-hidden rounded-2xl border bg-card p-5 transition-colors duration-300 ${
        secret ? 'border-primary/45 shadow-lg shadow-primary/10' : 'border-border/70'
      } hover:border-primary/50`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${toneClasses[item.tone]}`}
        >
          {secret ? <Sparkles className="size-3" aria-hidden="true" /> : null}
          {item.tag}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {item.date}
        </span>
      </div>
      <h3 className="mt-3 text-pretty text-base font-semibold transition-colors duration-300 group-hover:text-primary">
        {item.title}
      </h3>
      <p className="mt-2 text-pretty text-xs leading-relaxed text-muted-foreground">{item.body}</p>
    </article>
  )
}

function LockedCard({ hint }: { hint: string }) {
  return (
    <article className="relative h-full overflow-hidden rounded-2xl border border-dashed border-border bg-card/40 p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Lock className="size-3.5" aria-hidden="true" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Actu verrouillée</span>
      </div>
      <h3 className="mt-3 select-none text-base font-semibold text-muted-foreground/70">
        ??? ??? ???
      </h3>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Indice : {hint}</p>
    </article>
  )
}

export function SecretNews() {
  const { unlocked, isUnlocked } = useFun()
  const found = unlocked.length
  const total = SECRET_IDS.length

  return (
    <section
      id="actus"
      data-mascot-zone="curious"
      className="relative overflow-hidden border-b border-border/60"
    >
      <div
        aria-hidden="true"
        className="hue-drift pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(50%_100%_at_50%_0%,oklch(0.5_0.2_302/0.12),transparent_70%)]"
      />

      {/* The hidden egg lives quietly in the bottom-right corner of the section. */}
      <HiddenEgg className="bottom-6 right-4" />

      <div className="relative mx-auto max-w-6xl px-4 py-20">
        <Reveal className="mx-auto max-w-2xl text-center" >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Actualités &amp; secrets
          </p>
          <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            <SplitText text="Les actus du bot, et celles qu’on ne montre pas" step={14} />
          </h2>
          <p
            data-mascot-key="news"
            className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground"
          >
            Six actualités publiques, six actualités classées. Les secondes se déverrouillent en
            fouillant la page : raccourcis clavier, coins sombres et boutons interdits.
          </p>
        </Reveal>

        {/* Progress + badges */}
        <Reveal delay={90} className="mx-auto mt-10 max-w-xl">
          <div className="rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 text-xs font-semibold">
                <Newspaper className="size-4 text-primary" aria-hidden="true" />
                Secrets débloqués
              </span>
              <span className="font-mono text-xs tabular-nums text-primary">
                {found} / {total}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,oklch(0.61_0.25_302),oklch(0.73_0.2_350),oklch(0.8_0.13_185))] transition-[width] duration-700 ease-out"
                style={{ width: `${(found / total) * 100}%` }}
              />
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {SECRET_IDS.map((id) => {
                const badge = BADGES[id]
                const done = isUnlocked(id)
                return (
                  <li key={id}>
                    <span
                      title={done ? badge.label : badge.hint}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors duration-300 ${
                        done
                          ? 'border-accent/50 bg-accent/15 text-accent'
                          : 'border-border bg-secondary/50 text-muted-foreground'
                      }`}
                    >
                      {done ? (
                        <Check className="size-3" aria-hidden="true" />
                      ) : (
                        <Lock className="size-3" aria-hidden="true" />
                      )}
                      {done ? badge.label : 'Badge verrouillé'}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </Reveal>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PUBLIC_NEWS.map((item, index) => (
            <Reveal as="li" key={item.id} delay={index * 70} variant="zoom">
              <NewsCard item={item} />
            </Reveal>
          ))}
        </ul>

        <div className="mt-12 flex items-center gap-3">
          <Sparkles className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <h3 className="text-sm font-bold uppercase tracking-widest">Dossiers classés</h3>
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
        </div>

        <ul className="paint-lazy mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SECRET_NEWS.map((item) => (
            <li key={item.id}>
              {isUnlocked(item.secret) ? (
                <div className="komo-pop h-full">
                  <NewsCard item={item} secret />
                </div>
              ) : (
                <LockedCard hint={BADGES[item.secret].hint} />
              )}
            </li>
          ))}
        </ul>

        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <p className="text-xs text-muted-foreground">
            Un dernier avertissement, très sincère :
          </p>
          <TrapButton />
        </div>
      </div>
    </section>
  )
}
