#!/usr/bin/env node
// Enforce ADR-0034 c.8 — "anchors are an API". Code and docs cite ADRs at fine
// granularity (ADR-N, c.M / rule M, amendment <date>); those citations are join
// keys. A body may be rewritten freely and an amendment folded into current
// truth, but every anchor a consumer still cites must keep resolving in one hop.
// This guard fails when a citation orphans:
//   - ADR-N        → the numbered ADR file must exist (any layer, incl. _archive)
//   - c.M / rule M → M must be a declared commitment number in that ADR
//   - amendment D  → the date D must still appear in that ADR (body or ledger)
//
// It is the deterministic harness that makes current-truth-first folds safe to
// repeat: rewrite prose, then run this to prove no cited anchor was dropped.
//
// Bundled with the `adr` skill (.claude/skills/adr/); invoked via package.json.
// Run: pnpm check:adr                       # audit the whole tree
//      pnpm check:adr <file...>             # only these (lint-staged passes staged paths)
//
// With file args (lint-staged passes staged paths) the ADR index is still built
// from the whole tree — resolution needs every ADR — but only the named files
// are scanned for citations, so a commit is gated on the citations it touches.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()
const SCAN_ROOTS = ['docs', 'packages', 'apps']
// Top-level docs that carry citations but live outside the scan roots.
const ROOT_FILES = ['CLAUDE.md', 'DESIGN.md', 'CHANGELOG.md', 'README.md']
const SKIP_DIR = new Set([
  'node_modules',
  'dist',
  '.next',
  '.turbo',
  '.git',
  'coverage',
  '__fixtures__',
])
// Vendored / generated trees we don't own (mirrors check-conventions.mjs).
const SKIP_PATH_FRAGMENT = ['packages/mcu/', 'apps/www/src/components/shadcn/']
const SCANNABLE = /\.(tsx?|mjs|js|md)$/
// An ADR source file: NNNN-*.md directly under an `adr/` (or `adr/_archive/`) dir.
const ADR_FILE = /(?:^|\/)adr\/(?:_archive\/)?(\d{4})-[^/]*\.md$/

const rel = (abs) => relative(ROOT, abs).split('\\').join('/')

function exists(abs) {
  try {
    statSync(abs)
    return true
  } catch {
    return false
  }
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIR.has(entry)) continue
    const abs = join(dir, entry)
    const st = statSync(abs)
    if (st.isDirectory()) yield* walk(abs)
    else yield abs
  }
}

// Every file under the scan roots, plus the named top-level docs.
function allFiles() {
  const out = []
  for (const r of SCAN_ROOTS) {
    const abs = join(ROOT, r)
    if (exists(abs)) out.push(...walk(abs))
  }
  for (const f of ROOT_FILES) {
    const abs = join(ROOT, f)
    if (exists(abs)) out.push(abs)
  }
  return out
}

const stripFences = (text) => text.replace(/```[\s\S]*?```/g, '')

