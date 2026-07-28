'use client'

import { useEffect, useRef, useState } from 'react'
import { Activity, Languages, Server, Users } from 'lucide-react'

const stats = [
  { icon: Users, target: 10000, prefix: '', suffix: '+', label: 'Membres protégés', accent: false },
  { icon: Server, target: 50, prefix: '', suffix: '+', label: 'Serveurs Discord', accent: true },
  {
    icon: Activity,
    target: 15,
    prefix: '< ',
    suffix: ' ms',
    label: 'Latence passerelle',
    accent: false,
  },
  {
    icon: Languages,
    target: 8,
    prefix: '',
    suffix: '+ Langues',
    label: 'Traduction instantanée',
    accent: true,
  },
]

function useCountUp(target: number, start: boolean, duration = 1400) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!start) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target)
      return
    }

    let frame = 0
    const begin = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - begin) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, start, duration])

  return value
}

function StatItem({
  icon: Icon,
  target,
  prefix,
  suffix,
  label,
  accent,
  start,
  index,
}: {
  icon: typeof Users
  target: number
  prefix: string
  suffix: string
  label: string
  accent: boolean
  start: boolean
  index: number
}) {
  const value = useCountUp(target, start)

  return (
    <div
      data-visible={start ? 'true' : 'false'}
      style={{ ['--reveal-delay' as string]: `${index * 90}ms` }}
      className="reveal group flex flex-col items-center gap-2 text-center"
    >
      <Icon
        className={
          accent
            ? 'size-6 text-accent transition-transform duration-300 group-hover:scale-125'
            : 'size-6 text-primary transition-transform duration-300 group-hover:scale-125'
        }
        aria-hidden="true"
      />
      <p className="text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">
        {prefix}
        {value.toLocaleString('fr-FR')}
        {suffix}
      </p>
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
    </div>
  )
}

export function Stats() {
  const ref = useRef<HTMLElement | null>(null)
  const [start, setStart] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setStart(true)
            observer.disconnect()
          }
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      id="statistiques"
      className="relative border-b border-border/60 bg-card/30 overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,oklch(0.61_0.25_302/0.6),transparent)]"
      />
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-10 px-4 py-16 md:grid-cols-4">
        {stats.map((stat, index) => (
          <StatItem key={stat.label} {...stat} start={start} index={index} />
        ))}
      </div>
    </section>
  )
}
