'use client'

import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

export const CONTACT_ANCHOR_ID = 'contact-anchor'

const scrollToContact = () => {
  document.getElementById(CONTACT_ANCHOR_ID)?.scrollIntoView({ behavior: 'smooth' })
}

export function ScrollToContactButton({
  children,
  className,
  title,
}: {
  children: ReactNode
  className?: string
  title?: string
}) {
  return (
    <Button type="button" onClick={scrollToContact} className={className} title={title}>
      {children}
    </Button>
  )
}
