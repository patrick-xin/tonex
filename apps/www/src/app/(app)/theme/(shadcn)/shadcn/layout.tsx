import type React from 'react'
import { ShadcnProvider } from './_provider'

export default function ShadcnLayout({ children }: { children: React.ReactNode }) {
  return <ShadcnProvider>{children}</ShadcnProvider>
}
