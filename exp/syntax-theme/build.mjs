// tonex → VS Code theme generator. Three layers (the architecture every mature
// theme uses — One Dark Pro / Catppuccin / Dracula — see highlight-themes research):
//
//   scope-table.json   TextMate scopes → slot names   (static, zero hex, write once)
//   mappings/*.json    slot → tonex token / hue intent (the only file you edit to restyle)
//   recipes/*.json     seed / second-color / custom / chart-palette (the tonex CLI knobs)
//
// build.mjs runs `tonex generate` for each recipe, resolves mapping refs against
// what the seed ACTUALLY produced, and emits installable VS Code themes. The
// contrast gate shells `tonex check --pairs` (theme-free hex pairs) per mode.
//
// Ref grammar in mappings:
//   "primary"      explicit tonex token (MD role or custom slug) — resolved from --to colors
//   "chart-4"      chart token — resolved from --to json schemes.{mode}.chartN
//   "hue(265)"     hue intent: nearest chromatic token not already spoken for
//   "@keyword"     alias to another slot
//   chrome values: "{slot}"/"token", optional "@NN" = alpha percent
//
// The hue() resolver is the seed-independent trick: chart hues ROTATE with the
// seed (blue seed → chart-4 violet; emerald seed → chart-4 cyan), so a mapping
// that hardcodes chart indices drifts out of its style when the seed changes.
// Mappings express hue intent; this resolver pins it to the real palette. That
// logic is the prototype of the future core `syntax` token group.

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const CLI_DIR = join(HERE, '..', '..', 'packages', 'cli')
const OUT = join(HERE, 'out')

const COMBOS = [
  { recipe: 'night-blue', mapping: 'editor-school', id: 'tonex-night-editor', label: 'Tonex Night (editor)' },
  { recipe: 'emerald', mapping: 'editor-school', id: 'tonex-emerald-editor', label: 'Tonex Emerald (editor)' },
  { recipe: 'emerald', mapping: 'github-school', id: 'tonex-emerald-github', label: 'Tonex Emerald (github)' },
]

// ---------- tonex CLI ----------

function runTonex(args) {
  return execFileSync('pnpm', ['tonex', ...args], { cwd: CLI_DIR, encoding: 'utf8' })
}

function generatePalette(recipe) {
  const base = [
    'generate',
    '--seed', recipe.seed,
    '--second-color', recipe.secondColor,
    '--custom', JSON.stringify(recipe.custom),
    '--chart-palette', recipe.chartPalette,
    '--format', 'hex',
  ]
  const roles = JSON.parse(runTonex([...base, '--to', 'colors']))
  const material = JSON.parse(runTonex([...base, '--to', 'json']))
  return { roles, charts: material.schemes }
}

function tonexCheck(pairs) {
  const out = runTonex(['check', '--pairs', JSON.stringify(pairs)])
  // execFileSync throws on non-zero exit; catch at the call site to gate.
  return out
}

// ---------- color math ----------

function hueOf(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const mx = Math.max(r, g, b)
  const mn = Math.min(r, g, b)
  if (mx === mn) return null
  const d = mx - mn
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4
  return ((h * 60) + 360) % 360
}

function hueDist(a, b) {
  const d = Math.abs(a - b) % 360
  return Math.min(d, 360 - d)
}

function withAlpha(hex, pct) {
  const a = Math.round((pct / 100) * 255)
    .toString(16)
    .padStart(2, '0')
  return hex + a
}

// ---------- resolution ----------

function resolvePalette(recipe) {
  const { roles, charts } = generatePalette(recipe)
  const value = (mode, token) => {
    if (token.startsWith('chart-')) return charts[mode][`chart${token.slice(6)}`]
    if (roles[mode][token] !== undefined) return roles[mode][token]
    throw new Error(`unknown token "${token}" in ${recipe.label} ${mode}`)
  }
  return { roles, charts, value }
}

