'use client'

import { useEffect, useRef, useState } from 'react'
import { Gavel, Hand, PartyPopper, X } from 'lucide-react'
import { useFun } from '@/components/fun/fun-context'

/**
 * A purely decorative "do not click" button.
 * The fake ban is a temporary visual state only: nothing is stored, nothing is
 * sent, it auto-cancels after a few seconds and can be dismissed at any time
 * with the button or the Escape key.
 */
export function TrapButton() {
  const { say, unlock } = useFun()
  const [phase, setPhase] = useState<'idle' | 'banning' | 'saved'>('idle')
  const timers = useRef<number[]>([])
  const cancelRef = useRef<HTMLButtonElement | null>(null)

  const clearTimers = () => {
    for (const id of timers.current) window.clearTimeout(id)
    timers.current = []
  }

  const reset = () => {
    clearTimers()
    setPhase('idle')
  }

  const start = () => {
    clearTimers()
    setPhase('banning')
    say({
      text: 'Tu as cliqué. Évidemment que tu as cliqué. Bon, je lance un faux ban.',
      mood: 'shocked',
      priority: true,
    })

    timers.current.push(
      window.setTimeout(() => {
        setPhase('saved')
        unlock('trap')
      }, 3200),
    )
    timers.current.push(window.setTimeout(() => setPhase('idle'), 8200))
  }

  useEffect(() => clearTimers, [])

  useEffect(() => {
    if (phase === 'idle') return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') reset()
    }
    window.addEventListener('keydown', onKey)
    cancelRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [phase])

  return (
    <>
      <button
        type="button"
        onClick={start}
        data-mascot-key="trap"
        className="group inline-flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-xs font-semibold text-destructive transition-all duration-300 hover:border-destructive/70 hover:bg-destructive/20 active:scale-95"
      >
        <Hand
          className="size-4 transition-transform duration-300 group-hover:animate-wiggle"
          aria-hidden="true"
        />
        Ne pas cliquer
      </button>

      {phase !== 'idle' ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={phase === 'banning' ? 'Faux bannissement en cours' : 'Bannissement annulé'}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-background/85 px-4 backdrop-blur-md"
        >
          <div className="komo-pop w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-2xl">
            {phase === 'banning' ? (
              <>
                <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                  <Gavel className="size-6 animate-wiggle [animation-iteration-count:infinite]" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-bold text-destructive">
                  Bannissement en cours...
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Motif : « a cliqué sur un bouton qui disait très clairement de ne pas cliquer ».
                </p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="komo-ban-bar h-full rounded-full bg-destructive" />
                </div>
                <p className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground">
                  Aucune donnée n’est envoyée. C’est du théâtre.
                </p>
              </>
            ) : (
              <>
                <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <PartyPopper className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-bold">Ban annulé !</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Komorebi ne bannit jamais les curieux. Tu gagnes le badge « Survivant du faux ban »
                  et une actualité secrète.
                </p>
              </>
            )}

            <button
              ref={cancelRef}
              type="button"
              onClick={reset}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform duration-200 active:scale-95"
            >
              <X className="size-4" aria-hidden="true" />
              {phase === 'banning' ? 'Annuler le ban' : 'Fermer'}
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
