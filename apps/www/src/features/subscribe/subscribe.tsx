import { render } from '@react-email/components'
import { env } from '@/lib/env'
import { resend } from '@/lib/resend-client'
import { WelcomeEmail } from './welcome-email'

export type SubscribeResult =
  | { ok: true; alreadySubscribed: boolean }
  | { ok: false; error: string }

const FROM = `${env.EMAIL_DOMAIN}>`

export async function subscribe(email: string): Promise<SubscribeResult> {
  const existing = await resend.contacts.get({ email })
  if (existing.data) {
    return { ok: true, alreadySubscribed: true }
  }

  const created = await resend.contacts.create({
    email,
  })
  if (created.error) {
    return { ok: false, error: 'subscribe_failed' }
  }

  const html = await render(<WelcomeEmail roadmapUrl={`${env.NEXT_PUBLIC_APP_URL}/roadmap`} />)

  const sent = await resend.emails.send(
    {
      from: FROM,
      to: [email],
      subject: 'Welcome to tonex',
      html,
    },
    // why: idempotency key prevents duplicate sends if the route retries the
    // same request within Resend's 24h key window (see resend skill best practices).
    { idempotencyKey: `welcome-email/${email}` },
  )
  if (sent.error) {
    return { ok: false, error: 'welcome_send_failed' }
  }

  return { ok: true, alreadySubscribed: false }
}
