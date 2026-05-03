import { argbFromHex, Hct, hexFromArgb, MaterialDynamicColors } from '@tonex/mcu'
import { variants } from '../variants'
import type { PortableTheme } from './schema'

// TODO(slice 2): emit OKLCH instead of hex. shadcn v4 + Tailwind v4 conventions
// expect oklch(...) values; hex is the slice-1 placeholder. Migration also
// requires re-baselining globals.css and the drift-guard.

export type TokenMap = Record<string, string>

export interface ResolvedLayer {
  light: TokenMap
  dark: TokenMap
}

export interface DerivedTheme {
  md: ResolvedLayer
  shadcn: ResolvedLayer
  warnings: string[]
}

const mdc = new MaterialDynamicColors()

// why: deriveTheme is THE spine. Both modes co-derive in one call so a
// second `deriveTheme` for "the other mode" cannot exist by construction.
// Source has no top-level `mode` field; mode is owned by next-themes on
// <html class="dark"> and selected via cascade. See ADR-0017.
//
// Cross-layer mapping rule (slice-2 spike, fixed for now):
//   shadcn.--primary            ← md.--color-primary-container
//   shadcn.--primary-foreground ← md.--color-on-primary-container
// shadcn primary is a brand-accent role; md's primary-container pairs with
// on-primary-container as the natural "filled surface" tonal pair, which
// reads closer to shadcn's solid-button conventions than md.primary does.
// This mapping is the unit-of-verification for the slice 2 visual spike;
// real role mapping (user-overridable bindings) is slice 6+.
export function deriveTheme(source: PortableTheme): DerivedTheme {
  const seedHct = Hct.fromInt(argbFromHex(source.seedHex))
  const variant = variants[source.variant]

  const lightScheme = variant.build(seedHct, false, 0)
  const darkScheme = variant.build(seedHct, true, 0)

  const mdLight: TokenMap = {
    '--color-primary': hexFromArgb(mdc.primary().getArgb(lightScheme)),
    '--color-on-primary': hexFromArgb(mdc.onPrimary().getArgb(lightScheme)),
    '--color-primary-container': hexFromArgb(mdc.primaryContainer().getArgb(lightScheme)),
    '--color-on-primary-container': hexFromArgb(mdc.onPrimaryContainer().getArgb(lightScheme)),
  }
  const mdDark: TokenMap = {
    '--color-primary': hexFromArgb(mdc.primary().getArgb(darkScheme)),
    '--color-on-primary': hexFromArgb(mdc.onPrimary().getArgb(darkScheme)),
    '--color-primary-container': hexFromArgb(mdc.primaryContainer().getArgb(darkScheme)),
    '--color-on-primary-container': hexFromArgb(mdc.onPrimaryContainer().getArgb(darkScheme)),
  }

  return {
    md: { light: mdLight, dark: mdDark },
    shadcn: {
      light: {
        '--primary': mdLight['--color-primary-container']!,
        '--primary-foreground': mdLight['--color-on-primary-container']!,
      },
      dark: {
        '--primary': mdDark['--color-primary-container']!,
        '--primary-foreground': mdDark['--color-on-primary-container']!,
      },
    },
    warnings: [],
  }
}
