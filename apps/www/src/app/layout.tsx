import type { Metadata } from 'next'
import { Providers } from './_providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'tonex',
}

// why: <body class="md"> sets the app default layer. The shadcn sub-scope
// is applied via <div class="shadcn"> inside the preview feature. ADR-0013.
//
// suppressHydrationWarning on <html> is required by next-themes — it adds
// the `class` attribute on mount, which would otherwise trigger a React
// hydration warning. The mismatch is intentional; the warning is not.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="md">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
