'use client'

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  as?: ElementType
  id?: string
  /** Direction / style of the entrance animation. */
  variant?: 'up' | 'left' | 'right' | 'zoom' | 'blur'
}

export function Reveal({ children, className, delay = 0, as, id, variant = 'up' }: RevealProps) {
  const Tag = (as ?? 'div') as ElementType
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // Safety net: if IntersectionObserver is unavailable (or never fires because
    // the element is taller than the viewport), always show the content.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        }
      },
      // threshold 0 so very tall blocks (which can never reach 15% visibility on
      // small screens) still reveal themselves.
      { threshold: 0, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(node)

    const fallback = window.setTimeout(() => setVisible(true), 2500)

    return () => {
      window.clearTimeout(fallback)
      observer.disconnect()
    }
  }, [])

  return (
    <Tag
      ref={ref}
      id={id}
      data-visible={visible ? 'true' : 'false'}
      data-variant={variant}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
      className={cn('reveal', className)}
    >
      {children}
    </Tag>
  )
}
