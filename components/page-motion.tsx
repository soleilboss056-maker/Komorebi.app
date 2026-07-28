'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'

/**
 * Global motion layer:
 * - a scroll progress bar pinned under the header
 * - cursor tracking so every `.spotlight` card lights up under the pointer
 * - a back-to-top button that fades in past the hero
 */
export function PageMotion() {
  const barRef = useRef<HTMLDivElement | null>(null)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      const progress = max > 0 ? Math.min(doc.scrollTop / max, 1) : 0
      barRef.current?.style.setProperty('--progress', String(progress))
      setShowTop(doc.scrollTop > doc.clientHeight * 0.9)
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (window.matchMedia('(hover: none)').matches) return

    const onMove = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      const card = target?.closest<HTMLElement>('.spotlight')
      if (!card) return
      const rect = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`)
      card.style.setProperty('--my', `${event.clientY - rect.top}px`)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden"
      >
        <div
          ref={barRef}
          className="scroll-progress h-full w-full bg-[linear-gradient(90deg,oklch(0.61_0.25_302),oklch(0.73_0.2_350),oklch(0.8_0.13_185))]"
        />
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Revenir en haut de la page"
        className={
          showTop
            ? 'fixed bottom-6 right-6 z-50 flex size-11 items-center justify-center rounded-full border border-primary/40 bg-card/85 text-primary shadow-xl shadow-primary/20 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-primary/70 hover:shadow-primary/40 active:scale-90'
            : 'pointer-events-none fixed bottom-6 right-6 z-50 flex size-11 translate-y-4 items-center justify-center rounded-full border border-primary/40 bg-card/85 text-primary opacity-0 shadow-xl backdrop-blur-xl transition-all duration-500'
        }
      >
        <ArrowUp className="size-5" aria-hidden="true" />
      </button>
    </>
  )
}
