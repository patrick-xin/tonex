import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import type { HighlightLang } from './langs'
import { HIGHLIGHT_DUAL_THEME, HIGHLIGHT_THEMES } from './theme'

// why: one highlighter, two consumers — the static landing tabs (server-render,
// awaited once) and the runtime export view (re-highlighted per seed change).
// Sharing this singleton is what makes the same CSS block look identical on both
// pages; mixing engines would not. `createHighlighterCore` + the JavaScript
// regex engine avoids the WASM oniguruma binary, and lang grammars load lazily
// (import promises) so only the four we emit ship. The promise is memoised at
// module scope: every consumer awaits the same instance instead of rebuilding a
// grammar registry per call.
let highlighterPromise: Promise<HighlighterCore> | null = null

export function getHighlighter(): Promise<HighlighterCore> {
  highlighterPromise ??= createHighlighterCore({
    langs: [
      import('@shikijs/langs/css'),
      import('@shikijs/langs/json'),
      import('@shikijs/langs/dart'),
      import('@shikijs/langs/yaml'),
      import('@shikijs/langs/bash'),
    ],
    themes: HIGHLIGHT_THEMES,
    engine: createJavaScriptRegexEngine(),
  })
  return highlighterPromise
}

// why: `defaultColor: false` emits both modes as `--shiki-light` / `--shiki-dark`
// CSS variables rather than baking one mode's hex inline — globals.css resolves
// them per `.dark`, so a mode toggle never re-highlights and there's no FOUC.
export async function highlightCode(code: string, lang: HighlightLang): Promise<string> {
  const highlighter = await getHighlighter()
  return highlighter.codeToHtml(code, {
    lang,
    themes: HIGHLIGHT_DUAL_THEME,
    defaultColor: false,
  })
}
