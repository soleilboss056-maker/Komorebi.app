'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { Effect, Mood, SecretId } from '@/lib/fun-data'

export type MascotMessage = {
  text: string
  mood: Mood
  effect?: Effect
  follow?: { text: string; mood: Mood; effect?: Effect }
  /** Bumped on every call so the mascot can react to repeated messages. */
  nonce: number
  /** Priority messages (easter eggs) are never overridden by hover chatter. */
  priority: boolean
}

type FunValue = {
  unlocked: readonly SecretId[]
  isUnlocked: (id: SecretId) => boolean
  unlock: (id: SecretId) => void
  message: MascotMessage | null
  say: (message: Omit<MascotMessage, 'nonce' | 'priority'> & { priority?: boolean }) => void
}

const FunContext = createContext<FunValue | null>(null)

export function FunProvider({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<SecretId[]>([])
  const [message, setMessage] = useState<MascotMessage | null>(null)
  const nonce = useRef(0)

  const unlock = useCallback((id: SecretId) => {
    setUnlocked((current) => (current.includes(id) ? current : [...current, id]))
  }, [])

  const say = useCallback<FunValue['say']>((next) => {
    nonce.current += 1
    setMessage({ ...next, priority: next.priority ?? false, nonce: nonce.current })
  }, [])

  const value = useMemo<FunValue>(
    () => ({
      unlocked,
      isUnlocked: (id: SecretId) => unlocked.includes(id),
      unlock,
      message,
      say,
    }),
    [unlocked, unlock, message, say],
  )

  return <FunContext.Provider value={value}>{children}</FunContext.Provider>
}

export function useFun() {
  const context = useContext(FunContext)
  if (!context) throw new Error('useFun doit être utilisé à l’intérieur de <FunProvider>')
  return context
}
