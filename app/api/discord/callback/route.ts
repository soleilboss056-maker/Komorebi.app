import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { exchangeCode, fetchUser, getOrigin, getRedirectUri, revokeToken } from '@/lib/discord'
import { clientKey, rateLimit } from '@/lib/rate-limit'
import {
  MAX_INSTALLS,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  STATE_COOKIE,
  cookieOptions,
  createExpiry,
  hasAuthSecret,
  normalizeSession,
  signPayload,
  verifyPayload,
  type OAuthState,
  type Session,
} from '@/lib/session'

export const dynamic = 'force-dynamic'

/** Only ever redirect to a path on our own origin — no open redirects. */
function home(request: Request, status: string) {
  const target = new URL('/', getOrigin(request))
  target.searchParams.set('komo', status)
  target.hash = 'console'
  return NextResponse.redirect(target.toString(), 303)
}

export async function GET(request: Request) {
  const limit = rateLimit(`callback:${clientKey(request)}`, 20, 60_000)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'retry-after': String(limit.retryAfter) } },
    )
  }

  if (!hasAuthSecret()) return home(request, 'config')

  const url = new URL(request.url)
  const store = await cookies()

  // The state cookie is single-use, whatever happens next.
  const cookieState = store.get(STATE_COOKIE)?.value
  store.delete(STATE_COOKIE)

  if (url.searchParams.get('error')) return home(request, 'denied')

  const code = url.searchParams.get('code') ?? ''
  const returnedState = url.searchParams.get('state') ?? ''
  if (!code || code.length > 512 || !/^[A-Za-z0-9_-]+$/.test(code)) return home(request, 'invalid')
  if (!cookieState || returnedState !== cookieState) return home(request, 'state')

  const state = await verifyPayload<OAuthState>(cookieState)
  if (!state || state.exp * 1000 < Date.now()) return home(request, 'state')
  const mode = state.mode === 'install' ? 'install' : 'login'

  const result = await exchangeCode(code, getRedirectUri(request))
  if (!result) return home(request, 'exchange')

  const current = normalizeSession(await verifyPayload<Session>(store.get(SESSION_COOKIE)?.value))

  let next: Session | null = null
  let status = mode === 'install' ? 'installed' : 'connected'

  if (mode === 'install') {
    if (!result.accessToken) return home(request, 'exchange')
    await revokeToken(result.accessToken)

    if (!result.guild) return home(request, 'noguild')
    // Anonymous visitors get a local-only session so the counter still works.
    const base: Session =
      current ??
      ({
        uid: '0'.repeat(6),
        name: 'Invité',
        avatar: null,
        installs: [],
        exp: createExpiry(SESSION_MAX_AGE),
      } satisfies Session)

    const already = base.installs.some((entry) => entry.id === result.guild!.id)
    if (already) {
      status = 'already'
      next = { ...base, exp: createExpiry(SESSION_MAX_AGE) }
    } else {
      next = {
        ...base,
        exp: createExpiry(SESSION_MAX_AGE),
        installs: [
          ...base.installs,
          { ...result.guild, at: Math.floor(Date.now() / 1000) },
        ].slice(-MAX_INSTALLS),
      }
    }
  } else {
    if (!result.accessToken) return home(request, 'exchange')
    const user = await fetchUser(result.accessToken)
    await revokeToken(result.accessToken)
    if (!user) return home(request, 'exchange')

    next = {
      uid: user.id,
      name: user.name,
      avatar: user.avatar,
      // Keep installs recorded before signing in, unless another account owns them.
      installs: current && (current.uid === user.id || current.uid === '000000') ? current.installs : [],
      exp: createExpiry(SESSION_MAX_AGE),
    }
  }

  const signed = await signPayload(next)
  if (!signed) return home(request, 'config')
  store.set(SESSION_COOKIE, signed, { ...cookieOptions, maxAge: SESSION_MAX_AGE })

  return home(request, status)
}
