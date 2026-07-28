'use client'

import { useEffect, useRef } from 'react'
import { Konami } from '@/components/fun/konami'
import { Mascot } from '@/components/fun/mascot'
import { useFun } from '@/components/fun/fun-context'

/** Mounts the mascot + keyboard easter eggs, and awards the "Explorateur" badge. */
export function FunLayer() {
  const { say, unlock, isUnlocked } = useFun()
  const awarded = useRef(false)

  useEffect(() => {
    if (isUnlocked('explorer')) return

    let frame = 0
    const check = () => {
      frame = 0
      if (awarded.current) return
      const doc = document.documentElement
      const remaining = doc.scrollHeight - doc.clientHeight - doc.scrollTop
      if (remaining > 120) return
      awarded.current = true
      unlock('explorer')
      say({
        text: 'Tu as lu la page entière. Badge Explorateur débloqué, avec le journal qui va avec.',
        mood: 'proud',
        effect: 'sparkle',
        priority: true,
      })
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(check)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [isUnlocked, say, unlock])

  return (
    <>
      <Konami />
      <Mascot />
    </>
  )
}
