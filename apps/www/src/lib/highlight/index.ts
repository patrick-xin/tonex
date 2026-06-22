// Shared syntax-highlight surface — one engine + one theme so code blocks look
// identical across the static landing tabs and the runtime export view.
export { getHighlighter, highlightCode } from './highlighter'
export { HIGHLIGHT_LANGS, type HighlightLang } from './langs'
