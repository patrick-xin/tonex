import type { TokenMap } from './derive'
import { getDerivedTheme } from './derive-cache'
import { selectPortable, useSource } from './source'

const STYLE_ELEMENT_ID = 'tonex-tokens'

// why: four scope blocks, in source-order. Match the layout exporters and
// globals.css produce so cascade behavior is identical. Mode toggle lives on
// `<html class="dark">` per ADR-0017 commitment 4 — both light and dark
// rules coexist in the sheet, the dark class flips which one wins.
const SCOPE_SELECTORS = ['.md', 'html.dark .md', '.shadcn', 'html.dark .shadcn'] as const
type ScopeSelector = (typeof SCOPE_SELECTORS)[number]

interface ScopeRules {
  '.md': CSSStyleRule
  'html.dark .md': CSSStyleRule
  '.shadcn': CSSStyleRule
  'html.dark .shadcn': CSSStyleRule
}

// why: applyDom is the runtime renderer — the only path from source to live
// DOM tokens. It and the exporters consume the SAME deriveTheme output, so
// preview === export by construction. ADR-0017.
//
// Update strategy: per-token CSSStyleRule.style.setProperty against four
// stable rules, diffed vs. the last-written values. Replacing textContent at
// 60Hz forced the browser to re-parse + re-resolve the cascade for every
// element matching a scope selector — per tick. Per-token writes invalidate
// only the changed properties' computed-style cache. Issue #9 + ADR-0017
// amendment 2026-05-06.
//
// Returns an unsubscribe so the calling effect can clean up. SSR-safe: on
// the server it returns a no-op cleanup without touching DOM.
export function applyDom(): () => void {
  if (typeof window === 'undefined') return () => {}

  const { rules } = ensureStyleElement()

  // why: per-scope last-written maps. Diffing requires remembering what we
  // wrote so we don't rewrite identical values. Module-scoped cache (1) and
  // applyDom's own subscriber both benefit: when nothing changed, the
  // diff loops find no work and exit cheap.
  const lastTokens: Record<ScopeSelector, TokenMap> = {
    '.md': {},
    'html.dark .md': {},
    '.shadcn': {},
    'html.dark .shadcn': {},
  }

  const render = () => {
    const s = useSource.getState()
    // why: pre-hydration we write nothing. useResolvedTokens returns null
    // pre-hydration too, so components render placeholders. The _hydrated
    // guard makes Next.js hydration mismatches structurally impossible.
    // ADR-0015.
    if (!s._hydrated) return
    try {
      const theme = getDerivedTheme(selectPortable(s))
      applyDiff(rules['.md'], lastTokens['.md'], theme.md.light)
      applyDiff(rules['html.dark .md'], lastTokens['html.dark .md'], theme.md.dark)
      applyDiff(rules['.shadcn'], lastTokens['.shadcn'], theme.shadcn.light)
      applyDiff(rules['html.dark .shadcn'], lastTokens['html.dark .shadcn'], theme.shadcn.dark)
    } catch (err) {
      // why: annotate the failure with applyDom's identity so a stack trace
      // points back to the spine seam, not a generic React error overlay.
      const cause = err instanceof Error ? err.message : String(err)
      throw new Error(`[applyDom] deriveTheme failed: ${cause}`, { cause: err })
    }
  }

  render()
  return useSource.subscribe(render)
}

// why: scaffold an empty rule per scope, locate them by selectorText (robust
// to insertion-order quirks across browsers / jsdom). textContent is set
// EXACTLY ONCE — the empty `{}` bodies — so subsequent renders never trigger
// a full CSS re-parse. From here on, the four CSSStyleRule references are
// stable and per-token setProperty mutates their declarations directly.
function ensureStyleElement(): { el: HTMLStyleElement; rules: ScopeRules } {
  const existing = document.getElementById(STYLE_ELEMENT_ID)
  let el: HTMLStyleElement
  if (existing instanceof HTMLStyleElement) {
    el = existing
  } else {
    el = document.createElement('style')
    el.id = STYLE_ELEMENT_ID
    // why: appendChild puts this last in <head>, after globals.css imported by
    // the app shell. CSS source order means runtime updates win the cascade.
    document.head.appendChild(el)
  }
  // why: idempotent scaffold — if a hot-reload surfaces an existing element
  // with stale text, reset it to the empty rules. The rule objects we
  // captured below would otherwise diverge from what the browser parsed.
  el.textContent = SCOPE_SELECTORS.map((s) => `${s} {}`).join('\n')

  const sheet = el.sheet
  if (sheet === null) {
    throw new Error('[applyDom] style element has no CSSStyleSheet — DOM not ready')
  }
  const found: Partial<ScopeRules> = {}
  for (let i = 0; i < sheet.cssRules.length; i++) {
    const r = sheet.cssRules[i]
    if (
      r instanceof CSSStyleRule &&
      (SCOPE_SELECTORS as readonly string[]).includes(r.selectorText)
    ) {
      found[r.selectorText as ScopeSelector] = r
    }
  }
  for (const sel of SCOPE_SELECTORS) {
    if (found[sel] === undefined) {
      throw new Error(`[applyDom] failed to scaffold scope rule "${sel}"`)
    }
  }
  return { el, rules: found as ScopeRules }
}

// why: write only the changed properties. setProperty for new/different
// values; removeProperty for tokens that disappeared (e.g. a customColor
// being deleted). The `last` map mutates in place to track what's currently
// in the rule, so the next tick can diff against truth instead of recomputing
// from the live CSSOM (cheaper + avoids any browser-side string normalization
// surprises).
function applyDiff(rule: CSSStyleRule, last: TokenMap, next: TokenMap): void {
  for (const name of Object.keys(next)) {
    const value = next[name]
    if (value !== undefined && last[name] !== value) {
      rule.style.setProperty(name, value)
      last[name] = value
    }
  }
  for (const name of Object.keys(last)) {
    if (!(name in next)) {
      rule.style.removeProperty(name)
      delete last[name]
    }
  }
}
