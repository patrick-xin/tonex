import { getDerivedTheme, type TokenMap } from './derive'
import { oklchString } from './oklch'
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
      // why: ADR-0021 commitment 4 — DOM-relevant subset only. Core role
      // tokens + chart merge into the existing 4 scope rules; extended
      // tokens and palette stay data-only (consumed by inspect UIs via
      // useResolvedTokens). Per-tick setProperty count drops because the
      // 22-token extended tier and 108-tone palette never enter the diff.
      applyDiff(rules['.md'], lastTokens['.md'], { ...theme.md.light, ...theme.md.lightChart })
      applyDiff(rules['html.dark .md'], lastTokens['html.dark .md'], {
        ...theme.md.dark,
        ...theme.md.darkChart,
      })
      // why: brand merges into BOTH .shadcn blocks with the SAME (mode-invariant)
      // values so a brand button previews correctly in light and dark. Always
      // applied — like chart — so the editor is WYSIWYG; export still gates it
      // via includeBrand. Brand is kept out of shadcn.light/dark, so it's spread
      // in explicitly here rather than riding the core map.
      applyDiff(rules['.shadcn'], lastTokens['.shadcn'], {
        ...theme.shadcn.light,
        ...theme.shadcn.lightChart,
        ...theme.shadcn.brand,
      })
      applyDiff(rules['html.dark .shadcn'], lastTokens['html.dark .shadcn'], {
        ...theme.shadcn.dark,
        ...theme.shadcn.darkChart,
        ...theme.shadcn.brand,
      })
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
// to insertion-order quirks across browsers / jsdom). textContent is written
// only on cold mount or when the existing scaffold is missing/partial — the
// remount path reuses the existing rules, so per-token setProperty stays the
// hot path and a full CSS reparse never happens (ADR-0017 amendment
// 2026-05-06 / issue #9).
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

  const found: Partial<ScopeRules> = {}
  const collect = () => {
    const sheet = el.sheet
    if (sheet === null) return
    for (let i = 0; i < sheet.cssRules.length; i++) {
      const r = sheet.cssRules[i]
      if (
        r instanceof CSSStyleRule &&
        (SCOPE_SELECTORS as readonly string[]).includes(r.selectorText)
      ) {
        found[r.selectorText as ScopeSelector] = r
      }
    }
  }

  // why: detect existing scaffold. Reuse if all four rules are present (typical
  // remount path — keeps the per-token setProperty hot-path stable, no full CSS
  // reparse). Reset only if missing or partial (cold mount + hot-reload-with-
  // stale-text path — also covers the brand-new <style> case where el.sheet
  // is null until textContent is written).
  collect()
  const allFound = SCOPE_SELECTORS.every((sel) => found[sel] !== undefined)
  if (!allFound) {
    el.textContent = SCOPE_SELECTORS.map((s) => `${s} {}`).join('\n')
    collect()
  }

  if (el.sheet === null) {
    throw new Error('[applyDom] style element has no CSSStyleSheet — DOM not ready')
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
//
// Diff happens at argb (number) granularity (ADR-0021); oklchString projects
// only on actual write. Unchanged tokens skip the projection cost entirely —
// the hot-path for slider drags where most tokens stay put per tick (#9).
function applyDiff(rule: CSSStyleRule, last: TokenMap, next: TokenMap): void {
  const lastKeyCount = Object.keys(last).length
  for (const name of Object.keys(next)) {
    const argb = next[name]
    if (argb !== undefined && last[name] !== argb) {
      rule.style.setProperty(name, oklchString(argb))
      last[name] = argb
    }
  }
  // why: if `last`'s key count stayed put AND matches `next`'s key count, no
  // key from the previous frame disappeared — skip the deletion walk. Both
  // checks are needed: the first detects "we added a key from `next` that
  // wasn't in `last`," the second detects "the input set didn't shrink."
  // Custom-color add/remove is the only path that changes the key set; those
  // hit the slow path when key count diverges.
  if (Object.keys(last).length === lastKeyCount && lastKeyCount === Object.keys(next).length) {
    return
  }
  for (const name of Object.keys(last)) {
    if (!(name in next)) {
      rule.style.removeProperty(name)
      delete last[name]
    }
  }
}
