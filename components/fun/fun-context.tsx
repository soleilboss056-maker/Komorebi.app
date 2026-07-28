'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import useSWR from 'swr'
import type { Effect, Gesture, Mood, SecretId } from '@/lib/fun-data'
import { SECRET_IDS } from '@/lib/fun-data'
import { LEVEL_UP_LINES, MISSIONS, MISSION_IDS, levelFor, type MissionId } from '@/lib/missions'

export type MascotMessage = {
  text: string
  mood: Mood
  effect?: Effect
  gesture?: Gesture
  follow?: { text: string; mood: Mood; effect?: Effect; gesture?: Gesture }
  /** Bumped on every call so the mascot can react to repeated messages. */
  nonce: number
  /** Priority messages (easter eggs) are never overridden by hover chatter. */
  priority: boolean
  /** Optional visible duration override, in ms. */
  duration?: number
}

/** Display-safe account info coming from the signed server session. */
export type Account = { name: string; avatarUrl: string | null }
export type Install = { id: string; name: string; iconUrl: string | null; at: number }

type SessionPayload = {
  configured: boolean
  account: Account | null
  installs: Install[]
}

type Counters = Record<MissionId, number>

type FunValue = {
  unlocked: readonly SecretId[]
  isUnlocked: (id: SecretId) => boolean
  unlock: (id: SecretId) => void
  message: MascotMessage | null
  say: (message: Omit<MascotMessage, 'nonce' | 'priority'> & { priority?: boolean }) => void

  /** Mission board. */
  counters: Counters
  bump: (id: MissionId, amount?: number) => void
  noteButton: (key: string) => void
  isDone: (id: MissionId) => boolean
  xp: number
  level: ReturnType<typeof levelFor>

  /** Discord session (server-verified). */
  account: Account | null
  installs: Install[]
  configured: boolean
  sessionLoading: boolean
  refreshSession: () => void
  logout: () => Promise<void>
}

const FunContext = createContext<FunValue | null>(null)

const STORAGE_KEY = 'komo-progress-v2'

const EMPTY_COUNTERS = MISSION_IDS.reduce((acc, id) => {
  acc[id] = 0
  return acc
}, {} as Counters)

async function fetcher(url: string): Promise<SessionPayload> {
  const response = await fetch(url, { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error('session')
  return (await response.json()) as SessionPayload
}

/** Reads persisted progress defensively: any malformed value is discarded. */
function readStored(): { counters: Counters; unlocked: SecretId[]; buttons: string[] } {
  const fallback = { counters: { ...EMPTY_COUNTERS }, unlocked: [] as SecretId[], buttons: [] as string[] }
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return fallback
    const value = parsed as { counters?: unknown; unlocked?: unknown; buttons?: unknown }

    const counters = { ...EMPTY_COUNTERS }
    if (value.counters && typeof value.counters === 'object') {
      for (const id of MISSION_IDS) {
        const raw = (value.counters as Record<string, unknown>)[id]
        if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0) {
          counters[id] = Math.min(999, Math.floor(raw))
        }
      }
    }

    const unlocked = Array.isArray(value.unlocked)
      ? (value.unlocked.filter((id) => SECRET_IDS.includes(id as SecretId)) as SecretId[])
      : []

    const buttons = Array.isArray(value.buttons)
      ? value.buttons.filter((key): key is string => typeof key === 'string').slice(0, 80)
      : []

    return { counters, unlocked, buttons }
  } catch {
    return fallback
  }
}

