import { Resend } from 'resend'
import { z } from 'zod'
import { WelcomeEmail } from '@/features/subscribe/welcome-email'

const RATE_LIMIT = 5
const WINDOW_MS = 60_000
// why: backstop against unique-IP floods. ipHits otherwise grows forever
// (one entry per visitor) until the serverless instance recycles. At cap we
// wipe — rate-limit state is best-effort, not a security boundary.
const MAX_IPS = 10_000

const ipHits = new Map<string, number[]>()

const Body = z.object({
  email: z.email(),
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

  // why: env read at request time, not module load. Eager parsing at import
  // crashes `next build` when build-time env doesn't carry runtime secrets.
  const apiKey = process.env.RESEND_API_KEY
  const emailDomain = process.env.EMAIL_DOMAIN
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!apiKey || !emailDomain || !appUrl) {
    return Response.json({ ok: false, error: 'server_misconfigured' }, { status: 500 })
  }

  // why: SDK instantiated inside the route handler so the Resend client and
  // API key are structurally unreachable from any non-route module — no
  // accidental client-bundle inclusion via barrel re-exports.
  const resend = new Resend(apiKey)
  const email = parsed.data.email

  try {
    const existing = await resend.contacts.get({ email })
    if (existing.data) {
      return Response.json({ ok: true, alreadySubscribed: true }, { status: 200 })
    }

    const created = await resend.contacts.create({ email })
    if (created.error) {
      return Response.json({ ok: false, error: 'subscribe_failed' }, { status: 500 })
    }

    const sent = await resend.emails.send(
      {
        from: `tonex <onboarding@${emailDomain}>`,
        to: [email],
        subject: 'Welcome to tonex',
        react: <WelcomeEmail url={`${appUrl}/roadmap`} companyName="Tonex" />,
      },
      // why: idempotency key prevents duplicate sends if the route retries
      // the same request within Resend's 24h key window.
      { idempotencyKey: `welcome-email/${email}` },
    )
    if (sent.error) {
      return Response.json({ ok: false, error: 'welcome_send_failed' }, { status: 500 })
    }

    return Response.json({ ok: true, alreadySubscribed: false }, { status: 200 })
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
