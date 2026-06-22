import { Toaster } from '@/components/ui/toast'
import '@/styles/globals.css'
import { domAnimation, LazyMotion, MotionConfig } from 'motion/react'
import type { Metadata } from 'next'
import { Geist, IBM_Plex_Mono, IBM_Plex_Sans, Vidaloka } from 'next/font/google'
import { Providers } from './_providers'

// why: four named type roles. Chrome (Plex Sans) is the app default UI/body
// sans — it feeds --font-sans in tonex.css. Mono (Plex Mono) is the universal
// numerals/code face (--font-mono). Voice (Vidaloka) is the display serif,
// applied to landing headlines only (see (site)/layout.tsx). Geist stays the
// shadcn-preview sans — its face loads here so it's available, but it's only
// *applied* inside the .shadcn scope (globals.css), where the preview should
// read like real shadcn rather than the tonex chrome.
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
const siteTitle = 'tonex — Pro-grade color tools, made for the web'
const siteDescription =
  'Pro-grade color tools, made for the web. Real HCT math, per-role pins, and contrast audited across every token pair — ship to Material Design and shadcn from one source.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: '%s · tonex',
  },
  description: siteDescription,
  applicationName: 'tonex',
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
    siteName: 'tonex',
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
//
// suppressHydrationWarning on <html> is required by next-themes — it adds
// the `class` attribute on mount, which would otherwise trigger a React
// hydration warning. The mismatch is intentional; the warning is not.
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
