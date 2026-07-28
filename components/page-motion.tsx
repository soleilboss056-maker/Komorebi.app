'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'

/**
 * Global motion layer:
 * - a scroll progress bar pinned under the header
 * - a soft aura + `.spotlight` / `.tilt-3d` / `.magnetic` pointer tracking
 * - a click ripple
 * - a back-to-top button that fades in past the hero
 */
export function PageMotion() {
  const barRef = useRef<HTMLDivElement | null>(null)
  const auraRef = useRef<HTMLDivElement | null>(null)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      const progress = max > 0 ? Math.min(doc.scrollTop / max, 1) : 0
      barRef.current?.style.setProperty('--progress', String(progress))
      doc.dataset.scrolled = doc.scrollTop > 24 ? 'true' : 'false'
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
    if (window.matchMedia('(pointer: coarse)').matches) return

    let frame = 0
    let lastX = 0
    let lastY = 0
    let tilted: HTMLElement | null = null

    const paint = () => {
      frame = 0
      const aura = auraRef.current
      if (aura) {
        aura.style.setProperty('--cx', `${lastX}px`)
        aura.style.setProperty('--cy', `${lastY}px`)
        aura.dataset.active = 'true'
      }
    }

    const onMove = (event: PointerEvent) => {
      lastX = event.clientX
      lastY = event.clientY
      if (!frame) frame = requestAnimationFrame(paint)

      const target = event.target as HTMLElement | null

      const card = target?.closest<HTMLElement>('.spotlight')
      if (card) {
        const rect = card.getBoundingClientRect()
        card.style.setProperty('--mx', `${event.clientX - rect.left}px`)
        card.style.setProperty('--my', `${event.clientY - rect.top}px`)
      }

      const tilt = target?.closest<HTMLElement>('.tilt-3d')
      if (tilted && tilted !== tilt) {
        tilted.style.setProperty('--rx', '0deg')
        tilted.style.setProperty('--ry', '0deg')
        tilted = null
      }
      if (tilt) {
        const rect = tilt.getBoundingClientRect()
        const px = (event.clientX - rect.left) / rect.width - 0.5
        const py = (event.clientY - rect.top) / rect.height - 0.5
        tilt.style.setProperty('--rx', `${px * 8}deg`)
        tilt.style.setProperty('--ry', `${-py * 8}deg`)
        tilted = tilt
      }

      // Magnetic buttons drift toward the cursor when it comes close.
      for (const node of document.querySelectorAll<HTMLElement>('.magnetic')) {
        const rect = node.getBoundingClientRect()
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dx = event.clientX - cx
        const dy = event.clientY - cy
        const distance = Math.hypot(dx, dy)
        const radius = Math.max(rect.width, rect.height) + 90
        if (distance < radius) {
          const pull = (1 - distance / radius) * 12
          node.style.setProperty('--mgx', `${(dx / distance) * pull}px`)
          node.style.setProperty('--mgy', `${(dy / distance) * pull}px`)
        } else {
          node.style.setProperty('--mgx', '0px')
          node.style.setProperty('--mgy', '0px')
        }
      }
    }

    const onLeave = () => {
      const aura = auraRef.current
      if (aura) aura.dataset.active = 'false'
    }

    const onClick = (event: PointerEvent) => {
      const ripple = document.createElement('span')
      ripple.className = 'ripple'
      ripple.style.left = `${event.clientX}px`
      ripple.style.top = `${event.clientY}px`
      document.body.appendChild(ripple)
      ripple.addEventListener('animationend', () => ripple.remove())
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onClick, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onClick)
      document.removeEventListener('pointerleave', onLeave)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <>
      <div ref={auraRef} aria-hidden="true" className="cursor-aura" data-active="false" />

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
