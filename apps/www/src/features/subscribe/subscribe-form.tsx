'use client'

import { Loader2 } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldControl, FieldError, FieldLabel } from '@/components/ui/field'
import { Form } from '@/components/ui/form'

type State =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; alreadySubscribed: boolean }

type SubscribeResponse = { ok: true; alreadySubscribed?: boolean } | { ok: false; error: string }

export function SubscribeForm() {
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [state, setState] = React.useState<State>({ kind: 'idle' })

  if (state.kind === 'success') {
    return (
      <p className="text-sm text-on-surface-variant">
        {state.alreadySubscribed
          ? "You're already on the list — thanks for double-checking."
          : 'Thanks. Check your inbox for a welcome note.'}
      </p>
    )
  }

  const submitting = state.kind === 'submitting'

  return (
    <Form
      errors={errors}
      onSubmit={async (event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const email = formData.get('email') as string
        const website = formData.get('website') as string
        setErrors({})
        setState({ kind: 'submitting' })

        const response = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email, website }),
        })
        const data = (await response.json()) as SubscribeResponse

        if (data.ok) {
          setState({ kind: 'success', alreadySubscribed: Boolean(data.alreadySubscribed) })
          return
        }

        setErrors({ email: humanizeError(data.error) })
        setState({ kind: 'idle' })
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
      <Button disabled={submitting} isLoading={submitting} type="submit">
        {submitting && <Loader2 className="size-4 animate-spin" />} Notify me
      </Button>
    </Form>
  )
}

function humanizeError(code: string): string {
  if (code === 'invalid_email') return 'Please enter a valid email.'
  if (code === 'rate_limited') return 'Too many tries — wait a moment and try again.'
  return 'Something went wrong. Please try again.'
}
