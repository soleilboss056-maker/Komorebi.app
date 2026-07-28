import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import {
  buildAuthorizeUrl,
  getClientId,
  getRedirectUri,
  isConfigured,
  type OAuthMode,
} from '@/lib/discord'
import { clientKey, rateLimit } from '@/lib/rate-limit'
import {
  STATE_COOKIE,
  STATE_MAX_AGE,
  cookieOptions,
  createExpiry,
  hasAuthSecret,
  randomNonce,
  signPayload,
  type OAuthState,
} from '@/lib/session'

export const dynamic = 'force-dynamic'

/**
 * Kicks off either OAuth flow.
 *   /api/discord/start?mode=login    → identify the visitor
 *   /api/discord/start?mode=install  → add the bot to one of their servers
 *
 * A signed, single-use `state` nonce is stored in an httpOnly cookie and
 * verified in the callback, which is what makes the flow CSRF-proof.
 */
export async function GET(request: Request) {
  const limit = rateLimit(`start:${clientKey(request)}`, 12, 60_000)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'retry-after': String(limit.retryAfter) } },
    )
  }

  const url = new URL(request.url)
  const requested = url.searchParams.get('mode')
  const mode: OAuthMode = requested === 'install' ? 'install' : 'login'

  const clientId = getClientId()
  if (!clientId || !isConfigured() || !hasAuthSecret()) {
    return NextResponse.redirect(`${new URL('/', request.url).toString()}?komo=config`, 303)
  }

  const nonce = randomNonce()
  const state: OAuthState = { mode, nonce, exp: createExpiry(STATE_MAX_AGE) }
  const signed = await signPayload(state)
  if (!signed) {
    return NextResponse.redirect(`${new URL('/', request.url).toString()}?komo=config`, 303)
  }

  const authorizeUrl = buildAuthorizeUrl({
    clientId,
    redirectUri: getRedirectUri(request),
    state: signed,
    mode,
  })

  const store = await cookies()
  store.set(STATE_COOKIE, signed, { ...cookieOptions, maxAge: STATE_MAX_AGE })

  return NextResponse.redirect(authorizeUrl, 303)
}