// Commitment anchors are declared two ways across the corpus: as `## N.` section
// headings (e.g. ADR-0021) or as top-level `N.` ordered-list items under the
// Decision (e.g. ADR-0017, ADR-0015, ADR-0014's "rules"). Union both; code
// fences are stripped first so a `1.` inside an example never reads as an anchor.
function declaredCommitments(text) {
  const body = stripFences(text)
  const nums = new Set()
  for (const m of body.matchAll(/^#{2,6}\s+(\d+)\./gm)) nums.add(Number(m[1]))
  for (const m of body.matchAll(/^(\d+)\.\s/gm)) nums.add(Number(m[1]))
  return nums
}

const datesIn = (text) => new Set([...text.matchAll(/\b(\d{4}-\d{2}-\d{2})\b/g)].map((m) => m[1]))

// c.11 — the Code-anchor footer, the dual of a citation: ``**Code anchors:**
// `path`, `path``` (files an agent editing this decision lands on first) or
// ``**Code anchors:** none — <reason>`` (no single code home). `absent` when the
// footer is missing — itself a violation for an active ADR.
function parseCodeAnchors(text) {
  const m = text.match(/\*\*Code anchors:\*\*[ \t]*(.+)/)
  if (!m) return { kind: 'absent' }
  const rest = m[1].trim()
  if (/^none\b/i.test(rest)) {
    return { kind: 'none', reason: rest.replace(/^none\b[\s—–-]*/i, '').trim() }
  }
  return { kind: 'paths', paths: [...rest.matchAll(/`([^`]+)`/g)].map((x) => x[1]) }
}

// Build the ADR index: number → { rel, commitments, dates, text }. A number can
// only resolve to one file; if two share a number that's its own defect, flagged.
function buildAdrIndex(files) {
  const index = new Map()
  const dupes = []
  for (const abs of files) {
    const m = rel(abs).match(ADR_FILE)
    if (!m) continue
    const num = Number(m[1])
    const text = readFileSync(abs, 'utf8')
    if (index.has(num)) dupes.push({ num, a: index.get(num).rel, b: rel(abs) })
    index.set(num, {
      rel: rel(abs),
      commitments: declaredCommitments(text),
      dates: datesIn(text),
      anchors: parseCodeAnchors(text),
    })
  }
  return { index, dupes }
}

// One citation = `ADR-NNNN` plus an optional anchor qualifier. Ranges (`c.6–c.10`)
// validate their first endpoint; `§N` and bare prose qualifiers only assert the
// ADR exists. Capture groups: 1=num, 2=c.M, 3=rule M, 4=amendment date, 5=Part.
const CITE =
  /ADR-(\d{4})(?:\s+c\.(\d+)|\s+rule\s+(\d+)|\s+amendment\s+(\d{4}-\d{2}-\d{2})|\s+Part\s+([AB]))?/g

function citationsIn(text) {
  const out = []
  for (const m of text.matchAll(CITE)) {
    const upto = text.slice(0, m.index)
    const line = upto.length - upto.lastIndexOf('\n')
    const lineNo = (upto.match(/\n/g)?.length ?? 0) + 1
    out.push({
      num: Number(m[1]),
      commitment: m[2] ? Number(m[2]) : null,
      rule: m[3] ? Number(m[3]) : null,
      date: m[4] ?? null,
      part: m[5] ?? null,
      lineNo,
      col: line,
      raw: m[0],
    })
  }
  return out
}

function resolve(cite, index) {
  const adr = index.get(cite.num)
  if (!adr) return `no ADR-${String(cite.num).padStart(4, '0')} file exists`
  const anchor = cite.commitment ?? cite.rule
  if (anchor != null && !adr.commitments.has(anchor)) {
    const have = [...adr.commitments].sort((a, b) => a - b).join(', ')
    return `${adr.rel} declares no commitment ${anchor} (has: ${have || 'none'})`
  }
  if (cite.date != null && !adr.dates.has(cite.date)) {
    return `${adr.rel} no longer contains the date ${cite.date} (amendment anchor dropped)`
  }
  return null
}

// ── run ──────────────────────────────────────────────────────────────────────
const tree = allFiles()
const { index, dupes } = buildAdrIndex(tree)

const args = process.argv.slice(2).filter((a) => !a.startsWith('-'))
const scanFiles = (
  args.length > 0 ? args.map((a) => (a.startsWith('/') ? a : join(ROOT, a))).filter(exists) : tree
).filter((abs) => {
  const path = rel(abs)
  return SCANNABLE.test(path) && !SKIP_PATH_FRAGMENT.some((f) => path.includes(f))
})

const violations = []
let citationCount = 0
for (const abs of scanFiles) {
  const path = rel(abs)
  for (const cite of citationsIn(readFileSync(abs, 'utf8'))) {
    citationCount++
    const reason = resolve(cite, index)
    if (reason) violations.push({ path, cite, reason })
  }
}

for (const d of dupes) {
  violations.push({
    path: d.b,
    cite: { lineNo: 1, raw: `ADR-${String(d.num).padStart(4, '0')}` },
    reason: `duplicate ADR number — also ${d.a}`,
  })
}

// ── c.11 coverage: every active ADR resolves back to a live code surface ──────
// The dual of c.8. c.8 scans code for citations and resolves them forward to a
// live ADR anchor; this walks the ADR index and resolves each active ADR back to
// the code surface it declares. Whole-tree (CI) covers every active ADR;
// file-scoped (lint-staged) covers only staged ADR files — the whole-tree run is
// the backstop that catches a breadcrumb deleted from a code anchor elsewhere.
const ARCHIVE = /\/adr\/_archive\//
const scannedRel = new Set(scanFiles.map((abs) => rel(abs)))
const coverage = []
for (const [num, adr] of index) {
  if (ARCHIVE.test(adr.rel)) continue
  if (args.length > 0 && !scannedRel.has(adr.rel)) continue
  const tag = `ADR-${String(num).padStart(4, '0')}`
  const a = adr.anchors
  if (a.kind === 'absent') {
    coverage.push({
      path: adr.rel,
      reason: 'declares no "Code anchors:" footer — add file path(s) or `none — <reason>`',
    })
  } else if (a.kind === 'none') {
    if (!a.reason)
      coverage.push({ path: adr.rel, reason: '"Code anchors: none" requires a reason' })
  } else if (a.paths.length === 0) {
    coverage.push({
      path: adr.rel,
      reason: '"Code anchors:" lists no path and is not `none — <reason>`',
    })
  } else {
    const present = new RegExp(`${tag}(?!\\d)`)
    for (const p of a.paths) {
      const abs = join(ROOT, p)
      if (!exists(abs))
        coverage.push({ path: adr.rel, reason: `code anchor \`${p}\` does not exist` })
      else if (!present.test(readFileSync(abs, 'utf8')))
        coverage.push({
          path: adr.rel,
          reason: `code anchor \`${p}\` carries no ${tag} breadcrumb`,
        })
    }
  }
}

if (violations.length === 0 && coverage.length === 0) {
  const active = [...index.values()].filter((a) => !ARCHIVE.test(a.rel))
  const anchored = active.filter((a) => a.anchors.kind === 'paths').length
  const opted = active.filter((a) => a.anchors.kind === 'none').length
  console.log(
    `✓ check-adr-citations: ${citationCount} citation(s) across ${scanFiles.length} file(s) resolve to live anchors; ${anchored} decision(s) anchored to code, ${opted} opted out (${index.size} ADRs indexed)`,
  )
  process.exit(0)
}

if (violations.length > 0) {
  console.error(`✗ check-adr-citations: ${violations.length} orphaned anchor(s) [ADR-0034 c.8]\n`)
  for (const v of violations) {
    console.error(`  ${v.path}:${v.cite.lineNo}  ${v.cite.raw}`)
    console.error(`    ${v.reason}\n`)
  }
}
if (coverage.length > 0) {
  console.error(
    `✗ check-adr-citations: ${coverage.length} unanchored decision(s) [ADR-0034 c.11]\n`,
  )
  for (const c of coverage) {
    console.error(`  ${c.path}`)
    console.error(`    ${c.reason}\n`)
  }
}
process.exit(1)
