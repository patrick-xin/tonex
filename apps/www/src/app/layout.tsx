import { Toaster } from '@/components/ui/toast'
import '@/styles/globals.css'
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react'
import type { Metadata } from 'next'
import { Geist, IBM_Plex_Mono, IBM_Plex_Sans, Vidaloka } from 'next/font/google'
import { Providers } from './_providers'

const chrome = IBM_Plex_Sans({
  variable: '--font-chrome',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const mono = IBM_Plex_Mono({
  variable: '--font-mono-plex',
  subsets: ['latin'],
  weight: ['400', '500'],
})

const display = Vidaloka({
  variable: '--font-display',
  subsets: ['latin'],
  weight: '400',
})

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const siteTitle = 'Tonex — The color layer for your design system.'
const siteDescription =
  "The color layer for your design system. Built on perceptual color science. One color becomes a full, role-mapped token set - coherent in any system it's bound into."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: '%s · Tonex',
  },
  description: siteDescription,
  applicationName: 'Tonex',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'Tonex',
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
  },
}

// why: <body class="md"> sets the app default layer. The shadcn sub-scope
// is applied via <div class="shadcn"> inside the preview feature. ADR-0013.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      data-scroll-behavior="smooth"
      lang="en"
      className={`${chrome.variable} ${mono.variable} ${display.variable} ${geist.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="md size-full relative">
        <LazyMotion features={domAnimation}>
          {/* why: reducedMotion="user" makes every `m` component honor the OS
              prefers-reduced-motion setting — transform/layout animations snap to
              their target while opacity still fades. It also lets
              the e2e tier emulate reduced-motion to avoid the animating hero
              container intercepting clicks (see playwright.config.ts). */}
          <MotionConfig reducedMotion="user">
            <Providers>
              <div className="root">{children}</div>
              <Toaster />
            </Providers>
          </MotionConfig>
        </LazyMotion>
      </body>
    </html>
  )
}
