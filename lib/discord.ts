/**
 * Minimal, server-only Discord OAuth2 client.
 *
 * Two flows are implemented:
 *
 * 1. `login`   — scopes `identify guilds`. Identifies the visitor so the site
 *                can greet them and remember their install list.
 * 2. `install` — scopes `bot applications.commands` + permissions. This is the
 *                real "Ajouter le bot" flow. Because we run it as an
 *                authorization-code flow (instead of a plain redirect), the
 *                token exchange response contains the `guild` the bot was just
 *                added to, which is how the server counter stays honest — no
 *                bot token and no privileged intents required.
 *
 * SECURITY: the client secret is only ever read inside this module (server
 * side). Access tokens are used for a single request and never persisted.
 */

import 'server-only'
import { sanitizeHash, sanitizeId, sanitizeText } from '@/lib/session'

const API = 'https://discord.com/api/v10'

/** Permissions requested for the bot. Explicit list instead of Administrator. */
export const BOT_PERMISSIONS = [
  'ADD_REACTIONS',
  'ATTACH_FILES',
  'BAN_MEMBERS',
  'EMBED_LINKS',
  'KICK_MEMBERS',
  'MANAGE_CHANNELS',
  'MANAGE_MESSAGES',
  'MANAGE_ROLES',
  'MODERATE_MEMBERS',
  'READ_MESSAGE_HISTORY',
  'SEND_MESSAGES',
  'VIEW_CHANNEL',
] as const

/**
 * Bitfield for the permissions above.
 * add_reactions 64 | attach_files 32768 | ban 4 | embed_links 16384 |
 * kick 2 | manage_channels 16 | manage_messages 8192 | manage_roles 268435456 |
 * moderate_members 1099511627776 | read_history 65536 | send_messages 2048 |
 * view_channel 1024
 */
export const PERMISSION_BITS = '1099780063798'

export type OAuthMode = 'login' | 'install'

export function getClientId() {
  const id = process.env.DISCORD_CLIENT_ID
  return id && /^[0-9]{5,25}$/.test(id) ? id : null
}

function getClientSecret() {
  const secret = process.env.DISCORD_CLIENT_SECRET
  return secret && secret.length >= 8 ? secret : null
}

export function isConfigured() {
  return getClientId() !== null && getClientSecret() !== null
}

/**
 * Derives the absolute origin from the incoming request.
 * Only the host Next.js actually served is used, and it is validated against a
 * strict hostname pattern so a spoofed `x-forwarded-host` cannot be turned into
 * an arbitrary redirect target.
 */
export function getOrigin(request: Request) {
  const url = new URL(request.url)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = forwardedHost ?? url.host
  if (!/^[a-zA-Z0-9.-]+(:[0-9]{1,5})?$/.test(host)) return url.origin
  const proto = host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https'
  return `${proto}://${host}`
}

export function getRedirectUri(request: Request) {
  return `${getOrigin(request)}/api/discord/callback`
}

export function buildAuthorizeUrl(options: {
  clientId: string
  redirectUri: string
  state: string
  mode: OAuthMode
}) {
  const params = new URLSearchParams({
    client_id: options.clientId,
    redirect_uri: options.redirectUri,
    response_type: 'code',
    state: options.state,
    scope: options.mode === 'install' ? 'bot applications.commands' : 'identify guilds',
  })
  if (options.mode === 'install') {
    params.set('permissions', PERMISSION_BITS)
    params.set('integration_type', '0')
    // Force the server picker every time so the counter reflects real intent.
    params.set('prompt', 'consent')
  } else {
    params.set('prompt', 'none')
  }
  return `https://discord.com/oauth2/authorize?${params.toString()}`
}

export type TokenResult = {
  guild: { id: string; name: string; icon: string | null } | null
  accessToken: string | null
}

/** Exchanges an authorization code. Returns only what we are allowed to keep. */
export async function exchangeCode(code: string, redirectUri: string): Promise<TokenResult | null> {
  const clientId = getClientId()
  const clientSecret = getClientSecret()
  if (!clientId || !clientSecret) return null

  let response: Response
  try {
    response = await fetch(`${API}/oauth2/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    })
  } catch {
    return null
  }

  if (!response.ok) return null

  let data: unknown
  try {
    data = await response.json()
  } catch {
    return null
  }
  if (!data || typeof data !== 'object') return null

  const payload = data as { access_token?: unknown; guild?: unknown }
  const accessToken = typeof payload.access_token === 'string' ? payload.access_token : null

  let guild: TokenResult['guild'] = null
  if (payload.guild && typeof payload.guild === 'object') {
    const raw = payload.guild as { id?: unknown; name?: unknown; icon?: unknown }
    const id = sanitizeId(raw.id)
    if (id) {
      guild = {
        id,
        name: sanitizeText(raw.name) || 'Serveur Discord',
        icon: sanitizeHash(raw.icon),
      }
    }
  }

  return { guild, accessToken }
}

export type DiscordUser = { id: string; name: string; avatar: string | null }

export async function fetchUser(accessToken: string): Promise<DiscordUser | null> {
  let response: Response
  try {
    response = await fetch(`${API}/users/@me`, {
      headers: { authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    })
  } catch {
    return null
  }
  if (!response.ok) return null

  let data: unknown
  try {
    data = await response.json()
  } catch {
    return null
  }
  if (!data || typeof data !== 'object') return null

  const raw = data as { id?: unknown; global_name?: unknown; username?: unknown; avatar?: unknown }
  const id = sanitizeId(raw.id)
  if (!id) return null

  return {
    id,
    name: sanitizeText(raw.global_name) || sanitizeText(raw.username) || 'Membre Discord',
    avatar: sanitizeHash(raw.avatar),
  }
}

/** Revokes the short-lived token we just used, so nothing survives the request. */
export async function revokeToken(accessToken: string) {
  const clientId = getClientId()
  const clientSecret = getClientSecret()
  if (!clientId || !clientSecret) return
  try {
    await fetch(`${API}/oauth2/token/revoke`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        token: accessToken,
        token_type_hint: 'access_token',
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
  } catch {
    // Best effort only: the token expires on its own anyway.
  }
}
