// why: the export surface emits exactly four grammars across its six tabs —
// Tailwind/CSS/shadcn are all CSS, JSON is JSON, Dart is Dart, and Design.md is
// YAML (not Markdown — its body is a `colors:` map). Pinning the set here keeps
// the highlighter's lazy lang loads (highlighter.ts) and any tab→lang mapping
// (features/export) agreeing on one list, and bounds the bundle to what we
// actually render.
export const HIGHLIGHT_LANGS = ['css', 'json', 'dart', 'yaml'] as const

export type HighlightLang = (typeof HIGHLIGHT_LANGS)[number]
