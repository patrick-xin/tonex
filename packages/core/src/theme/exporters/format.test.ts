import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

// why: structural enforcement of tonex_no_drift_rule.md — format.ts is a
// formatter, not a recomputer. If it ever imports from @tonex/mcu it has
// taken on color logic that derive.ts already owns; preview/export drift
// becomes possible. This test reads the file as text and fails on any
// import-from-mcu line. Catches the failure at lint-time, not at runtime.
//
// ADR-0021 amendment: TokenMap holds argb (numbers); projection to oklch
// happens at the format seam via the local oklchString helper. A runtime
// import of oklchString from sibling oklch.ts is therefore expected — but
// the rule against pulling color logic from MCU still holds. Anything
// outside `./oklch` for runtime colorspace work is the smell.
const FORMAT_SRC = fileURLToPath(new URL('./format.ts', import.meta.url))

describe('format.ts import discipline', () => {
  it('does not import from @tonex/mcu', () => {
    const src = readFileSync(FORMAT_SRC, 'utf8')
    const importLines = src.split('\n').filter((l) => /^\s*import\b/.test(l))
    const offending = importLines.filter((l) => l.includes('@tonex/mcu'))
    expect(offending).toEqual([])
  })

  it('runtime imports stay within sibling spine files (no MCU, no app deps)', () => {
    // why: post-ADR-0021, format.ts pulls a few runtime values from sibling
    // spine modules — `oklchString` from ../oklch for argb projection,
    // `MD_TOKEN_NAMES` from ../schema for emission-order keying. The intent of
    // this rule is unchanged: format.ts must not pull color logic from MCU
    // (covered by the prior test) and must not import from app boundaries.
    // Sibling-spine runtime imports are fine — they're pure data or one-line
    // projection wrappers. Regex allows both ./ (in-folder) and ../ (theme/
    // root sibling) since format.ts lives inside exporters/.
    const src = readFileSync(FORMAT_SRC, 'utf8')
    const importLines = src.split('\n').filter((l) => /^\s*import\b/.test(l))
    const runtimeImports = importLines.filter((l) => !/import\s+type\b/.test(l))
    for (const line of runtimeImports) {
      expect(line).toMatch(/from\s+'\.\.?\/[a-z][a-z-]*'/)
    }
  })
})
