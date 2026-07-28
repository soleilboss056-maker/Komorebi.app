import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { isConfigured } from '@/lib/discord'
import { clientKey, rateLimit } from '@/lib/rate-limit'
import {
  SESSION_COOKIE,
  hasAuthSecret,
  normalizeSession,
  verifyPayload,
  type Session,
} from '@/lib/session'

export const dynamic = 'force-dynamic'

/**
 * Read-only view of the current session, consumed by the client console.
 * Only display-safe fields are returned; the avatar is rebuilt into a URL here
 * from the hash so the client never has to concatenate untrusted strings.
 */
export async function GET(request: Request) {
  const limit = rateLimit(`me:${clientKey(request)}`, 90, 60_000)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'retry-after': String(limit.retryAfter) } },
    )
  }

  const store = await cookies()
  const session = normalizeSession(await verifyPayload<Session>(store.get(SESSION_COOKIE)?.value))

  const body = {
    configured: isConfigured() && hasAuthSecret(),
    account:
      session && session.uid !== '000000'
        ? {
            name: session.name,
            avatarUrl: session.avatar
              ? `https://cdn.discordapp.com/avatars/${session.uid}/${session.avatar}.png?size=64`
              : null,
          }
        : null,
    installs: (session?.installs ?? []).map((entry) => ({
      id: entry.id,
      name: entry.name,
      iconUrl: entry.icon
        ? `https://cdn.discordapp.com/icons/${entry.id}/${entry.icon}.png?size=64`
        : null,
      at: entry.at,
    })),
  }

  return NextResponse.json(body, {
    headers: { 'cache-control': 'no-store, max-age=0' },
  })
}