function chromaticPool(palette, spoken) {
  // hue() candidates: every chromatic token the recipe produced, minus the ones
  // the mapping already references explicitly (they have jobs) and minus error
  // (reserved for invalid — its hue is always red and would swallow warm intents).
  const { roles, charts } = palette
  const chartNames = Object.keys(charts.dark)
    .filter((k) => /^chart\d+$/.test(k))
    .map((k) => `chart-${k.slice(5)}`)
  const names = [...Object.keys(roles.dark), ...chartNames].filter(
    (n) =>
      !/^on-|surface|outline|error/.test(n) &&
      n !== 'secondary' && // muted family — only via explicit refs, never hue-intent picks
      !/-container|-fixed|-dim/.test(n) &&
      !spoken.has(n),
  )
  return [...new Set(names)]
}

function resolveHueIntents(palette, slotRefs) {
  const spoken = new Set(
    Object.values(slotRefs)
      .filter((v) => !v.startsWith('hue(') && !v.startsWith('@'))
      .map((v) => v.replace(/@\d+$/, '')),
  )
  const pool = chromaticPool(palette, spoken)
  const darkHues = new Map(pool.map((n) => [n, hueOf(palette.value('dark', n))]))
  const targets = [...new Set(Object.values(slotRefs).filter((v) => v.startsWith('hue(')).map((v) => +v.slice(4, -1)))]
  const assignments = []
  for (const target of targets) {
    for (const name of pool) {
      const h = darkHues.get(name)
      if (h !== null) assignments.push({ target, name, dist: hueDist(target, h) })
    }
  }
  assignments.sort((a, b) => a.dist - b.dist)
  const byTarget = new Map()
  const taken = new Set()
  for (const a of assignments) {
    if (byTarget.has(a.target) || taken.has(a.name)) continue
    byTarget.set(a.target, a.name)
    taken.add(a.name)
  }
  return byTarget
}

function buildResolver(palette, mapping) {
  const hueMap = resolveHueIntents(palette, mapping.slots)
  const resolved = new Map()
  const slotValue = (mode, ref, seen = new Set()) => {
    const key = `${mode}|${ref}`
    if (resolved.has(key)) return resolved.get(key)
    if (ref.startsWith('@')) {
      const slot = ref.slice(1)
      if (seen.has(slot)) throw new Error(`circular alias at ${ref}`)
      seen.add(slot)
      return slotValue(mode, mapping.slots[slot], seen)
    }
    if (ref.startsWith('hue(')) return palette.value(mode, hueMap.get(+ref.slice(4, -1)))
    return palette.value(mode, ref)
  }
  const hueReport = [...hueMap.entries()].map(([t, n]) => `hue(${t}) -> ${n}`)
  return {
    slot: (mode, slot) => slotValue(mode, mapping.slots[slot]),
    chrome: (mode, raw) => {
      const m = raw.match(/^(?:\{([a-z0-9-]+)\}|([a-z0-9-]+))(?:@(\d+))?$/)
      if (!m) throw new Error(`bad chrome ref "${raw}"`)
      const [, braced, plain, alpha] = m
      const name = braced ?? plain
      const isSlot = mapping.slots[name] !== undefined
      const hex = isSlot ? slotValue(mode, mapping.slots[name]) : palette.value(mode, name)
      return alpha ? withAlpha(hex, +alpha) : hex
    },
    hueReport,
  }
}

// ---------- theme emission ----------

function emitTheme(combo, mappingDef, scopeTable, resolver, mode) {
  const tokenColors = Object.entries(scopeTable.slots).map(([slot, def]) => {
    const ref = mappingDef.slots[slot]
    // fontStyle-only slot (markup.bold/italic): emit without foreground
    if (ref === undefined) {
      return def.fontStyle ? { scope: def.scopes, settings: { fontStyle: def.fontStyle } } : null
    }
    const settings = { foreground: resolver.slot(mode, slot) }
    if (def.fontStyle) settings.fontStyle = def.fontStyle
    return { scope: def.scopes, settings }
  }).filter(Boolean)

  const colors = Object.fromEntries(
    Object.entries(mappingDef.chrome).map(([key, ref]) => [key, resolver.chrome(mode, ref)]),
  )

  const semantic = Object.fromEntries(
    Object.entries(mappingDef.semantic || {}).map(([key, ref]) => {
      const slot = ref.slice(1)
      return [key, resolver.slot(mode, slot)]
    }).filter(([, v]) => v),
  )

  return {
    name: `${combo.label} ${mode === 'dark' ? 'Dark' : 'Light'}`,
    type: mode,
    colors,
    tokenColors,
    ...(Object.keys(semantic).length ? { semanticTokenColors: semantic } : {}),
  }
}

