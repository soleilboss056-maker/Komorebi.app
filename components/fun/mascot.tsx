'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowUp,
  Bug,
  Coins,
  Ghost,
  Grip,
  Lightbulb,
  Lock,
  LockOpen,
  RotateCcw,
  Shield,
  Skull,
  Sparkles,
  Swords,
  Ticket,
} from 'lucide-react'
import {
  CLICK_LINES,
  DRAG_LINES,
  GENERIC_CLICK,
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

/* ------------------------------------------------------------------ *
 * Geometry — Komo now lives anywhere in the viewport (free 2D).       *
 * ------------------------------------------------------------------ */

/** Robot bounding box (visual only, stable across breakpoints). */
const KOMO_W = 48
const KOMO_H = 96
const MARGIN = 12
/** Walking speed in px/s — slow enough to read as steps, not teleporting. */
const WALK_SPEED = 92
const STORAGE_KEY = 'komo-spot-v1'
/** Pointer travel above which a press is a drag, not a click. */
const DRAG_THRESHOLD = 6

type Point = { x: number; y: number }
type Bubble = { text: string; mood: Mood; priority: boolean }
type Side = 'left' | 'right'

function bounds() {
  return {
    maxX: Math.max(MARGIN, window.innerWidth - KOMO_W - MARGIN),
    maxY: Math.max(MARGIN, window.innerHeight - KOMO_H - MARGIN),
  }
}

function clampPoint(point: Point): Point {
  const { maxX, maxY } = bounds()
  return {
    x: Math.min(Math.max(MARGIN, point.x), maxX),
    y: Math.min(Math.max(MARGIN, point.y), maxY),
  }
}

/** Default corner: bottom-left, where Komo used to live. */
function defaultSpot(): Point {
  return clampPoint({ x: MARGIN + 4, y: window.innerHeight - KOMO_H - 24 })
}

function pick<T>(list: readonly T[], index: number) {
  return list[index % list.length]
}

/** Collapses whitespace and control characters out of an accessible label. */
function cleanLabel(value: string) {
  return value
    .replace(/\s+/g, ' ')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f-\u009f]/g, '')
    .trim()
    .slice(0, 42)
}

/** Stable index from a string, so the same button always gets the same line. */
function hashIndex(value: string, length: number) {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0
  }
  return Math.abs(hash) % length
}

