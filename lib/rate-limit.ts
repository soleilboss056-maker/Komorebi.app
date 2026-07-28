/**
 * Tiny in-memory fixed-window rate limiter for the OAuth routes.
 *
 * It is intentionally dependency-free and per-instance: the goal is only to
 * stop a single client from hammering the Discord token endpoint (or spinning
 * the callback in a loop). Anything stronger belongs in a shared store.
 */

import 'server-only'

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()
const MAX_KEYS = 5000

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()

  // Opportunistic cleanup keeps the map from growing without bound.
  if (buckets.size > MAX_KEYS) {
    for (const [entryKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(entryKey)
    }
    if (buckets.size > MAX_KEYS) buckets.clear()
  }

  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfter: 0 }
  }

  bucket.count += 1
  if (bucket.count > limit) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) }
  }
  return { ok: true, retryAfter: 0 }
}

/** Best-effort client identifier. Never trusted for anything but throttling. */
export function clientKey(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
  return ip.slice(0, 64)
}
