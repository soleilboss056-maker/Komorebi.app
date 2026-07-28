'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bug, Coins, Ghost, Lightbulb, Shield, Skull, Sparkles, Swords, Ticket } from 'lucide-react'
import { HOVER_LINES, SCENARIOS, TIPS, type Effect, type Mood } from '@/lib/fun-data'
import { useFun } from '@/components/fun/fun-context'

/**
 * Face + posture per mood. Kept as class strings so the CSS stays tiny.
 * `brow` holds the [left eye, right eye] tilt so the two are mirrored.
 */
const FACE: Record<
  Mood,
  { eye: string; mouth: string; body: string; brow?: [string, string] }
> = {
  idle: {
    eye: 'size-1.5 rounded-full',
    mouth: 'h-0.5 w-3 rounded-full',
    body: 'animate-bob',
  },
  happy: {
    eye: 'size-1.5 rounded-full',
    mouth: 'h-1.5 w-3.5 rounded-b-full',
    body: 'animate-bob',
  },
  scared: {
    eye: 'size-2.5 rounded-full',
    mouth: 'size-1.5 rounded-full',
    body: 'animate-wiggle [animation-iteration-count:infinite]',
    brow: ['rotate-12', '-rotate-12'],
  },
  brave: {
    eye: 'h-1 w-2 rounded-sm',
    mouth: 'h-0.5 w-4 rounded-full',
    body: 'animate-breathe',
    brow: ['-rotate-12', 'rotate-12'],
  },
  proud: {
    eye: 'h-0.5 w-2 rounded-full',
    mouth: 'h-1.5 w-4 rounded-b-full',
    body: 'animate-breathe',
  },
  curious: {
    eye: 'size-2 rounded-full',
    mouth: 'h-0.5 w-2 rounded-full',
    body: 'animate-bob [animation-duration:3.4s]',
    brow: ['rotate-6', 'rotate-6'],
  },
  shocked: {
    eye: 'size-2.5 rounded-full',
    mouth: 'size-2 rounded-full',
    body: 'animate-bob [animation-duration:1.2s]',
  },
  party: {
    eye: 'h-0.5 w-2 rounded-full',
    mouth: 'h-2 w-4 rounded-b-full',
    body: 'animate-bob [animation-duration:1.1s]',
  },
  sleepy: {
    eye: 'h-0.5 w-2 rounded-full opacity-70',
    mouth: 'h-0.5 w-2 rounded-full opacity-70',
    body: 'animate-breathe [animation-duration:8s]',
  },
}

const MOOD_LABEL: Record<Mood, string> = {
  idle: 'tranquille',
  happy: 'contente',
  scared: 'apeurée',
  brave: 'combative',
  proud: 'fière',
  curious: 'curieuse',
  shocked: 'surprise',
  party: 'en fête',
  sleepy: 'endormie',
}

const EFFECT_ICON: Record<Exclude<Effect, 'raid' | 'zzz'>, typeof Shield> = {
  shield: Shield,
  ticket: Ticket,
  coin: Coins,
  sparkle: Sparkles,
}

const MONSTERS = [Ghost, Bug, Skull]

type Bubble = { text: string; mood: Mood; priority: boolean }

