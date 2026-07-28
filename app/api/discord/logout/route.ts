import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getOrigin } from '@/lib/discord'
import { clientKey, rateLimit } from '@/lib/rate-limit'
import { SESSION_COOKIE, STATE_COOKIE, cookieOptions } from '@/lib/session'

export const dynamic = 'force-dynamic'

/**
 * Clears the session. POST-only, and the request must come from our own origin
 * with the `x-komo-intent` header — a cross-site form post cannot do either, so
 * the endpoint is CSRF-safe without needing a token round-trip.
 */
export async function POST(request: Request) {
  const limit = rateLimit(`logout:${clientKey(request)}`, 20, 60_000)
  if (!limit.ok) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  if (request.headers.get('x-komo-intent') !== 'logout') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const origin = request.headers.get('origin')
  if (origin && origin !== getOrigin(request)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const store = await cookies()
  store.set(SESSION_COOKIE, '', { ...cookieOptions, maxAge: 0 })
  store.set(STATE_COOKIE, '', { ...cookieOptions, maxAge: 0 })

  return NextResponse.json({ ok: true }, { headers: { 'cache-control': 'no-store' } })
}
