'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowUp,
  Bug,
  Coins,
  Ghost,
  Lightbulb,
  Shield,
  Skull,
  Sparkles,
  Swords,
  Ticket,
} from 'lucide-react'
import {
  HOVER_LINES,
  INVITE_CALL,
  SCENARIOS,
  SELF_TALK,
  TIPS,
  type Effect,
  type Gesture,
  type Mood,
} from '@/lib/fun-data'
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

/** Robot geometry, used to aim the walk target. */
const ROBOT_HALF_WIDTH = 26
const EDGE_OFFSET = 16
/** Walking speed in px/s — slow enough to read as steps, not teleporting. */
const WALK_SPEED = 78

type Bubble = { text: string; mood: Mood; priority: boolean }
type Side = 'left' | 'right'

/** Horizontal room available without pushing the speech bubble off screen. */
function getMaxX() {
  const bubble = window.innerWidth >= 640 ? 272 : 240
  return Math.max(0, window.innerWidth - EDGE_OFFSET * 2 - bubble)
}

export function Mascot() {
  const { say, message, unlock } = useFun()

  const [mood, setMood] = useState<Mood>('idle')
  const [zoneMood, setZoneMood] = useState<Mood>('idle')
  const [bubble, setBubble] = useState<Bubble | null>(null)
  const [effect, setEffect] = useState<Effect | null>(null)
  const [gesture, setGesture] = useState<Gesture | null>(null)
  const [open, setOpen] = useState(false)

  // Self-driven movement
  const [x, setX] = useState(0)
  const [walkMs, setWalkMs] = useState(0)
  const [walking, setWalking] = useState(false)
  const [lean, setLean] = useState(0)
  const [pointSide, setPointSide] = useState<Side>('right')

  const clicks = useRef(0)
  const tipIndex = useRef(Math.floor(Math.random() * TIPS.length))
  const lastHoverKey = useRef('')
  const lastHoverAt = useRef(0)
  const bubbleTimer = useRef<number | null>(null)
  const effectTimer = useRef<number | null>(null)
  const followTimer = useRef<number | null>(null)
  const walkTimer = useRef<number | null>(null)
  const activePriority = useRef(false)
  const xRef = useRef(0)
  const lastInviteAt = useRef(0)
  const inviteIndex = useRef(0)

  const clearTimers = useCallback(() => {
    for (const timer of [bubbleTimer, effectTimer, followTimer]) {
      if (timer.current !== null) {
        window.clearTimeout(timer.current)
        timer.current = null
      }
    }
  }, [])

  /** Walk to an absolute offset (px from the left margin), clamped on screen. */
  const walkTo = useCallback((target: number) => {
    const clamped = Math.max(0, Math.min(target, getMaxX()))
    const distance = Math.abs(clamped - xRef.current)
    if (distance < 10) return

    const duration = Math.min(4200, Math.max(650, (distance / WALK_SPEED) * 1000))
    setLean(clamped > xRef.current ? 4 : -4)
    setWalkMs(duration)
    setWalking(true)
    setX(clamped)
    xRef.current = clamped

    if (walkTimer.current !== null) window.clearTimeout(walkTimer.current)
    walkTimer.current = window.setTimeout(() => {
      setWalking(false)
      setLean(0)
      walkTimer.current = null
    }, duration)
  }, [])

  /** Central entry point: show a line, an optional effect, and a follow-up beat. */
  const show = useCallback(
    (line: {
      text: string
      mood: Mood
      effect?: Effect
      gesture?: Gesture
      follow?: { text: string; mood: Mood; effect?: Effect; gesture?: Gesture }
      priority?: boolean
      duration?: number
    }) => {
      clearTimers()
      const priority = line.priority ?? false
      activePriority.current = priority
      setBubble({ text: line.text, mood: line.mood, priority })
      setMood(line.mood)
      setEffect(line.effect ?? null)
      setGesture(line.gesture ?? null)
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
          setGesture(follow.gesture ?? null)
          if (follow.effect) {
            effectTimer.current = window.setTimeout(() => setEffect(null), 2200)
          }
          bubbleTimer.current = window.setTimeout(() => {
            setOpen(false)
            setGesture(null)
            activePriority.current = false
          }, 4600)
        }, 2600)
        return
      }

      bubbleTimer.current = window.setTimeout(() => {
        setOpen(false)
        setGesture(null)
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

  // Ambient life: alternates scenarios and self-talk, paused when tab hidden.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Mobiles get a slower cadence so the main thread stays free.
    const slow = window.matchMedia('(max-width: 640px)').matches
    let scenario = Math.floor(Math.random() * SCENARIOS.length)
    let self = Math.floor(Math.random() * SELF_TALK.length)
    let turn = 0

    const interval = window.setInterval(
      () => {
        if (document.visibilityState !== 'visible') return
        if (activePriority.current || open) return

        turn += 1
        if (turn % 2 === 0) {
          self = (self + 1) % SELF_TALK.length
          show(SELF_TALK[self])
        } else {
          scenario = (scenario + 1 + Math.floor(Math.random() * 3)) % SCENARIOS.length
          show(SCENARIOS[scenario])
        }
      },
      slow ? 22000 : 14000,
    )

    return () => window.clearInterval(interval)
  }, [open, show])

  // Free stroll: Komo picks her own spot along the bottom of the screen.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const slow = window.matchMedia('(max-width: 640px)').matches

    const interval = window.setInterval(
      () => {
        if (document.visibilityState !== 'visible') return
        if (gesture === 'point') return
        walkTo(Math.random() * getMaxX())
      },
      slow ? 16000 : 11000,
    )

    return () => window.clearInterval(interval)
  }, [gesture, walkTo])

  // Invite call-out: when the "Ajouter le bot" button is on screen, Komo walks
  // under it and points at it with her pincers.
  useEffect(() => {
    const target = document.querySelector<HTMLElement>('[data-mascot-key="invite"]')
    if (!target || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting || entry.intersectionRatio < 0.6) return

        const now = Date.now()
        if (now - lastInviteAt.current < 24000) return
        if (activePriority.current) return
        lastInviteAt.current = now

        const rect = entry.boundingClientRect
        const buttonCenter = rect.left + rect.width / 2
        walkTo(buttonCenter - EDGE_OFFSET - ROBOT_HALF_WIDTH)
        setPointSide(buttonCenter >= EDGE_OFFSET + xRef.current + ROBOT_HALF_WIDTH ? 'right' : 'left')

        inviteIndex.current = (inviteIndex.current + 1) % INVITE_CALL.length
        show({ ...INVITE_CALL[inviteIndex.current], duration: 7000 })
      },
      { threshold: [0, 0.6, 0.9] },
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [show, walkTo])

  useEffect(() => {
    return () => {
      clearTimers()
      if (walkTimer.current !== null) window.clearTimeout(walkTimer.current)
    }
  }, [clearTimers])

  const onClick = () => {
    clicks.current += 1

    if (clicks.current === 10) {
      unlock('komo')
      show({
        text: 'D’accord, d’accord ! Je suis née d’un bug d’affichage. Actu secrète débloquée.',
        mood: 'shocked',
        effect: 'sparkle',
        gesture: 'shrug',
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
      gesture: clicks.current % 2 === 0 ? 'wave' : undefined,
    })
  }

  const face = FACE[mood]
  const monsters = useMemo(() => MONSTERS, [])
  const EffectIcon = effect && effect !== 'raid' && effect !== 'zzz' ? EFFECT_ICON[effect] : null

  // Gesture actually rendered: explicit line gesture, else derived from mood.
  const pose: Gesture | null =
    gesture ??
    (mood === 'brave' || mood === 'proud'
      ? 'flex'
      : mood === 'party'
        ? 'wave'
        : mood === 'curious'
          ? 'shrug'
          : null)

  const armSwing = walking && !pose
  const raised = pose === 'wave' || pose === 'point'
  const raisedSide: Side = pose === 'point' ? pointSide : 'right'

  /** Per-arm class list: gesture pose wins, walking swing is the fallback. */
  const arm = (side: Side) => {
    if (pose === 'flex') return side === 'right' ? '-rotate-[75deg]' : 'rotate-[75deg]'
    if (pose === 'shrug') return side === 'right' ? '-rotate-[28deg]' : 'rotate-[28deg]'
    if (raised && side === raisedSide) {
      const animation = pose === 'point' ? 'komo-point' : 'komo-wave-arm'
      return `${animation}-${side === 'right' ? 'r' : 'l'}`
    }
    if (armSwing) return side === 'right' ? 'komo-swing-a' : 'komo-swing-b'
    return side === 'right' ? '-rotate-[8deg]' : 'rotate-[8deg]'
  }

  return (
    <div
      className="komo-root pointer-events-none fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2"
      style={{ transform: `translate3d(${x}px, 0, 0)`, transitionDuration: `${walkMs}ms` }}
    >
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
            className="komo-slash absolute -right-3 top-8 size-4 text-accent"
          />
        ) : null}

        {EffectIcon ? (
          <EffectIcon
            aria-hidden="true"
            className="komo-pop absolute -right-3 -top-2 size-4 text-accent"
          />
        ) : null}

        {effect === 'zzz' ? (
          <span
            aria-hidden="true"
            className="komo-zzz absolute -right-1 -top-2 text-[10px] font-bold text-primary"
          >
            z
          </span>
        ) : null}

        {/* Pointing at the invite button: an arrow follows the raised pincer. */}
        {pose === 'point' ? (
          <ArrowUp
            aria-hidden="true"
            className={`komo-point-arrow absolute -top-3 size-4 text-accent ${
              pointSide === 'right' ? 'right-0' : 'left-0'
            }`}
          />
        ) : null}

        <button
          type="button"
          onClick={onClick}
          aria-label={`Komo, le petit robot (${MOOD_LABEL[mood]}) — cliquez pour une astuce`}
          className="group relative block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span
            aria-hidden="true"
            className="absolute -inset-2 rounded-full bg-primary/20 blur-lg transition-opacity duration-500 group-hover:bg-primary/40"
          />

          {/* ---------------- Robot ---------------- */}
          <span
            aria-hidden="true"
            className={`relative flex origin-bottom scale-90 flex-col items-center transition-transform duration-500 group-hover:scale-100 sm:scale-100 sm:group-hover:scale-105 ${
              walking ? 'komo-hop' : face.body
            }`}
            style={{ rotate: `${lean}deg` }}
          >
            {/* antenna */}
            <span className="relative h-2.5 w-px bg-primary/70">
              <span
                className={`absolute -top-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-accent ${
                  mood === 'scared' || mood === 'brave' ? 'komo-antenna' : ''
                }`}
              />
            </span>

            {/* head */}
            <span className="relative flex h-9 w-11 flex-col items-center justify-center gap-1.5 rounded-xl border border-primary/40 bg-[linear-gradient(150deg,oklch(0.34_0.12_302),oklch(0.24_0.06_288))] shadow-lg shadow-primary/30">
              {/* ear plates */}
              <span className="absolute -left-1 top-2.5 h-3 w-1 rounded-l-sm bg-primary/50" />
              <span className="absolute -right-1 top-2.5 h-3 w-1 rounded-r-sm bg-primary/50" />

              {/* eyes */}
              <span
                className="flex items-center gap-2 transition-transform duration-500"
                style={{ transform: `translateX(${lean / 2}px)` }}
              >
                <span
                  className={`bg-accent transition-all duration-300 ${face.eye} ${face.brow?.[0] ?? ''}`}
                />
                <span
                  className={`bg-accent transition-all duration-300 ${face.eye} ${face.brow?.[1] ?? ''}`}
                />
              </span>

              {/* mouth */}
              <span
                className={`bg-[oklch(0.78_0.17_350)] transition-all duration-300 ${face.mouth}`}
              />
            </span>

            {/* neck */}
            <span className="h-1 w-3 bg-primary/60" />

            {/* torso + arms */}
            <span className="relative flex h-6 w-8 items-center justify-center rounded-lg border border-primary/40 bg-[linear-gradient(160deg,oklch(0.3_0.1_302),oklch(0.22_0.05_288))]">
              {/* chest core */}
              <span className="komo-core size-2 rounded-full bg-accent" />

              {/* left arm */}
              <span
                className={`komo-arm absolute -left-2 top-0.5 flex h-5 w-1.5 flex-col items-center rounded-full bg-primary/70 ${arm('left')}`}
              >
                <span className="mt-auto size-2 rounded-full border border-accent/70 bg-card" />
              </span>

              {/* right arm */}
              <span
                className={`komo-arm absolute -right-2 top-0.5 flex h-5 w-1.5 flex-col items-center rounded-full bg-primary/70 ${arm('right')}`}
              >
                <span className="mt-auto size-2 rounded-full border border-accent/70 bg-card" />
              </span>
            </span>

            {/* legs + treads */}
            <span className="flex items-start gap-2">
              <span className={`flex flex-col items-center ${walking ? 'komo-leg-a' : ''}`}>
                <span className="h-2 w-1.5 bg-primary/60" />
                <span className="h-1.5 w-3.5 rounded-sm bg-primary/80" />
              </span>
              <span className={`flex flex-col items-center ${walking ? 'komo-leg-b' : ''}`}>
                <span className="h-2 w-1.5 bg-primary/60" />
                <span className="h-1.5 w-3.5 rounded-sm bg-primary/80" />
              </span>
            </span>

            {/* ground shadow */}
            <span className="mt-0.5 h-1 w-9 rounded-full bg-primary/20 blur-[2px]" />
          </span>

          <Lightbulb
            aria-hidden="true"
            className="absolute -bottom-1 -right-2 size-3.5 rounded-full bg-card p-0.5 text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        </button>
      </div>
    </div>
  )
}
