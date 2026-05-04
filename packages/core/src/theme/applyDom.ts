import { deriveTheme } from './derive'
import { formatCss } from './format'
import { SCHEMA_VERSION } from './schema'
import { useSource } from './source'

const STYLE_ELEMENT_ID = 'tonex-tokens'

function ensureStyleElement(): HTMLStyleElement {
  const existing = document.getElementById(STYLE_ELEMENT_ID)
  if (existing instanceof HTMLStyleElement) return existing
  const el = document.createElement('style')
  el.id = STYLE_ELEMENT_ID
  // why: appendChild puts this last in <head>, after globals.css imported by
  // the app shell. CSS source order means runtime updates win the cascade.
  document.head.appendChild(el)
  return el
}

// why: applyDom is the runtime renderer — the only path from source to live
// DOM tokens. It and the exporters consume the SAME deriveTheme output, so
// preview === export by construction. ADR-0017.
//
// Returns an unsubscribe so the calling effect can clean up. SSR-safe: on
// the server it returns a no-op cleanup without touching DOM.
export function applyDom(): () => void {
  if (typeof window === 'undefined') return () => {}

  const styleEl = ensureStyleElement()

  const render = () => {
    const s = useSource.getState()
    // why: pre-hydration we write nothing. useResolvedTokens returns null
    // pre-hydration too, so components render placeholders. The _hydrated
    // guard makes Next.js hydration mismatches structurally impossible.
    // ADR-0015.
    if (!s._hydrated) return
    try {
      const theme = deriveTheme({
        version: SCHEMA_VERSION,
        seedHex: s.seedHex,
        variant: s.variant,
        md3PrimaryContainerOverride: s.md3PrimaryContainerOverride,
        shadcnRoleBindings: s.shadcnRoleBindings,
        surfaceTintLevel: s.surfaceTintLevel,
        surfaceDesaturateLevel: s.surfaceDesaturateLevel,
      })
      styleEl.textContent = formatCss(theme)
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
