import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { SITE_CONFIG } from '@/lib/site-config'

export const alt = 'Tonex — the color layer for your design system'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Brand typefaces, read from disk so the route has no build-time network dependency. Vidaloka is the site's --font-display; IBM Plex Sans is --font-chrome.
const FONTS_DIR = join(process.cwd(), 'public', 'fonts')

const colors = {
  primary: '#cec6b6',
  'on-primary': '#454034',
  surface: '#0f0e0c',
  'on-surface': '#eae4df',
  'surface-container': '#1b1917',
  'on-surface-variant': '#afaaa5',
  'outline-variant': '#4a4744',
} as const

const hexToRgba = (hex: string, alpha: number) => {
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const Crosshair = ({ style }: { style?: React.CSSProperties }) => {
  const lineCol = colors['outline-variant']
  return (
    <div
      style={{
        position: 'absolute',
        width: 16,
        height: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 1,
          height: 16,
          backgroundColor: lineCol,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 16,
          height: 1,
          backgroundColor: lineCol,
        }}
      />
    </div>
  )
}

export default async function OpengraphImage() {
  const [vidaloka, plex] = await Promise.all([
    readFile(join(FONTS_DIR, 'Vidaloka-Regular.ttf')),
    readFile(join(FONTS_DIR, 'IBMPlexSans-Regular.ttf')),
  ])

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 60,
        background: colors.surface,
        fontFamily: 'Plex Sans',
        color: colors['on-surface'],
        position: 'relative',
      }}
    >
      {/* Bounding Frame (20px inset border) */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          right: 20,
          bottom: 20,
          display: 'flex',
        }}
      >
        {/* Shimmer Borders */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundImage: `linear-gradient(to right, transparent, ${hexToRgba(colors.primary, 0.25)}, transparent)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundImage: `linear-gradient(to right, transparent, ${hexToRgba(colors.primary, 0.25)}, transparent)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            width: 1,
            backgroundImage: `linear-gradient(to bottom, transparent, ${hexToRgba(colors.primary, 0.25)}, transparent)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            width: 1,
            backgroundImage: `linear-gradient(to bottom, transparent, ${hexToRgba(colors.primary, 0.25)}, transparent)`,
          }}
        />
      </div>

      {/* Crosshairs centered at the corners of the 40px bounding frame */}
      <Crosshair style={{ top: 16, left: 16 }} />
      <Crosshair style={{ top: 16, right: 16 }} />
      <Crosshair style={{ bottom: 16, left: 16 }} />
      <Crosshair style={{ bottom: 16, right: 16 }} />

      {/* Content Top */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          width: '100%',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            position: 'relative',
            padding: 12,
          }}
        >
          <svg width={62} height={74} viewBox="0 0 116 138" fill={colors.primary}>
            <path d="M116 0L90 2L45 82L77 138L101 137L73 81Z M10 27L21 56L0 95L25 96L49 54L33 28Z" />
          </svg>
        </div>
      </div>

      {/* Content Bottom */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            fontFamily: 'Vidaloka',
            fontSize: 200,
            lineHeight: 0.9,
            letterSpacing: '-0.01em',
            color: colors.primary,
          }}
        >
          {SITE_CONFIG.brand}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 32,
            lineHeight: 1.35,
            color: colors['on-surface-variant'],
            maxWidth: 400,
            textAlign: 'right',
            paddingBottom: '1rem',
          }}
        >
          The color layer for your design system
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Vidaloka', data: vidaloka, weight: 400, style: 'normal' },
        { name: 'Plex Sans', data: plex, weight: 400, style: 'normal' },
      ],
    },
  )
}