export function FunProvider({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<SecretId[]>([])
  const [counters, setCounters] = useState<Counters>(EMPTY_COUNTERS)
  const [message, setMessage] = useState<MascotMessage | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const nonce = useRef(0)
  const buttons = useRef<Set<string>>(new Set())
  const lastLevel = useRef(1)

  const { data, isLoading, mutate } = useSWR<SessionPayload>('/api/discord/me', fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 0,
    shouldRetryOnError: false,
  })

  const account = data?.account ?? null
  const installs = useMemo(() => data?.installs ?? [], [data])
  const configured = data?.configured ?? false

  const say = useCallback<FunValue['say']>((next) => {
    nonce.current += 1
    setMessage({ ...next, priority: next.priority ?? false, nonce: nonce.current })
  }, [])

  /* -------- persistence -------- */

  useEffect(() => {
    const stored = readStored()
    buttons.current = new Set(stored.buttons)
    setUnlocked(stored.unlocked)
    setCounters(stored.counters)
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ counters, unlocked, buttons: Array.from(buttons.current) }),
      )
    } catch {
      // Storage can be unavailable (private mode, quota) — progress is cosmetic.
    }
  }, [counters, unlocked, hydrated])

  /* -------- secrets -------- */

  const unlock = useCallback((id: SecretId) => {
    setUnlocked((current) => (current.includes(id) ? current : [...current, id]))
  }, [])

  // The "secrets" mission mirrors the number of unlocked secrets.
  useEffect(() => {
    setCounters((current) =>
      current.secrets === unlocked.length ? current : { ...current, secrets: unlocked.length },
    )
  }, [unlocked.length])

  /* -------- missions -------- */

  const bump = useCallback((id: MissionId, amount = 1) => {
    const mission = MISSIONS.find((entry) => entry.id === id)
    if (!mission || mission.verified) return
    setCounters((current) => {
      const next = Math.min(mission.goal, current[id] + amount)
      if (next === current[id]) return current
      return { ...current, [id]: next }
    })
  }, [])

  const noteButton = useCallback(
    (key: string) => {
      if (buttons.current.has(key) || buttons.current.size >= 80) return
      buttons.current.add(key)
      setCounters((current) => {
        const goal = MISSIONS.find((entry) => entry.id === 'buttons')!.goal
        const next = Math.min(goal, buttons.current.size)
        if (next === current.buttons) return current
        return { ...current, buttons: next }
      })
    },
    [],
  )

  /** Server-verified missions override anything stored locally. */
  const effective = useMemo<Counters>(
    () => ({
      ...counters,
      install: Math.min(MISSIONS.find((m) => m.id === 'install')!.goal, installs.length),
      connect: account ? 1 : 0,
      secrets: unlocked.length,
    }),
    [counters, installs.length, account, unlocked.length],
  )

  const isDone = useCallback(
    (id: MissionId) => {
      const mission = MISSIONS.find((entry) => entry.id === id)
      if (!mission) return false
      return effective[id] >= mission.goal
    },
    [effective],
  )

  const xp = useMemo(
    () => MISSIONS.reduce((sum, m) => (effective[m.id] >= m.goal ? sum + m.xp : sum), 0),
    [effective],
  )

  const level = useMemo(() => levelFor(xp), [xp])

  // Komo announces her own promotions, once each.
  useEffect(() => {
    if (!hydrated) return
    if (level.level <= lastLevel.current) {
      lastLevel.current = level.level
      return
    }
    lastLevel.current = level.level
    const line = LEVEL_UP_LINES[level.level]
    if (line) {
      say({ text: line, mood: 'proud', effect: 'sparkle', gesture: 'flex', priority: true, duration: 6500 })
    }
  }, [level.level, hydrated, say])

  /* -------- session actions -------- */

  const refreshSession = useCallback(() => {
    void mutate()
  }, [mutate])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/discord/logout', {
        method: 'POST',
        headers: { 'x-komo-intent': 'logout' },
      })
    } catch {
      // Ignored: the UI revalidates either way.
    }
    await mutate()
  }, [mutate])

  const value = useMemo<FunValue>(
    () => ({
      unlocked,
      isUnlocked: (id: SecretId) => unlocked.includes(id),
      unlock,
      message,
      say,
      counters: effective,
      bump,
      noteButton,
      isDone,
      xp,
      level,
      account,
      installs,
      configured,
      sessionLoading: isLoading,
      refreshSession,
      logout,
    }),
    [
      unlocked,
      unlock,
      message,
      say,
      effective,
      bump,
      noteButton,
      isDone,
      xp,
      level,
      account,
      installs,
      configured,
      isLoading,
      refreshSession,
      logout,
    ],
  )

  return <FunContext.Provider value={value}>{children}</FunContext.Provider>
}

export function useFun() {
  const context = useContext(FunContext)
  if (!context) throw new Error('useFun doit être utilisé à l’intérieur de <FunProvider>')
  return context
}
