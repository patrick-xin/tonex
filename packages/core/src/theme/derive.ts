import { argbFromHex, Hct, hexFromArgb, MaterialDynamicColors } from '@tonex/mcu'
import { variants } from '../variants'
import type { PortableTheme, ShadcnRoleBindings } from './schema'

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

// why: bindings are data, not code — the mapping rule is now a runtime
// lookup against md emitted tokens. Mode-keyed because slice 7 will admit
// cross-mode divergence. ADR-0017.
function bindShadcn(mdLayer: TokenMap, bindings: ShadcnRoleBindings): TokenMap {
  return {
    '--primary': mdLayer[bindings['--primary']]!,
    '--primary-foreground': mdLayer[bindings['--primary-foreground']]!,
  }
}

// why: deriveTheme is THE spine. Both modes co-derive in one call so a
// second `deriveTheme` for "the other mode" cannot exist by construction.
// Source has no top-level `mode` field; mode is owned by next-themes on
// <html class="dark"> and selected via cascade. See ADR-0017.
//
// Cross-layer mapping is now driven by source.shadcnRoleBindings (per-mode).
// Default bindings (DEFAULT_SHADCN_ROLE_BINDINGS) preserve the slice-1
// hardcoded rule: shadcn primary ← md primary-container; foreground ← md
// on-primary-container. Editing the bindings flows directly to the shadcn
// layer without touching md, by construction.
export function deriveTheme(source: PortableTheme): DerivedTheme {
  const seedHct = Hct.fromInt(argbFromHex(source.seedHex))
  const variant = variants[source.variant]

  const lightScheme = variant.build(seedHct, false, 0)
  const darkScheme = variant.build(seedHct, true, 0)

  // why: override applies after MCU emit, mode-keyed (ADR-0017). on-primary-container
  // stays MCU-derived — auto-contrast against the overridden bg is slice 6+ work;
  // for now contrast is the user's responsibility when overriding.
  const overrideLight = source.md3PrimaryContainerOverride.light
  const overrideDark = source.md3PrimaryContainerOverride.dark

  const mdLight: TokenMap = {
    '--color-primary': hexFromArgb(mdc.primary().getArgb(lightScheme)),
    '--color-on-primary': hexFromArgb(mdc.onPrimary().getArgb(lightScheme)),
    '--color-primary-container':
      overrideLight ?? hexFromArgb(mdc.primaryContainer().getArgb(lightScheme)),
    '--color-on-primary-container': hexFromArgb(mdc.onPrimaryContainer().getArgb(lightScheme)),
    '--color-surface': hexFromArgb(mdc.surface().getArgb(lightScheme)),
    '--color-surface-container': hexFromArgb(mdc.surfaceContainer().getArgb(lightScheme)),
    '--color-surface-container-high': hexFromArgb(mdc.surfaceContainerHigh().getArgb(lightScheme)),
    '--color-on-surface': hexFromArgb(mdc.onSurface().getArgb(lightScheme)),
  }
  const mdDark: TokenMap = {
    '--color-primary': hexFromArgb(mdc.primary().getArgb(darkScheme)),
    '--color-on-primary': hexFromArgb(mdc.onPrimary().getArgb(darkScheme)),
    '--color-primary-container':
      overrideDark ?? hexFromArgb(mdc.primaryContainer().getArgb(darkScheme)),
    '--color-on-primary-container': hexFromArgb(mdc.onPrimaryContainer().getArgb(darkScheme)),
    '--color-surface': hexFromArgb(mdc.surface().getArgb(darkScheme)),
    '--color-surface-container': hexFromArgb(mdc.surfaceContainer().getArgb(darkScheme)),
    '--color-surface-container-high': hexFromArgb(mdc.surfaceContainerHigh().getArgb(darkScheme)),
    '--color-on-surface': hexFromArgb(mdc.onSurface().getArgb(darkScheme)),
  }

  return {
    md: { light: mdLight, dark: mdDark },
    shadcn: {
      light: bindShadcn(mdLight, source.shadcnRoleBindings.light),
      dark: bindShadcn(mdDark, source.shadcnRoleBindings.dark),
    },
    warnings: [],
  }
}
