'use client'

import { useEffect, useRef, useState } from 'react'
import { Egg, X } from 'lucide-react'
import { EGG_MESSAGE } from '@/lib/fun-data'
import { useFun } from '@/components/fun/fun-context'

/**
 * A tiny, barely visible clickable egg hidden in a section corner.
 * Opens a dialog with a static message from the creator.
 */
export function HiddenEgg({ className }: { className?: string }) {
  const { say, unlock } = useFun()
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        data-mascot-key="egg"
        onClick={() => {
          setOpen(true)
          unlock('egg')
          say({
            text: 'L’œuf caché ! Tu es le genre de personne qui fouille les coins. Respect.',
            mood: 'party',
            effect: 'sparkle',
            priority: true,
          })
        }}
        aria-label="Œuf secret caché"
        className={`komo-egg group absolute z-10 grid size-6 place-items-center rounded-full opacity-25 transition-all duration-500 hover:scale-125 hover:opacity-100 focus-visible:scale-125 focus-visible:opacity-100 focus-visible:outline-none ${className ?? ''}`}
      >
        <Egg className="size-3.5 text-[oklch(0.78_0.17_350)]" aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={EGG_MESSAGE.title}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-background/85 px-4 backdrop-blur-md"
        >
          <div className="komo-pop w-full max-w-sm rounded-2xl border border-primary/30 bg-card p-6 shadow-2xl shadow-primary/20">
            <span className="flex size-11 items-center justify-center rounded-xl bg-[oklch(0.73_0.2_350/0.15)] text-[oklch(0.78_0.17_350)]">
              <Egg className="size-5 animate-bob" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-base font-bold">{EGG_MESSAGE.title}</h3>
            <div className="mt-3 space-y-2.5">
              {EGG_MESSAGE.lines.map((line) => (
                <p key={line} className="text-pretty text-xs leading-relaxed text-muted-foreground">
                  {line}
                </p>
              ))}
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform duration-200 active:scale-95"
            >
              <X className="size-4" aria-hidden="true" />
              Refermer le secret
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
