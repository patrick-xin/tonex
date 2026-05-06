import '@/styles/globals.css'
import { domAnimation, LazyMotion } from 'motion/react'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from './_providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

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
    <html
      data-scroll-behavior="smooth"
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="md size-full relative">
        <LazyMotion features={domAnimation}>
          <Providers>
            <div className="root">{children}</div>
          </Providers>
        </LazyMotion>
      </body>
    </html>
  )
}
