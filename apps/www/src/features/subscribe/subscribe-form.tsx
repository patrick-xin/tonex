'use client'

import { Loader2 } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldControl, FieldError, FieldLabel } from '@/components/ui/field'
import { Form } from '@/components/ui/form'
import { toast } from '@/components/ui/toast'

type SubscribeResponse = { ok: true; alreadySubscribed?: boolean } | { ok: false; error: string }

export function SubscribeForm() {
  const [submitting, setSubmitting] = React.useState(false)

  return (
    <Form
      validationMode="onSubmit"
      onSubmit={async (event) => {
        event.preventDefault()
        const form = event.currentTarget
        const formData = new FormData(form)
        const email = formData.get('email') as string
        const website = formData.get('website') as string
        setSubmitting(true)

        try {
          const response = await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email, website }),
          })
          const data = (await response.json()) as SubscribeResponse

          if (data.ok) {
            toast.success({
              title: data.alreadySubscribed
                ? "You're already on the list"
                : 'Thanks — check your inbox',
              description: data.alreadySubscribed
                ? 'Thanks for double-checking.'
                : 'A welcome note is on the way.',
            })
            form.reset()
          } else {
            toast.error({ title: humanizeError(data.error) })
          }
        } finally {
          setSubmitting(false)
        }
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
