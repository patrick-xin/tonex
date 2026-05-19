import { z } from 'zod'
import { subscribe } from '@/features/subscribe'

const RATE_LIMIT = 5
const WINDOW_MS = 60_000
// why: backstop against unique-IP floods. ipHits otherwise grows forever
// (one entry per visitor) until the serverless instance recycles. At cap we
// wipe — rate-limit state is best-effort, not a security boundary.
const MAX_IPS = 10_000

const ipHits = new Map<string, number[]>()

const Body = z.object({
  email: z.string().email(),
  // why: honeypot field. Humans don't fill it (hidden via CSS, aria-hidden,
  // tabIndex=-1); bots that auto-fill all inputs do. When present we
  // 200-silently so the bot can't probe to learn the trigger.
  website: z.string().optional(),
})

export async function POST(req: Request) {
  if (!checkAndRecord(getIp(req))) {
    return Response.json({ ok: false, error: 'rate_limited' }, { status: 429 })
  }

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

  if (parsed.data.website) {
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

function checkAndRecord(ip: string): boolean {
  const now = Date.now()
  const fresh = (ipHits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (fresh.length >= RATE_LIMIT) {
    ipHits.set(ip, fresh)
    return false
  }
  fresh.push(now)
  ipHits.set(ip, fresh)
  if (ipHits.size > MAX_IPS) ipHits.clear()
  return true
}
