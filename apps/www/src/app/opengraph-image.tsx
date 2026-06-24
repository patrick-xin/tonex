import { ImageResponse } from 'next/og'
import { SITE_CONFIG } from '@/lib/site-config'

// why: ships the OG/Twitter card image the metadata already declares
// (card: 'summary_large_image'). Co-located at the app root so Next auto-wires
// it as the default openGraph + twitter image. Dependency-free (system fonts).
export const alt = 'Tonex — a colour-authoring engine'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        background: '#0a0a0a',
        color: '#fafafa',
      }}
    >
      <div style={{ fontSize: 128, fontWeight: 700, letterSpacing: '-0.04em' }}>
        {SITE_CONFIG.brand}
      </div>
      <div
        style={{
          marginTop: 24,
          fontSize: 44,
          lineHeight: 1.25,
          color: '#a1a1aa',
          maxWidth: 900,
        }}
      >
        The color layer for your design system.
      </div>
    </div>,
    size,
  )
}