export function Mascot() {
  const { say, message, unlock } = useFun()

  const [mood, setMood] = useState<Mood>('idle')
  const [zoneMood, setZoneMood] = useState<Mood>('idle')
  const [bubble, setBubble] = useState<Bubble | null>(null)
  const [effect, setEffect] = useState<Effect | null>(null)
  const [open, setOpen] = useState(false)

  const clicks = useRef(0)
  const tipIndex = useRef(Math.floor(Math.random() * TIPS.length))
  const lastHoverKey = useRef('')
  const lastHoverAt = useRef(0)
  const bubbleTimer = useRef<number | null>(null)
  const effectTimer = useRef<number | null>(null)
  const followTimer = useRef<number | null>(null)
  const activePriority = useRef(false)

  const clearTimers = useCallback(() => {
    for (const timer of [bubbleTimer, effectTimer, followTimer]) {
      if (timer.current !== null) {
        window.clearTimeout(timer.current)
        timer.current = null
      }
    }
  }, [])

  /** Central entry point: show a line, an optional effect, and a follow-up beat. */
  const show = useCallback(
    (line: {
      text: string
      mood: Mood
      effect?: Effect
      follow?: { text: string; mood: Mood; effect?: Effect }
      priority?: boolean
      duration?: number
    }) => {
      clearTimers()
      const priority = line.priority ?? false
      activePriority.current = priority
      setBubble({ text: line.text, mood: line.mood, priority })
      setMood(line.mood)
      setEffect(line.effect ?? null)
      setOpen(true)

      const duration = line.duration ?? (line.text.length > 70 ? 6200 : 4800)

      if (line.effect) {
        effectTimer.current = window.setTimeout(() => setEffect(null), 2400)
      }

      if (line.follow) {
        const follow = line.follow
        followTimer.current = window.setTimeout(() => {
          setBubble({ text: follow.text, mood: follow.mood, priority })
          setMood(follow.mood)
          setEffect(follow.effect ?? null)
          if (follow.effect) {
            effectTimer.current = window.setTimeout(() => setEffect(null), 2200)
          }
          bubbleTimer.current = window.setTimeout(() => {
            setOpen(false)
            activePriority.current = false
          }, 4600)
        }, 2600)
        return
      }

      bubbleTimer.current = window.setTimeout(() => {
        setOpen(false)
        activePriority.current = false
      }, duration)
    },
    [clearTimers],
  )

  // Messages pushed by the easter eggs (Konami, egg, fake ban...).
  useEffect(() => {
    if (!message) return
    show({ ...message, priority: message.priority })
  }, [message, show])

  // Mood follows the section currently on screen.
  useEffect(() => {
    const zones = Array.from(document.querySelectorAll<HTMLElement>('[data-mascot-zone]'))
    if (zones.length === 0 || typeof IntersectionObserver === 'undefined') return

    const ratios = new Map<HTMLElement, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target as HTMLElement, entry.isIntersecting ? entry.intersectionRatio : 0)
        }
        let best: HTMLElement | null = null
        let bestRatio = 0
        for (const [node, ratio] of ratios) {
          if (ratio > bestRatio) {
            best = node
            bestRatio = ratio
          }
        }
        const next = (best?.dataset.mascotZone ?? 'idle') as Mood
        setZoneMood(next)
      },
      { threshold: [0, 0.25, 0.5, 0.75] },
    )

    for (const zone of zones) observer.observe(zone)
    return () => observer.disconnect()
  }, [])

  // Idle mood falls back to the current zone mood.
  useEffect(() => {
    if (!open) setMood(zoneMood)
  }, [open, zoneMood])

  // Hover chatter, driven by `data-mascot-key` attributes (allow-list lookup).
  useEffect(() => {
    const onOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      const host = target?.closest<HTMLElement>('[data-mascot-key]')
      if (!host) return

      const key = host.dataset.mascotKey ?? ''
      const line = HOVER_LINES[key]
      if (!line) return
      if (activePriority.current) return

      const now = Date.now()
      if (key === lastHoverKey.current && now - lastHoverAt.current < 5000) return
      lastHoverKey.current = key
      lastHoverAt.current = now

      show(line)
    }

    window.addEventListener('pointerover', onOver, { passive: true })
    return () => window.removeEventListener('pointerover', onOver)
  }, [show])

  // Ambient life: one scenario at a time, paused when the tab is hidden.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Mobiles get a slower cadence so the main thread stays free.
    const slow = window.matchMedia('(max-width: 640px)').matches
    let index = Math.floor(Math.random() * SCENARIOS.length)

    const interval = window.setInterval(
      () => {
        if (document.visibilityState !== 'visible') return
        if (activePriority.current || open) return
        index = (index + 1 + Math.floor(Math.random() * 3)) % SCENARIOS.length
        show(SCENARIOS[index])
      },
      slow ? 26000 : 17000,
    )

    return () => window.clearInterval(interval)
  }, [open, show])

  useEffect(() => clearTimers, [clearTimers])

  const onClick = () => {
    clicks.current += 1

    if (clicks.current === 10) {
      unlock('komo')
      show({
        text: 'D’accord, d’accord ! Je suis née d’un bug d’affichage. Actu secrète débloquée.',
        mood: 'shocked',
        effect: 'sparkle',
        priority: true,
        duration: 6500,
      })
      return
    }

    tipIndex.current = (tipIndex.current + 1) % TIPS.length
    show({
      text: TIPS[tipIndex.current],
      mood: clicks.current % 3 === 0 ? 'curious' : 'happy',
      effect: 'sparkle',
    })
  }

  const face = FACE[mood]
  const monsters = useMemo(() => MONSTERS, [])
  const EffectIcon = effect && effect !== 'raid' && effect !== 'zzz' ? EFFECT_ICON[effect] : null

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2">
      {/* Thought bubble */}
      <div
        role="status"
        aria-live="polite"
        data-open={open ? 'true' : 'false'}
        className="komo-bubble w-[15rem] max-w-[calc(100vw-2rem)] rounded-2xl rounded-bl-md border border-primary/35 bg-card/95 px-3.5 py-2.5 text-[11px] leading-relaxed text-card-foreground shadow-xl shadow-primary/20 backdrop-blur-md sm:w-[17rem] sm:text-xs"
      >
        {bubble ? <p className="text-pretty">{bubble.text}</p> : null}
        <span className="mt-1.5 block text-[9px] font-semibold uppercase tracking-widest text-primary">
          Komo · {MOOD_LABEL[mood]}
        </span>
      </div>

      <div className="pointer-events-auto relative">
        {/* Raid: monsters charge in and get pushed back */}
        {effect === 'raid' ? (
          <div aria-hidden="true" className="absolute inset-y-0 left-full ml-1 flex items-center">
            {monsters.map((Monster, index) => (
              <Monster
                key={index}
                className="komo-charge size-4 text-destructive"
                style={{ animationDelay: `${index * 260}ms` }}
              />
            ))}
          </div>
        ) : null}

        {effect === 'raid' || mood === 'brave' ? (
          <Swords
            aria-hidden="true"
            className="komo-slash absolute -right-2 top-1 size-4 text-accent"
          />
        ) : null}

        {EffectIcon ? (
          <EffectIcon
            aria-hidden="true"
            className="komo-pop absolute -right-2 -top-3 size-4 text-accent"
          />
        ) : null}

        {effect === 'zzz' ? (
          <span
            aria-hidden="true"
            className="komo-zzz absolute -right-1 -top-3 text-[10px] font-bold text-primary"
          >
            z
          </span>
        ) : null}

        <button
          type="button"
          onClick={onClick}
          aria-label={`Komo, la mascotte (${MOOD_LABEL[mood]}) — cliquez pour une astuce`}
          className="group relative block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span
            aria-hidden="true"
            className="absolute -inset-2 rounded-full bg-primary/25 blur-lg transition-opacity duration-500 group-hover:bg-primary/40"
          />
          <span
            className={`relative flex size-12 flex-col items-center justify-center gap-1.5 rounded-2xl border border-primary/40 bg-[linear-gradient(150deg,oklch(0.32_0.12_302),oklch(0.24_0.06_288))] shadow-lg shadow-primary/30 transition-transform duration-300 group-hover:scale-105 group-active:scale-95 ${face.body}`}
          >
            {/* antenna */}
            <span
              aria-hidden="true"
              className="absolute -top-2 left-1/2 h-2 w-px -translate-x-1/2 bg-primary/70"
            >
              <span className="absolute -top-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-accent" />
            </span>

            {/* eyes */}
            <span aria-hidden="true" className="flex items-center gap-2">
              <span
                className={`bg-accent transition-all duration-300 ${face.eye} ${face.brow?.[0] ?? ''}`}
              />
              <span
                className={`bg-accent transition-all duration-300 ${face.eye} ${face.brow?.[1] ?? ''}`}
              />
            </span>

            {/* mouth */}
            <span
              aria-hidden="true"
              className={`bg-[oklch(0.78_0.17_350)] transition-all duration-300 ${face.mouth}`}
            />

            <Lightbulb
              aria-hidden="true"
              className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-card p-0.5 text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          </span>
        </button>
      </div>
    </div>
  )
}