function gateContrast(mappingDef, scopeTable, resolver, mode) {
  const bg = resolver.chrome(mode, mappingDef.chrome['editor.background'])
  // a slot is sub-AA if it aliases (transitively) into an expectSubAA slot
  const subAATerminal = (slot, seen = new Set()) => {
    if (mappingDef.expectSubAA.includes(slot)) return true
    const ref = mappingDef.slots[slot]
    if (ref === undefined || seen.has(ref) || !ref.startsWith('@')) return false
    return subAATerminal(ref.slice(1), new Set([...seen, ref]))
  }
  const gated = Object.keys(scopeTable.slots).filter(
    (s) => mappingDef.slots[s] !== undefined && !subAATerminal(s),
  )
  const pairs = gated.map((s) => [resolver.slot(mode, s), bg])
  const subAA = Object.keys(scopeTable.slots)
    .filter((s) => mappingDef.slots[s] !== undefined && subAATerminal(s))
    .map((s) => [resolver.slot(mode, s), bg])
  let ok = true
  try {
    tonexCheck(pairs)
  } catch (err) {
    ok = false
    console.log(err.stdout.trim())
  }
  if (subAA.length === 0) return ok
  try {
    const info = tonexCheck(subAA)
    console.log(`  ${mode} sub-AA (expected): ${info.trim().split('\n').pop()}`)
  } catch (err) {
    const lines = err.stdout.trim().split('\n').slice(1)
    console.log(`  ${mode} sub-AA (expected, not gated):`)
    for (const l of lines) console.log('   ', l)
  }
  return ok
}

// ---------- main ----------

const scopeTable = JSON.parse(readFileSync(join(HERE, 'scope-table.json'), 'utf8'))
mkdirSync(join(OUT, 'themes'), { recursive: true })

const themesManifest = []
let failed = false

for (const combo of COMBOS) {
  const recipe = JSON.parse(readFileSync(join(HERE, 'recipes', `${combo.recipe}.json`), 'utf8'))
  const mappingDef = JSON.parse(readFileSync(join(HERE, 'mappings', `${combo.mapping}.json`), 'utf8'))
  console.log(`\n=== ${combo.id}  (recipe ${recipe.label}: seed ${recipe.seed})`)
  const palette = resolvePalette(recipe)
  const resolver = buildResolver(palette, mappingDef)
  console.log(`  hue intents: ${resolver.hueReport.join(', ')}`)

  for (const mode of ['dark', 'light']) {
    const theme = emitTheme(combo, mappingDef, scopeTable, resolver, mode)
    const file = join(OUT, 'themes', `${combo.id}-${mode}.json`)
    writeFileSync(file, JSON.stringify(theme, null, 2) + '\n')
    themesManifest.push({
      label: theme.name,
      uiTheme: mode === 'dark' ? 'vs-dark' : 'vs',
      path: `./themes/${combo.id}-${mode}.json`,
    })
    if (!gateContrast(mappingDef, scopeTable, resolver, mode)) failed = true
  }

  console.log('  dark slots:')
  for (const slot of ['function', 'keyword', 'string', 'type', 'tag', 'number', 'property', 'comment']) {
    if (mappingDef.slots[slot] === undefined) continue
    console.log(`    ${slot.padEnd(10)} ${resolver.slot('dark', slot)}`)
  }
}

const pkg = {
  name: 'tonex-theme-demo',
  displayName: 'Tonex Demo (generated)',
  version: '0.2.0',
  publisher: 'patrick-xin',
  description: 'Generated by exp/syntax-theme/build.mjs — scope table + two mappings x two recipes. See exp/syntax-theme/README.md.',
  engines: { vscode: '^1.85.0' },
  categories: ['Themes'],
  contributes: { themes: themesManifest },
}
writeFileSync(join(OUT, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')

console.log(`\n${failed ? 'CONTRAST GATE FAILED' : 'ALL COMBOS PASSED'} — ${themesManifest.length} themes in ${OUT}`)
process.exit(failed ? 1 : 0)
