// Shared syntax-highlight surface — one engine + one theme so code blocks look
// identical across the static landing tabs and the runtime export view. Slice 1
// uses a Shiki built-in theme; the V1 brand theme swaps in behind this barrel.
export { getHighlighter, highlightCode } from './highlighter'
export { HIGHLIGHT_LANGS, type HighlightLang } from './langs'
