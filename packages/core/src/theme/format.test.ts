import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

// why: structural enforcement of tonex_no_drift_rule.md — format.ts is a
// formatter, not a recomputer. If it ever imports from @tonex/mcu it has
// taken on color logic that derive.ts already owns; preview/export drift
// becomes possible. This test reads the file as text and fails on any
// import-from-mcu line. Catches the failure at lint-time, not at runtime.
const FORMAT_SRC = fileURLToPath(new URL('./format.ts', import.meta.url))

describe('format.ts import discipline', () => {
  it('does not import from @tonex/mcu', () => {
    const src = readFileSync(FORMAT_SRC, 'utf8')
    const importLines = src.split('\n').filter((l) => /^\s*import\b/.test(l))
    const offending = importLines.filter((l) => l.includes('@tonex/mcu'))
    expect(offending).toEqual([])
  })

  it('only imports types from sibling spine files', () => {
    // why: format.ts may take TYPE-only imports from derive.ts (the layer
    // shape) but should not pull runtime values from anywhere — the file is
    // pure string assembly. Anything else is a smell.
    const src = readFileSync(FORMAT_SRC, 'utf8')
    const importLines = src.split('\n').filter((l) => /^\s*import\b/.test(l))
    for (const line of importLines) {
      expect(line).toMatch(/import\s+type\b/)
    }
  })
})
