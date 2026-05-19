import { z } from 'zod'

const EnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required'),
  EMAIL_DOMAIN: z.string().min(1, 'EMAIL_DOMAIN is required'),
})

// why: parsed eagerly at module import so misconfiguration surfaces at server
// boot, not at first request under launch traffic. Do not import this module
// from client components — RESEND_* and EMAIL_DOMAIN are undefined in client
// bundles and the parse will throw.
export const env = EnvSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_DOMAIN: process.env.EMAIL_DOMAIN,
})
