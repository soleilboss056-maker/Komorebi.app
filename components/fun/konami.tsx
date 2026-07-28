'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bug, Ghost, Skull, Sparkles } from 'lucide-react'
import { useFun } from '@/components/fun/fun-context'

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
] as const

const ZEN = ['z', 'e', 'n'] as const

const MONSTERS = [Ghost, Bug, Skull, Sparkles]

type Monster = { id: number; left: number; delay: number; duration: number; size: number; kind: number }

/**
 * Keyboard easter eggs.
 * The `keydown` listener is registered once and always removed on cleanup.
 */
export function Konami() {
  const { say, unlock } = useFun()
  const [monsters, setMonsters] = useState<Monster[]>([])
  const buffer = useRef<string[]>([])
  const clearTimer = useRef<number | null>(null)

  const rain = useCallback(() => {
    // Mobiles get a much smaller swarm so the compositor keeps up.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const count = window.matchMedia('(max-width: 640px)').matches ? 8 : 20
    const next: Monster[] = Array.from({ length: count }, (_, index) => ({
      id: Date.now() + index,
      left: Math.round(Math.random() * 92) + 2,
      delay: Math.round(Math.random() * 1400),
      duration: 2600 + Math.round(Math.random() * 1800),
      size: 14 + Math.round(Math.random() * 12),
      kind: index % MONSTERS.length,
    }))
    setMonsters(next)

    if (clearTimer.current !== null) window.clearTimeout(clearTimer.current)
    clearTimer.current = window.setTimeout(() => setMonsters([]), 5200)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Never hijack typing inside a field.
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
      buffer.current = [...buffer.current, key].slice(-KONAMI.length)
      const tail = buffer.current

      if (KONAMI.every((expected, index) => tail[tail.length - KONAMI.length + index] === expected)) {
        buffer.current = []
        unlock('konami')
        rain()
        say({
          text: 'CODE KONAMI ACCEPTÉ ! Pluie de monstres RPG et skin doré débloqués.',
          mood: 'party',
          effect: 'sparkle',
          priority: true,
        })
        return
      }

      if (ZEN.every((expected, index) => tail[tail.length - ZEN.length + index] === expected)) {
        buffer.current = []
        unlock('zen')
        say({
          text: 'Mode Zen activé... chut. Les pétales tombent, je somnole.',
          mood: 'sleepy',
          effect: 'zzz',
          priority: true,
        })
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      if (clearTimer.current !== null) window.clearTimeout(clearTimer.current)
    }
  }, [rain, say, unlock])

  if (monsters.length === 0) return null

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[65] overflow-hidden">
      {monsters.map((monster) => {
        const Icon = MONSTERS[monster.kind]
        return (
          <Icon
            key={monster.id}
            className="komo-fall absolute -top-8 text-primary"
            style={{
              left: `${monster.left}%`,
              width: monster.size,
              height: monster.size,
              animationDelay: `${monster.delay}ms`,
              animationDuration: `${monster.duration}ms`,
            }}
          />
        )
      })}
    </div>
  )
}
