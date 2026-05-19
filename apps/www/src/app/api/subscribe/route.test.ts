import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  subscribe: vi.fn(),
}))

vi.mock('@/features/subscribe', () => ({
  subscribe: mocks.subscribe,
}))

import { POST } from './route'

function makeRequest(body: unknown, ip = '1.2.3.4'): Request {
  return new Request('http://localhost:3000/api/subscribe', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  })
}

describe('POST /api/subscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.subscribe.mockResolvedValue({ ok: true, alreadySubscribed: false })
  })

  it('returns 200 and calls subscribe() with the parsed email on a valid request', async () => {
    const res = await POST(makeRequest({ email: 'alice@example.com' }, '10.0.0.1'))

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toMatchObject({ ok: true })
    expect(mocks.subscribe).toHaveBeenCalledWith('alice@example.com')
  })

  it('returns 400 and does NOT call subscribe() when the email is invalid', async () => {
    const res = await POST(makeRequest({ email: 'not-an-email' }, '10.0.0.2'))

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.ok).toBe(false)
    expect(typeof json.error).toBe('string')
    expect(mocks.subscribe).not.toHaveBeenCalled()
  })

  it('returns 200 and does NOT call subscribe() when the honeypot field is filled', async () => {
    const res = await POST(
      makeRequest({ email: 'bot@example.com', website: 'http://spam.example' }, '10.0.0.3'),
    )

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(mocks.subscribe).not.toHaveBeenCalled()
  })

  it('rate-limits repeated requests from the same IP with a 429 response', async () => {
    const ip = '9.9.9.9'

    for (let i = 0; i < 5; i++) {
      const res = await POST(makeRequest({ email: `a${i}@example.com` }, ip))
      expect(res.status).toBe(200)
    }

    const limited = await POST(makeRequest({ email: 'flood@example.com' }, ip))
    expect(limited.status).toBe(429)
    const json = await limited.json()
    expect(json.ok).toBe(false)
  })
})
