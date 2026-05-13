import { SHADCN_ROLE_NAMES, type ShadcnRoleBindings } from '@tonex/core/schema'
import type { PresetBundle } from './bundle-snapshot'

// why: emits a fixture-entry literal pasteable directly into the
// PRESET_FIXTURES array in fixtures.ts. Bindings are pretty-printed one
// role per line in canonical SHADCN_ROLE_NAMES order so successive copies
// of the same bundle are byte-stable — easy to diff between presets in a
// text editor. String quoting uses single quotes (project style).
//
// Format is the fixture entry — not a standalone `export const` — because
// during the curation phase the durable artifact is the fixture file, and
// `export const SHADCN_PRESETS = [...]` in core happens later via the
// engineering slice.
export function formatFixtureEntry(name: string, bundle: PresetBundle): string {
  const lines: string[] = []
  lines.push(`{`)
  lines.push(`  name: '${escapeSingleQuotes(name || 'unnamed')}',`)
  lines.push(`  bundle: {`)
  lines.push(`    variant: '${bundle.variant}',`)
  lines.push(`    surfaceAlgo: '${bundle.surfaceAlgo}',`)
  lines.push(`    surfacePaletteName: '${bundle.surfacePaletteName}',`)
  lines.push(
    `    surfaceTintLevel: { light: ${bundle.surfaceTintLevel.light}, dark: ${bundle.surfaceTintLevel.dark} },`,
  )
  lines.push(
    `    surfaceDesaturateLevel: { light: ${bundle.surfaceDesaturateLevel.light}, dark: ${bundle.surfaceDesaturateLevel.dark} },`,
  )
  lines.push(`    shadcnRoleBindings: {`)
  lines.push(`      light: ${formatBindings(bundle.shadcnRoleBindings.light, 6)},`)
  lines.push(`      dark: ${formatBindings(bundle.shadcnRoleBindings.dark, 6)},`)
  lines.push(`    },`)
  lines.push(`  },`)
  lines.push(`},`)
  return lines.join('\n')
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

export function formatCopyOutput(name: string, bundle: PresetBundle): string {
  const header = `// Preset: ${name || '(unnamed)'}`
  const entry = formatFixtureEntry(name, bundle)
  return `${header}\n${entry}\n`
}
