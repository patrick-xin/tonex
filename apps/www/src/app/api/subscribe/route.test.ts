import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  contactsGet: vi.fn(),
  contactsCreate: vi.fn(),
  emailsSend: vi.fn(),
}))

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    contacts: { get: mocks.contactsGet, create: mocks.contactsCreate },
    emails: { send: mocks.emailsSend },
  })),
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

function mockNotFound() {
  mocks.contactsGet.mockResolvedValue({
    data: null,
    error: { message: 'Contact not found', name: 'not_found', statusCode: 404 },
  })
}
function mockCreateOk() {
  mocks.contactsCreate.mockResolvedValue({ data: { id: 'cont_123' }, error: null })
}
function mockSendOk() {
  mocks.emailsSend.mockResolvedValue({ data: { id: 'email_456' }, error: null })
}

describe('POST /api/subscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNotFound()
    mockCreateOk()
    mockSendOk()
  })

  it('returns 200 and creates the contact on a valid request', async () => {
    const res = await POST(makeRequest({ email: 'alice@example.com' }, '10.0.0.1'))

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toMatchObject({ ok: true, alreadySubscribed: false })
    expect(mocks.contactsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'alice@example.com' }),
    )
  })

  it('returns alreadySubscribed and skips create/send when the contact exists', async () => {
    mocks.contactsGet.mockResolvedValue({
      data: { id: 'cont_existing', email: 'alice@example.com' },
      error: null,
    })

    const res = await POST(makeRequest({ email: 'alice@example.com' }, '10.0.0.2'))

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ ok: true, alreadySubscribed: true })
    expect(mocks.contactsCreate).not.toHaveBeenCalled()
    expect(mocks.emailsSend).not.toHaveBeenCalled()
  })

  it('sends the welcome email with a Tonex-branded from-address and idempotency key', async () => {
    await POST(makeRequest({ email: 'alice@example.com' }, '10.0.0.3'))

    expect(mocks.emailsSend).toHaveBeenCalledTimes(1)
    const [payload, options] = mocks.emailsSend.mock.calls[0]
    expect(payload.from).toMatch(/^tonex <onboarding@resend\.dev>$/)
    expect(payload.to).toEqual(['alice@example.com'])
    expect(payload.subject).toBe('Welcome to tonex')
    expect(payload.react.props.url).toBe('http://localhost:3000/roadmap')
    expect(options).toEqual({ idempotencyKey: 'welcome-email/alice@example.com' })
  })

  it('returns 400 and does NOT call resend when the email is invalid', async () => {
    const res = await POST(makeRequest({ email: 'not-an-email' }, '10.0.0.4'))

    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.ok).toBe(false)
    expect(typeof json.error).toBe('string')
    expect(mocks.contactsGet).not.toHaveBeenCalled()
  })

  it('returns 200 silently and does NOT call resend when the honeypot field is filled', async () => {
    const res = await POST(
      makeRequest({ email: 'bot@example.com', website: 'http://spam.example' }, '10.0.0.5'),
    )

    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.ok).toBe(true)
    expect(mocks.contactsGet).not.toHaveBeenCalled()
  })

  it('maps a contacts.create error to subscribe_failed and skips the welcome send', async () => {
    mocks.contactsCreate.mockResolvedValue({
      data: null,
      error: { message: 'Internal error', name: 'application_error', statusCode: 500 },
    })

    const res = await POST(makeRequest({ email: 'alice@example.com' }, '10.0.0.6'))

    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json).toEqual({ ok: false, error: 'subscribe_failed' })
    expect(mocks.emailsSend).not.toHaveBeenCalled()
  })

  it('maps an emails.send error to welcome_send_failed', async () => {
    mocks.emailsSend.mockResolvedValue({
      data: null,
      error: { message: 'fail', name: 'application_error', statusCode: 500 },
    })

    const res = await POST(makeRequest({ email: 'alice@example.com' }, '10.0.0.7'))

    expect(res.status).toBe(500)
    const json = await res.json()
    expect(json).toEqual({ ok: false, error: 'welcome_send_failed' })
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
