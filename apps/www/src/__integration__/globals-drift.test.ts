import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deriveTheme, formatCss } from '@tonex/core'
import { DEFAULT_INPUTS } from '@tonex/core/schema'
import { describe, expect, it } from 'vitest'

// why: globals.css ships first-paint defaults baked from
// deriveTheme(DEFAULT_INPUTS). If formatter shape, default seed, or token
// names ever drift between the runtime renderer and the baked file, preview
// will diverge from export — the failure mode this redesign exists to
// prevent. ADR-0017.
//
// Token-by-token comparison is the user's choice over text equality so the
// test survives biome/prettier reformats but still catches value drift.
//
// To regenerate after intentional changes: `pnpm bake`.

const here = dirname(fileURLToPath(import.meta.url))
const cssPath = join(here, '../styles/globals.css')

function extractTokenBlock(css: string): string {
  const m = css.match(/\/\* tonex:tokens:start[^*]*\*\/\n([\s\S]*?)\n\/\* tonex:tokens:end \*\//)
  if (!m) {
    throw new Error(
      'tonex:tokens markers not found in globals.css — has the file been hand-edited?',
    )
  }
  return m[1] ?? ''
}

function parseBlocks(css: string): Record<string, Record<string, string>> {
  const blocks: Record<string, Record<string, string>> = {}
  for (const match of css.matchAll(/([^{}]+?)\s*\{([^}]+)\}/g)) {
    const selector = match[1]?.trim() ?? ''
    const body = match[2] ?? ''
    const decls: Record<string, string> = {}
    for (const decl of body.split(';')) {
      const trimmed = decl.trim()
      if (!trimmed) continue
      const colon = trimmed.indexOf(':')
      if (colon < 0) continue
      decls[trimmed.slice(0, colon).trim()] = trimmed.slice(colon + 1).trim()
    }
    blocks[selector] = decls
  }
  return blocks
}

describe('globals.css drift-guard', () => {
  it('matches formatCss(deriveTheme(DEFAULT_INPUTS)) by parsed tokens', () => {
    const fileTokens = parseBlocks(extractTokenBlock(readFileSync(cssPath, 'utf-8')))
    const expectedTokens = parseBlocks(formatCss(deriveTheme(DEFAULT_INPUTS)))

    expect(fileTokens).toEqual(expectedTokens)
  })

  it('contains all four scope blocks', () => {
    const fileTokens = parseBlocks(extractTokenBlock(readFileSync(cssPath, 'utf-8')))
    expect(Object.keys(fileTokens).sort()).toEqual([
      '.md',
      '.shadcn',
      'html.dark .md',
      'html.dark .shadcn',
    ])
  })
})
