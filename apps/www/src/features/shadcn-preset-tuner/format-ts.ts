import { SHADCN_ROLE_NAMES, type ShadcnRoleBindings } from '@tonex/core/schema'
import type { PresetBundle } from './bundle-snapshot'

// why: emits a `SHADCN_PRESETS` record entry pasteable directly into
// packages/core/src/theme/shadcn-presets.ts — the durable artifact since the
// engineering slice promoted the library to core. The curated source inputs
// (seed + contrastLevel, ADR-0031 #2) lead the entry exactly as the core file
// orders them; the seed is emitted as a `seedOf('#hex')` call so it reads back
// through the same canonical construction path (ADR-0028). Bindings are
// pretty-printed one role per line in canonical SHADCN_ROLE_NAMES order so
// successive copies of the same preset are byte-stable and diff cleanly.
// Indentation matches the core file's nesting (key at 2, fields at 4) so the
// block drops in without reformatting. String quoting uses single quotes
// (project style).
export function formatPresetEntry(
  name: string,
  seedHex: string,
  contrastLevel: number,
  bundle: PresetBundle,
): string {
  const lines: string[] = []
  lines.push(`  ${formatKey(name)}: {`)
  lines.push(`    seed: seedOf('${seedHex}'),`)
  lines.push(`    contrastLevel: ${contrastLevel},`)
  lines.push(`    variant: '${bundle.variant}',`)
  lines.push(`    surfaceAlgo: '${bundle.surfaceAlgo}',`)
  lines.push(`    surfacePaletteName: '${bundle.surfacePaletteName}',`)
  lines.push(
    `    surfaceTintLevel: { light: ${bundle.surfaceTintLevel.light}, dark: ${bundle.surfaceTintLevel.dark} },`,
  )
  lines.push(
    `    surfaceTintTextLevel: { light: ${bundle.surfaceTintTextLevel.light}, dark: ${bundle.surfaceTintTextLevel.dark} },`,
  )
  lines.push(
    `    surfaceDesaturateLevel: { light: ${bundle.surfaceDesaturateLevel.light}, dark: ${bundle.surfaceDesaturateLevel.dark} },`,
  )
  lines.push(`    shadcnRoleBindings: {`)
  lines.push(`      light: ${formatBindings(bundle.shadcnRoleBindings.light, 6)},`)
  lines.push(`      dark: ${formatBindings(bundle.shadcnRoleBindings.dark, 6)},`)
  lines.push(`    },`)
  lines.push(`  },`)
  return lines.join('\n')
}

// why: the record key is bare when it's a valid JS identifier (the common
// case — `default`, `warm`) and single-quoted only when the curator types
// something that wouldn't parse as one, so the emitted entry is always valid.
function formatKey(name: string): string {
  const trimmed = name.trim() || 'unnamed'
  return /^[A-Za-z_$][\w$]*$/.test(trimmed) ? trimmed : `'${escapeSingleQuotes(trimmed)}'`
}

function formatBindings(bindings: ShadcnRoleBindings, indent: number): string {
  const pad = ' '.repeat(indent)
  const innerPad = ' '.repeat(indent + 2)
  const lines: string[] = ['{']
  for (const role of SHADCN_ROLE_NAMES) {
    lines.push(`${innerPad}'${role}': '${bindings[role]}',`)
  }
  lines.push(`${pad}}`)
  return lines.join('\n')
}

function escapeSingleQuotes(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

export function formatCopyOutput(
  name: string,
  seedHex: string,
  contrastLevel: number,
  bundle: PresetBundle,
): string {
  const header = `// Preset: ${name || '(unnamed)'} — paste into SHADCN_PRESETS (packages/core/src/theme/shadcn-presets.ts)`
  const entry = formatPresetEntry(name, seedHex, contrastLevel, bundle)
  return `${header}\n${entry}\n`
}

// why: emits a `SHADCN_BINDING_PRESETS` record entry (binding-presets.ts) — the
// binding-only sibling of formatPresetEntry. A binding preset is pure routing
// (ADR-0031 #1): no seed, contrast, variant, or surface, just the role→token
// map plus a user-facing `description`. Same key/quote/indent rules and same
// canonical SHADCN_ROLE_NAMES ordering so successive copies are byte-stable.
export function formatBindingPresetEntry(
  name: string,
  description: string,
  bindings: { light: ShadcnRoleBindings; dark: ShadcnRoleBindings },
): string {
  const lines: string[] = []
  lines.push(`  ${formatKey(name)}: {`)
  lines.push(`    description: '${escapeSingleQuotes(description.trim())}',`)
  lines.push(`    shadcnRoleBindings: {`)
  lines.push(`      light: ${formatBindings(bindings.light, 6)},`)
  lines.push(`      dark: ${formatBindings(bindings.dark, 6)},`)
  lines.push(`    },`)
  lines.push(`  },`)
  return lines.join('\n')
}

export function formatBindingPresetCopyOutput(
  name: string,
  description: string,
  bindings: { light: ShadcnRoleBindings; dark: ShadcnRoleBindings },
): string {
  const header = `// Binding preset: ${name || '(unnamed)'} — paste into SHADCN_BINDING_PRESETS (packages/core/src/theme/binding-presets.ts)`
  const entry = formatBindingPresetEntry(name, description, bindings)
  return `${header}\n${entry}\n`
}
