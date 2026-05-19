import { Resend } from 'resend'
import { env } from './env'

// why: SDK singleton — instantiated once per server process so HTTP connections
// aren't churned per request. Imported only by features/subscribe and any
// future server-side email tooling.
export const resend = new Resend(env.RESEND_API_KEY)
