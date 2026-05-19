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

import { subscribe } from './subscribe'

const EMAIL = 'alice@example.com'
const APP_URL = 'http://localhost:3000'

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

describe('subscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('adds a new contact on first call', async () => {
    mockNotFound()
    mockCreateOk()
    mockSendOk()

    const result = await subscribe(EMAIL)

    expect(result).toEqual({ ok: true, alreadySubscribed: false })
    expect(mocks.contactsCreate).toHaveBeenCalledWith(expect.objectContaining({ email: EMAIL }))
  })

  it('returns alreadySubscribed and does not re-send welcome on duplicate', async () => {
    mocks.contactsGet.mockResolvedValue({
      data: { id: 'cont_existing', email: EMAIL },
      error: null,
    })

    const result = await subscribe(EMAIL)

    expect(result).toEqual({ ok: true, alreadySubscribed: true })
    expect(mocks.contactsCreate).not.toHaveBeenCalled()
    expect(mocks.emailsSend).not.toHaveBeenCalled()
  })

  it('maps a Resend SDK create error to a user-safe response', async () => {
    mockNotFound()
    mocks.contactsCreate.mockResolvedValue({
      data: null,
      error: { message: 'Internal error', name: 'application_error', statusCode: 500 },
    })

    const result = await subscribe(EMAIL)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(typeof result.error).toBe('string')
      expect(result.error.length).toBeGreaterThan(0)
    }
    expect(mocks.emailsSend).not.toHaveBeenCalled()
  })

  it('sends the welcome email via Resend on successful add', async () => {
    mockNotFound()
    mockCreateOk()
    mockSendOk()

    await subscribe(EMAIL)

    expect(mocks.emailsSend).toHaveBeenCalledTimes(1)
    const [payload] = mocks.emailsSend.mock.calls[0]
    expect(payload).toMatchObject({
      to: [EMAIL],
    })
    expect(typeof payload.from).toBe('string')
    expect(typeof payload.subject).toBe('string')
    expect(payload.subject.length).toBeGreaterThan(0)
    expect(typeof payload.html).toBe('string')
  })

  it('renders a roadmap link from NEXT_PUBLIC_APP_URL in the welcome email', async () => {
    mockNotFound()
    mockCreateOk()
    mockSendOk()

    await subscribe(EMAIL)

    const [payload] = mocks.emailsSend.mock.calls[0]
    expect(payload.html).toContain(`${APP_URL}/roadmap`)
  })
})
