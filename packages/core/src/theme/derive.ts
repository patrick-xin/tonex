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

// why: MaterialDynamicColors is intentionally namespaced (Google's tslint
// disable comment in the source). One instance is sufficient — methods are
// stateless given a scheme.
const mdc = new MaterialDynamicColors()

// why: deriveTheme is THE spine. Both modes co-derive in one call so a
// second `deriveTheme` for "the other mode" cannot exist by construction.
// Source has no top-level `mode` field; mode is owned by next-themes on
// <html class="dark"> and selected via cascade. See ADR-0017.
//
// Slice 1 emits one md token (--color-primary) and one shadcn token
// (--primary). Both source from MCU's primary role; the proper md→shadcn
// role mapping (preset-level) lands in slice 6+.
export function deriveTheme(source: PortableTheme): DerivedTheme {
  const seedHct = Hct.fromInt(argbFromHex(source.seedHex))
  const variant = variants[source.variant]

  const lightScheme = variant.build(seedHct, false, 0)
  const darkScheme = variant.build(seedHct, true, 0)

  const primaryLight = hexFromArgb(mdc.primary().getArgb(lightScheme))
  const primaryDark = hexFromArgb(mdc.primary().getArgb(darkScheme))

  return {
    md: {
      light: { '--color-primary': primaryLight },
      dark: { '--color-primary': primaryDark },
    },
    shadcn: {
      light: { '--primary': primaryLight },
      dark: { '--primary': primaryDark },
    },
    warnings: [],
  }
}
