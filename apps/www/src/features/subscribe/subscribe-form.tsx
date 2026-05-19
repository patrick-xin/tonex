'use client'

import { Loader2 } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldControl, FieldError, FieldLabel } from '@/components/ui/field'
import { Form } from '@/components/ui/form'

type Status = 'idle' | 'submitting' | 'success'

type SubscribeResponse = { ok: true; alreadySubscribed?: boolean } | { ok: false; error: string }

export function SubscribeForm() {
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [status, setStatus] = React.useState<Status>('idle')
  const [alreadySubscribed, setAlreadySubscribed] = React.useState(false)

  if (status === 'success') {
    return (
      <p className="text-sm text-on-surface-variant">
        {alreadySubscribed
          ? "You're already on the list — thanks for double-checking."
          : 'Thanks. Check your inbox for a welcome note.'}
      </p>
    )
  }

  return (
    <Form
      errors={errors}
      onSubmit={async (event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const email = formData.get('email') as string
        const website = formData.get('website') as string
        setErrors({})
        setStatus('submitting')

        const response = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email, website }),
        })
        const data = (await response.json()) as SubscribeResponse

        if (data.ok) {
          setAlreadySubscribed(Boolean(data.alreadySubscribed))
          setStatus('success')
          return
        }

        setErrors({ email: humanizeError(data.error) })
        setStatus('idle')
      }}
    >
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <FieldControl autoComplete="email" placeholder="you@example.com" required type="email" />
        <FieldError />
      </Field>
      {/* why: honeypot — humans don't fill it (hidden from view + AT, keyboard
          skipped); bots that auto-fill all inputs by name do. Server treats
          a non-empty value as a silent reject. */}
      <input
        aria-hidden="true"
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        name="website"
        tabIndex={-1}
        type="text"
      />
      <Button disabled={status === 'submitting'} isLoading={status === 'submitting'} type="submit">
        {status === 'submitting' && <Loader2 className="size-4 animate-spin" />} Notify me
      </Button>
    </Form>
  )
}

function humanizeError(code: string): string {
  if (code === 'invalid_email') return 'Please enter a valid email.'
  if (code === 'rate_limited') return 'Too many tries — wait a moment and try again.'
  return 'Something went wrong. Please try again.'
}
