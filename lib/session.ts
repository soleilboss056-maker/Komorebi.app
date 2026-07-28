/**
 * Signed, stateless cookie sessions (HMAC-SHA256, Web Crypto only — no deps).
 *
 * SECURITY MODEL
 * --------------
 * - The payload is *signed*, never encrypted: it must therefore never contain
 *   a secret. We deliberately store only the Discord user id / username /
 *   avatar hash and the list of guilds the bot was installed into. Discord
 *   access & refresh tokens are used once server-side during the OAuth code
 *   exchange and then dropped on the floor — they never touch a cookie.
 * - Cookies are `httpOnly`, `sameSite=lax` (required so the OAuth redirect can
 *   carry them back), `secure` in production and scoped to `/`.
 * - Every payload embeds an expiry which is checked *after* the signature is
 *   verified, and signature comparison is constant-time.
 * - `AUTH_SECRET` is required. If it is missing we fail closed (no session at
 *   all) instead of falling back to an unsigned/guessable secret.
 */

import 'server-only'

export const SESSION_COOKIE = 'komo_session'
export const STATE_COOKIE = 'komo_oauth_state'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days
export const STATE_MAX_AGE = 60 * 10 // 10 minutes

/** Hard cap so a hostile client can never grow the cookie without bound. */
export const MAX_INSTALLS = 60

export type InstalledGuild = {
  /** Discord snowflake. */
  id: string
  /** Guild name, already sanitized to printable characters. */
  name: string
  /** Icon hash (not a URL) or null. */
  icon: string | null
  /** Unix seconds. */
  at: number
}

export type Session = {
  /** Discord user id (snowflake). */
  uid: string
  /** Discord username, sanitized. */
  name: string
  /** Avatar hash (not a URL) or null. */
  avatar: string | null
  /** Guilds the bot was installed into through this browser. */
  installs: InstalledGuild[]
  /** Unix seconds. */
  exp: number
}

export type OAuthState = {
  /** Which flow this state belongs to. */
  mode: 'login' | 'install'
  /** Random nonce, compared with the value round-tripped by Discord. */
  nonce: string
  /** Unix seconds. */
  exp: number
}

/* ------------------------------------------------------------------ *
 * Primitives                                                          *
 * ------------------------------------------------------------------ */

function toBase64Url(bytes: Uint8Array) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4))
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return bytes
}

function getSecret() {
  const secret = process.env.AUTH_SECRET
  // Fail closed: a short secret is treated as no secret at all.
  if (!secret || secret.length < 16) return null
  return secret
}

let keyPromise: Promise<CryptoKey> | null = null

function getKey() {
  const secret = getSecret()
  if (!secret) return null
  if (!keyPromise) {
    keyPromise = crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify'],
    )
  }
  return keyPromise
}

/** Constant-time comparison of two base64url strings. */
function timingSafeEqual(a: string, b: string) {
  const left = new TextEncoder().encode(a)
  const right = new TextEncoder().encode(b)
  // Compare a fixed number of bytes so the length itself does not leak timing.
  const length = Math.max(left.length, right.length)
  let diff = left.length ^ right.length
  for (let index = 0; index < length; index += 1) {
    diff |= (left[index] ?? 0) ^ (right[index] ?? 0)
  }
  return diff === 0
}

/** `<base64url(json)>.<base64url(hmac)>` */
export async function signPayload(payload: unknown): Promise<string | null> {
  const key = await getKey()
  if (!key) return null
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)))
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  return `${body}.${toBase64Url(new Uint8Array(mac))}`
}

export async function verifyPayload<T>(token: string | undefined | null): Promise<T | null> {
  if (!token || token.length > 8192) return null
  const dot = token.indexOf('.')
  if (dot <= 0 || dot === token.length - 1) return null
  if (token.indexOf('.', dot + 1) !== -1) return null

  const body = token.slice(0, dot)
  const signature = token.slice(dot + 1)
  if (!/^[A-Za-z0-9_-]+$/.test(body) || !/^[A-Za-z0-9_-]+$/.test(signature)) return null

  const key = await getKey()
  if (!key) return null

  const expected = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  if (!timingSafeEqual(signature, toBase64Url(new Uint8Array(expected)))) return null

  try {
    return JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as T
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ *
 * Domain helpers                                                      *
 * ------------------------------------------------------------------ */

const SNOWFLAKE = /^[0-9]{5,25}$/
const HASH = /^[a-zA-Z0-9_]{1,64}$/

/** Strips control characters and clamps the length of untrusted display text. */
export function sanitizeText(value: unknown, max = 80) {
  if (typeof value !== 'string') return ''
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f-\u009f]/g, '').trim().slice(0, max)
}

export function sanitizeId(value: unknown) {
  return typeof value === 'string' && SNOWFLAKE.test(value) ? value : ''
}

export function sanitizeHash(value: unknown) {
  return typeof value === 'string' && HASH.test(value) ? value : null
}

/** Revalidates a decoded session: shape, expiry and per-field sanitation. */
export function normalizeSession(raw: unknown): Session | null {
  if (!raw || typeof raw !== 'object') return null
  const value = raw as Partial<Session>
  const uid = sanitizeId(value.uid)
  if (!uid) return null
  if (typeof value.exp !== 'number' || value.exp * 1000 < Date.now()) return null

  const seen = new Set<string>()
  const installs: InstalledGuild[] = []
  if (Array.isArray(value.installs)) {
    for (const entry of value.installs) {
      if (!entry || typeof entry !== 'object') continue
      const id = sanitizeId((entry as InstalledGuild).id)
      if (!id || seen.has(id)) continue
      seen.add(id)
      installs.push({
        id,
        name: sanitizeText((entry as InstalledGuild).name) || 'Serveur Discord',
        icon: sanitizeHash((entry as InstalledGuild).icon),
        at:
          typeof (entry as InstalledGuild).at === 'number'
            ? (entry as InstalledGuild).at
            : Math.floor(Date.now() / 1000),
      })
      if (installs.length >= MAX_INSTALLS) break
    }
  }

  return {
    uid,
    name: sanitizeText(value.name) || 'Membre Discord',
    avatar: sanitizeHash(value.avatar),
    installs,
    exp: value.exp,
  }
}

export function createExpiry(seconds: number) {
  return Math.floor(Date.now() / 1000) + seconds
}

export function randomNonce() {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(24)))
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
}

export function hasAuthSecret() {
  return getSecret() !== null
}
