import { z } from 'zod'
import { subscribe } from '@/features/subscribe'

const RATE_LIMIT = 5
const WINDOW_MS = 60_000

// why: per-IP best-effort throttle. In serverless this is per-instance, not
// global — sufficient for launch-traffic flood protection but not a security
// boundary. PRD ships this and reconsiders Turnstile if first 100 captures
// show bot pollution.
const ipHits = new Map<string, number[]>()

const Body = z.object({
  email: z.string().email(),
  // why: honeypot field — humans don't fill it in (hidden via CSS in the form);
  // bots that auto-fill all inputs will. When present we 200-silently so we
  // don't tell the bot it got caught.
  website: z.string().optional(),
})

export async function POST(req: Request) {
  const ip = getIp(req)
  if (isRateLimited(ip)) {
    return Response.json({ ok: false, error: 'rate_limited' }, { status: 429 })
  }
  recordHit(ip)

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return Response.json({ ok: false, error: 'invalid_body' }, { status: 400 })
  }

  const parsed = Body.safeParse(raw)
  if (!parsed.success) {
    return Response.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  }

  if (parsed.data.website && parsed.data.website.length > 0) {
    return Response.json({ ok: true }, { status: 200 })
  }

  try {
    const result = await subscribe(parsed.data.email)
    if (!result.ok) {
      return Response.json({ ok: false, error: result.error }, { status: 500 })
    }
    return Response.json({ ok: true, alreadySubscribed: result.alreadySubscribed }, { status: 200 })
  } catch {
    return Response.json({ ok: false, error: 'server_error' }, { status: 500 })
  }
}

function getIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

function isRateLimited(ip: string): boolean {
  const hits = ipHits.get(ip) ?? []
  const now = Date.now()
  const fresh = hits.filter((t) => now - t < WINDOW_MS)
  return fresh.length >= RATE_LIMIT
}

function recordHit(ip: string) {
  const hits = ipHits.get(ip) ?? []
  const now = Date.now()
  const fresh = hits.filter((t) => now - t < WINDOW_MS)
  fresh.push(now)
  ipHits.set(ip, fresh)
}
