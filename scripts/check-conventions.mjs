#!/usr/bin/env node
// Deterministic guard for the three drift patterns that used to live in the
// prompt-based Stop sentinel. These are pure import/type-shape rules, so a
// regex catches them at lint/commit time instead of probabilistically at Stop.
// Judgment-requiring patterns (ADR rewrites, narrative comments, sink-side
// color math) stay in the sentinel — they can't be regexed.
//
// Run: node scripts/check-conventions.mjs              # audit the whole tree
//      node scripts/check-conventions.mjs <file...>    # check only these files (lint-staged passes staged paths)
//
// lint-staged passes the staged file list, so a commit is gated on the files it
// touches — new/edited code must be clean, while pre-existing debt elsewhere
// doesn't block. `pnpm check:conventions` (no args) audits the whole tree.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const SCAN_ROOTS = ['packages', 'apps']
const SKIP_DIR = new Set(['node_modules', 'dist', '.next', '.turbo', '.git', '__fixtures__'])
// Vendored / generated trees we don't own (mirrors biome.json excludes).
const SKIP_PATH_FRAGMENT = ['packages/mcu/', 'apps/www/src/components/shadcn/']

// posix-style path relative to repo root, for stable matching across platforms.
const rel = (abs) => relative(ROOT, abs).split('\\').join('/')

const CHECKS = [
  {
    id: 'core-purity',
    adr: 'ADR-0037',
    message:
      '@tonex/core is the pure engine — no react/zustand imports. The editor runtime (store, hook, DOM sink, persistence) lives in @tonex/core-react.',
    appliesTo: (path) => path.startsWith('packages/core/src/'),
    allows: () => false,
    // import ... from 'react' | 'react-dom' | 'react/*' | 'zustand' | 'zustand/*'
    lineMatches: (line) => /from\s+['"](react|zustand)([-/][^'"]*)?['"]/.test(line),
    stripComments: true,
  },
  {
    id: 'culori-firewall',
    adr: 'ADR-0025',
    message:
      "import color libraries from '@tonex/color-utils', never 'culori' directly (only packages/color-utils may depend on culori)",
    allows: (path) => path.includes('packages/color-utils/'),
    // import ... from 'culori'  /  from "culori"
    lineMatches: (line) => /from\s+['"]culori['"]/.test(line),
    stripComments: false,
  },
  {
    id: 'next-themes-allowlist',
    adr: 'ADR-0015',
    message:
      "import from 'next-themes' only inside features/theme-mode/ (consume mode via useActiveMode / useSetMode)",
    appliesTo: (path) => path.startsWith('apps/'),
    allows: (path) => path.includes('apps/www/src/features/theme-mode/'),
    lineMatches: (line) => /from\s+['"]next-themes['"]/.test(line),
    stripComments: false,
  },
  {
    id: 'inline-mode-union',
    adr: 'ADR-0016',
    message:
      "don't inline a 'light' | 'dark' union or ['light','dark'] tuple — import Mode / MODES from @tonex/core",
    allows: (path) => path === 'packages/core/src/theme/mode.ts',
    lineMatches: (line) =>
      /['"]light['"]\s*\|\s*['"]dark['"]/.test(line) ||
      /['"]dark['"]\s*\|\s*['"]light['"]/.test(line) ||
      /\[\s*['"]light['"]\s*,\s*['"]dark['"]\s*\]/.test(line) ||
      /\[\s*['"]dark['"]\s*,\s*['"]light['"]\s*\]/.test(line),
    stripComments: true,
  },
]

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIR.has(entry)) continue
    const abs = join(dir, entry)
    const st = statSync(abs)
    if (st.isDirectory()) {
      yield* walk(abs)
    } else if (/\.tsx?$/.test(entry)) {
      yield abs
    }
  }
}

// Cheap line-comment strip so a `// returns 'light' | 'dark'` doc note doesn't
// trip the union check. Drops `//…` tails and skips block/JSDoc comment lines.
function codeOnly(line) {
  const trimmed = line.trim()
  if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return ''
  const idx = line.indexOf('//')
  return idx === -1 ? line : line.slice(0, idx)
}

function exists(abs) {
  try {
    statSync(abs)
    return true
  } catch {
    return false
  }
}

// File list: explicit args (lint-staged) → just those; otherwise the full tree.
function fileList() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith('-'))
  if (args.length > 0) {
    return args
      .map((a) => (a.startsWith('/') ? a : join(ROOT, a)))
      .filter((abs) => /\.tsx?$/.test(abs) && exists(abs))
  }
  const out = []
  for (const scanRoot of SCAN_ROOTS) {
    const abs = join(ROOT, scanRoot)
    if (exists(abs)) out.push(...walk(abs))
  }
  return out
}

const violations = []
for (const file of fileList()) {
  const path = rel(file)
  if (SKIP_PATH_FRAGMENT.some((frag) => path.includes(frag))) continue

  let lines = null
  for (const check of CHECKS) {
    if (check.appliesTo && !check.appliesTo(path)) continue
    if (check.allows(path)) continue
    if (lines === null) lines = readFileSync(file, 'utf8').split('\n')
    lines.forEach((raw, i) => {
      const line = check.stripComments ? codeOnly(raw) : raw
      if (check.lineMatches(line)) {
        violations.push({ path, line: i + 1, check, text: raw.trim() })
      }
    })
  }
}

if (violations.length === 0) {
  console.log(
    '✓ check-conventions: no drift (culori firewall, next-themes allowlist, inline Mode union)',
  )
  process.exit(0)
}

console.error(`✗ check-conventions: ${violations.length} violation(s)\n`)
for (const v of violations) {
  console.error(`  ${v.path}:${v.line}  [${v.check.id} · ${v.check.adr}]`)
  console.error(`    ${v.check.message}`)
  console.error(`    > ${v.text}\n`)
}
process.exit(1)
