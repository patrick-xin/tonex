import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'tonex',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="md">{children}</body>
    </html>
  )
}