export function Mascot() {
  const { say, message, unlock, bump, noteButton, level, installs } = useFun()

  const [mood, setMood] = useState<Mood>('idle')
  const [zoneMood, setZoneMood] = useState<Mood>('idle')
  const [bubble, setBubble] = useState<Bubble | null>(null)
  const [effect, setEffect] = useState<Effect | null>(null)
  const [gesture, setGesture] = useState<Gesture | null>(null)
  const [open, setOpen] = useState(false)

  // Free movement across the whole viewport.
  const [spot, setSpot] = useState<Point>({ x: MARGIN + 4, y: 400 })
  const [walkMs, setWalkMs] = useState(0)
  const [walking, setWalking] = useState(false)
  const [lean, setLean] = useState(0)
  const [pointSide, setPointSide] = useState<Side>('right')
  const [dragging, setDragging] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [ready, setReady] = useState(false)

  const clicks = useRef(0)
  const tipIndex = useRef(0)
  const lastHoverKey = useRef('')
  const lastHoverAt = useRef(0)
  const bubbleTimer = useRef<number | null>(null)
  const effectTimer = useRef<number | null>(null)
  const followTimer = useRef<number | null>(null)
  const walkTimer = useRef<number | null>(null)
  const activePriority = useRef(false)
  const spotRef = useRef<Point>({ x: MARGIN + 4, y: 400 })
  const pinnedRef = useRef(false)
  const draggingRef = useRef(false)
  const lastInviteAt = useRef(0)
  const inviteIndex = useRef(0)
  const dragOffset = useRef<Point>({ x: 0, y: 0 })
  const dragStart = useRef<Point>({ x: 0, y: 0 })
  const dragMoved = useRef(false)
  const pointerId = useRef<number | null>(null)
  const dropIndex = useRef(0)
  const grabIndex = useRef(0)
  const keyboardIndex = useRef(0)
  const edgeAt = useRef(0)
  const clickAt = useRef(0)

  const clearTimers = useCallback(() => {
    for (const timer of [bubbleTimer, effectTimer, followTimer]) {
      if (timer.current !== null) {
        window.clearTimeout(timer.current)
        timer.current = null
      }
    }
  }, [])

  const commitSpot = useCallback((next: Point) => {
    spotRef.current = next
    setSpot(next)
  }, [])

  /** Walk to an absolute viewport point, clamped inside the screen. */
  const walkTo = useCallback(
    (target: Point) => {
      if (pinnedRef.current || draggingRef.current) return
      const clamped = clampPoint(target)
      const distance = Math.hypot(clamped.x - spotRef.current.x, clamped.y - spotRef.current.y)
      if (distance < 14) return

      const duration = Math.min(5200, Math.max(700, (distance / WALK_SPEED) * 1000))
      setLean(clamped.x > spotRef.current.x ? 4 : clamped.x < spotRef.current.x ? -4 : 0)
      setWalkMs(duration)
      setWalking(true)
      commitSpot(clamped)

      if (walkTimer.current !== null) window.clearTimeout(walkTimer.current)
      walkTimer.current = window.setTimeout(() => {
        setWalking(false)
        setLean(0)
        walkTimer.current = null
      }, duration)
    },
    [commitSpot],
  )

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
      ambient?: boolean
    }) => {
      clearTimers()
      const priority = line.priority ?? false
      activePriority.current = priority
      setBubble({ text: line.text, mood: line.mood, priority })
      setMood(line.mood)
      setEffect(line.effect ?? null)
      setGesture(line.gesture ?? null)
      setOpen(true)
      if (!line.ambient) bump('chat')

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
    [bump, clearTimers],
  )

  /* ---------------- Position: restore, persist, clamp ---------------- */

  useEffect(() => {
    let start = defaultSpot()
    let restoredPin = false
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as unknown
        if (parsed && typeof parsed === 'object') {
          const value = parsed as { x?: unknown; y?: unknown; pinned?: unknown }
          if (typeof value.x === 'number' && typeof value.y === 'number') {
            start = clampPoint({ x: value.x, y: value.y })
          }
          restoredPin = value.pinned === true
        }
      }
    } catch {
      // Ignored: a missing or corrupt preference just means the default corner.
    }
    pinnedRef.current = restoredPin
    setPinned(restoredPin)
    commitSpot(start)
    tipIndex.current = Math.floor(Math.random() * TIPS.length)
    setReady(true)
  }, [commitSpot])

  useEffect(() => {
    if (!ready) return
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ x: spot.x, y: spot.y, pinned }),
      )
    } catch {
      // Cosmetic preference only.
    }
  }, [spot, pinned, ready])

  useEffect(() => {
    const onResize = () => {
      const next = clampPoint(spotRef.current)
      if (next.x !== spotRef.current.x || next.y !== spotRef.current.y) {
        setWalkMs(320)
        commitSpot(next)
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [commitSpot])

  /* ---------------- Dragging ---------------- */

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return
    pointerId.current = event.pointerId
    dragOffset.current = {
      x: event.clientX - spotRef.current.x,
      y: event.clientY - spotRef.current.y,
    }
    dragStart.current = { x: event.clientX, y: event.clientY }
    dragMoved.current = false
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (pointerId.current !== event.pointerId) return
    const travelled = Math.hypot(
      event.clientX - dragStart.current.x,
      event.clientY - dragStart.current.y,
    )
    if (!dragMoved.current && travelled < DRAG_THRESHOLD) return

    if (!dragMoved.current) {
      dragMoved.current = true
      draggingRef.current = true
      setDragging(true)
      setWalking(false)
      setWalkMs(0)
      if (walkTimer.current !== null) {
        window.clearTimeout(walkTimer.current)
        walkTimer.current = null
      }
      grabIndex.current = (grabIndex.current + 1) % DRAG_LINES.grab.length
      const grab = DRAG_LINES.grab[grabIndex.current]
      show({ ...grab, duration: 2600, gesture: 'shrug' })
    }

    const next = clampPoint({
      x: event.clientX - dragOffset.current.x,
      y: event.clientY - dragOffset.current.y,
    })
    setLean(next.x > spotRef.current.x ? 6 : next.x < spotRef.current.x ? -6 : 0)
    commitSpot(next)
  }

  const endDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (pointerId.current !== event.pointerId) return
    pointerId.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (!dragMoved.current) return

    dragMoved.current = false
    draggingRef.current = false
    setDragging(false)
    setLean(0)
    pinnedRef.current = true
    setPinned(true)
    bump('move')
    clickAt.current = Date.now()

    dropIndex.current = (dropIndex.current + 1) % DRAG_LINES.drop.length
    const drop = DRAG_LINES.drop[dropIndex.current]
    show({ ...drop, effect: 'sparkle', duration: 3600 })
  }

  /* ---------------- Keyboard movement ---------------- */

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 96 : 24
    let dx = 0
    let dy = 0
    if (event.key === 'ArrowLeft') dx = -step
    else if (event.key === 'ArrowRight') dx = step
    else if (event.key === 'ArrowUp') dy = -step
    else if (event.key === 'ArrowDown') dy = step
    else return

    event.preventDefault()
    const target = { x: spotRef.current.x + dx, y: spotRef.current.y + dy }
    const next = clampPoint(target)
    const blocked = next.x === spotRef.current.x && next.y === spotRef.current.y

    pinnedRef.current = true
    setPinned(true)
    setWalkMs(160)
    commitSpot(next)
    if (!blocked) bump('move')

    const now = Date.now()
    if (now - clickAt.current < 900) return
    clickAt.current = now

    if (blocked) {
      edgeAt.current = (edgeAt.current + 1) % DRAG_LINES.edge.length
      show({ ...DRAG_LINES.edge[edgeAt.current], duration: 2600 })
      return
    }
    keyboardIndex.current = (keyboardIndex.current + 1) % DRAG_LINES.keyboard.length
    show({ ...DRAG_LINES.keyboard[keyboardIndex.current], duration: 2600 })
  }

  /* ---------------- Reactions ---------------- */

  // Messages pushed by the easter eggs, missions and the console.
  useEffect(() => {
    if (!message) return
    show({ ...message, priority: message.priority })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message])

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

      show({ ...line, ambient: true })
    }

    window.addEventListener('pointerover', onOver, { passive: true })
    return () => window.removeEventListener('pointerover', onOver)
  }, [show])

  /**
   * Every interactive element on the page makes Komo talk.
   * Named keys (`data-komo-say`) get a hand-written line; anything else gets a
   * generic reaction built around its accessible label. The label is only ever
   * interpolated into a plain string rendered as JSX text — never as HTML.
   */
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const host = target?.closest<HTMLElement>(
        'button, a[href], [role="button"], [role="tab"], summary, label[for]',
      )
      if (!host) return
      if (host.dataset.komoSkip === 'true') return

      const now = Date.now()
      if (now - clickAt.current < 260) return
      clickAt.current = now

      const named = host.dataset.komoSay
      if (named && CLICK_LINES[named]) {
        noteButton(named)
        show(CLICK_LINES[named])
        return
      }

      const label =
        cleanLabel(host.dataset.komoLabel ?? '') ||
        cleanLabel(host.getAttribute('aria-label') ?? '') ||
        cleanLabel(host.textContent ?? '') ||
        'ce bouton'

      const mascotKey = host.dataset.mascotKey
      const key = named || mascotKey || label.toLowerCase()
      noteButton(key)

      if (mascotKey && HOVER_LINES[mascotKey]) {
        show(HOVER_LINES[mascotKey])
        return
      }

      const line = pick(GENERIC_CLICK, hashIndex(key, GENERIC_CLICK.length))
      show({ text: line.text(label), mood: line.mood, effect: 'sparkle', duration: 3800 })
    }

    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [noteButton, show])

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
        if (activePriority.current || open || draggingRef.current) return

        turn += 1
        if (turn % 2 === 0) {
          self = (self + 1) % SELF_TALK.length
          show({ ...SELF_TALK[self], ambient: true })
        } else {
          scenario = (scenario + 1 + Math.floor(Math.random() * 3)) % SCENARIOS.length
          show({ ...SCENARIOS[scenario], ambient: true })
        }
      },
      slow ? 22000 : 14000,
    )

    return () => window.clearInterval(interval)
  }, [open, show])

  // Free roam: Komo picks her own spot anywhere on screen, unless pinned.
  useEffect(() => {
    if (!ready) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const slow = window.matchMedia('(max-width: 640px)').matches

    const interval = window.setInterval(
      () => {
        if (document.visibilityState !== 'visible') return
        if (pinnedRef.current || draggingRef.current) return
        if (gesture === 'point') return
        const { maxX, maxY } = bounds()
        walkTo({
          x: MARGIN + Math.random() * (maxX - MARGIN),
          // Favour the lower two thirds so she does not sit on the header.
          y: MARGIN + (0.28 + Math.random() * 0.72) * (maxY - MARGIN),
        })
      },
      slow ? 15000 : 10000,
    )

    return () => window.clearInterval(interval)
  }, [gesture, ready, walkTo])

  // Invite call-out: when the install button is on screen, Komo walks next to
  // it and points at it with her pincers.
  useEffect(() => {
    const target = document.querySelector<HTMLElement>('[data-mascot-key="invite"]')
    if (!target || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting || entry.intersectionRatio < 0.6) return

        const now = Date.now()
        if (now - lastInviteAt.current < 26000) return
        if (activePriority.current) return
        lastInviteAt.current = now

        const rect = entry.boundingClientRect
        const buttonCenter = rect.left + rect.width / 2
        if (!pinnedRef.current && !draggingRef.current) {
          walkTo({ x: buttonCenter - KOMO_W / 2, y: rect.bottom + 18 })
        }
        setPointSide(buttonCenter >= spotRef.current.x + KOMO_W / 2 ? 'right' : 'left')

        inviteIndex.current = (inviteIndex.current + 1) % INVITE_CALL.length
        show({ ...INVITE_CALL[inviteIndex.current], duration: 7000, ambient: true })
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

  const onRobotClick = () => {
    // A drag that just ended must not also read as a click.
    if (dragMoved.current) return
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

  const togglePin = () => {
    const next = !pinnedRef.current
    pinnedRef.current = next
    setPinned(next)
  }

  const resetSpot = () => {
    pinnedRef.current = false
    setPinned(false)
    setWalkMs(700)
    commitSpot(defaultSpot())
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
    if (dragging) return side === 'right' ? '-rotate-[130deg]' : 'rotate-[130deg]'
    if (pose === 'flex') return side === 'right' ? '-rotate-[75deg]' : 'rotate-[75deg]'
    if (pose === 'shrug') return side === 'right' ? '-rotate-[28deg]' : 'rotate-[28deg]'
    if (raised && side === raisedSide) {
      const animation = pose === 'point' ? 'komo-point' : 'komo-wave-arm'
      return `${animation}-${side === 'right' ? 'r' : 'l'}`
    }
    if (armSwing) return side === 'right' ? 'komo-swing-a' : 'komo-swing-b'
    return side === 'right' ? '-rotate-[8deg]' : 'rotate-[8deg]'
  }

  // Bubble flips so it always stays inside the viewport.
  const viewportWidth = typeof window === 'undefined' ? 1024 : window.innerWidth
  const bubbleAbove = spot.y > 150
  const bubbleRight = spot.x > viewportWidth / 2

  return (
    <div
      className="komo-root pointer-events-none fixed left-0 top-0 z-50"
      style={{
        transform: `translate3d(${spot.x}px, ${spot.y}px, 0)`,
        transitionDuration: dragging ? '0ms' : `${walkMs}ms`,
        opacity: ready ? 1 : 0,
      }}
    >
      <div className="relative" style={{ width: KOMO_W, height: KOMO_H }}>
        {/* Thought bubble */}
        <div
          role="status"
          aria-live="polite"
          data-open={open ? 'true' : 'false'}
          data-above={bubbleAbove ? 'true' : 'false'}
          className={`komo-bubble absolute w-[15rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-primary/35 bg-card/95 px-3.5 py-2.5 text-[11px] leading-relaxed text-card-foreground shadow-xl shadow-primary/20 backdrop-blur-md sm:w-[17rem] sm:text-xs ${
            bubbleAbove ? 'bottom-full mb-2' : 'top-full mt-2'
          } ${bubbleRight ? 'right-0' : 'left-0'} ${
            bubbleAbove
              ? bubbleRight
                ? 'rounded-br-md'
                : 'rounded-bl-md'
              : bubbleRight
                ? 'rounded-tr-md'
                : 'rounded-tl-md'
          }`}
        >
          {bubble ? <p className="text-pretty">{bubble.text}</p> : null}
          <span className="mt-1.5 flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-widest text-primary">
            Komo · Nv.{level.level} {level.title} · {MOOD_LABEL[mood]}
          </span>
        </div>

        {/* Controls, revealed on hover/focus of the whole mascot */}
        <div className="komo-tools pointer-events-auto absolute -right-1 top-0 flex translate-x-full flex-col gap-1 pl-1">
          <button
            type="button"
            onClick={togglePin}
            data-komo-say={pinned ? 'komo-free' : 'komo-pin'}
            aria-label={pinned ? 'Libérer Komo (elle se remet à se balader)' : 'Fixer Komo sur place'}
            className="flex size-6 items-center justify-center rounded-lg border border-primary/40 bg-card/90 text-primary shadow-md backdrop-blur transition-colors hover:border-primary hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {pinned ? (
              <Lock className="size-3" aria-hidden="true" />
            ) : (
              <LockOpen className="size-3" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={resetSpot}
            data-komo-say="komo-reset"
            aria-label="Remettre Komo dans son coin d’origine"
            className="flex size-6 items-center justify-center rounded-lg border border-border bg-card/90 text-muted-foreground shadow-md backdrop-blur transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <RotateCcw className="size-3" aria-hidden="true" />
          </button>
          {installs.length > 0 ? (
            <span
              aria-hidden="true"
              className="flex h-5 min-w-6 items-center justify-center rounded-lg border border-accent/50 bg-accent/15 px-1 font-mono text-[9px] font-bold text-accent shadow-md"
            >
              {installs.length}
            </span>
          ) : null}
        </div>

        <div className="pointer-events-auto absolute inset-0">
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
            data-komo-skip="true"
            onClick={onRobotClick}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={onKeyDown}
            aria-label={`Komo, le petit robot (${MOOD_LABEL[mood]}, niveau ${level.level}) — cliquez pour une astuce, glissez pour la déplacer, flèches du clavier pour la bouger`}
            className={`group relative block size-full touch-none rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              dragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute -inset-2 rounded-full bg-primary/20 blur-lg transition-opacity duration-500 group-hover:bg-primary/40 ${
                dragging ? 'bg-accent/40' : ''
              }`}
            />

            {/* ---------------- Robot ---------------- */}
            <span
              aria-hidden="true"
              className={`relative flex origin-bottom flex-col items-center transition-transform duration-500 group-hover:scale-105 ${
                dragging ? 'komo-lift' : walking ? 'komo-hop' : face.body
              }`}
              style={{ rotate: `${lean}deg` }}
            >
              {/* antenna */}
              <span className="relative h-2.5 w-px bg-primary/70">
                <span
                  className={`absolute -top-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-accent ${
                    mood === 'scared' || mood === 'brave' || dragging ? 'komo-antenna' : ''
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
                <span
                  className={`flex flex-col items-center ${
                    dragging ? 'komo-dangle-a' : walking ? 'komo-leg-a' : ''
                  }`}
                >
                  <span className="h-2 w-1.5 bg-primary/60" />
                  <span className="h-1.5 w-3.5 rounded-sm bg-primary/80" />
                </span>
                <span
                  className={`flex flex-col items-center ${
                    dragging ? 'komo-dangle-b' : walking ? 'komo-leg-b' : ''
                  }`}
                >
                  <span className="h-2 w-1.5 bg-primary/60" />
                  <span className="h-1.5 w-3.5 rounded-sm bg-primary/80" />
                </span>
              </span>

              {/* ground shadow */}
              <span
                className={`mt-0.5 h-1 rounded-full bg-primary/20 blur-[2px] transition-all duration-300 ${
                  dragging ? 'w-5 opacity-40' : 'w-9'
                }`}
              />
            </span>

            {dragging ? (
              <Grip
                aria-hidden="true"
                className="absolute -bottom-1 -right-2 size-3.5 rounded-full bg-card p-0.5 text-accent"
              />
            ) : (
              <Lightbulb
                aria-hidden="true"
                className="absolute -bottom-1 -right-2 size-3.5 rounded-full bg-card p-0.5 text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
