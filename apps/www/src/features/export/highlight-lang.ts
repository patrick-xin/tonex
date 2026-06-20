import type { HighlightLang } from '@/lib/highlight'
import type { ExportTab } from './resolve-export-route'

// why: the single owner of tab → Shiki grammar, reused by the static landing
// tabs and the runtime export view so both highlight a tab the same way. The
// switch is exhaustive (no default) — a new ExportTab is a compile error here
// until it declares its grammar. Note Design.md maps to `yaml`, not Markdown:
// its export body is a `colors:` map, so YAML is what reads correctly.
export function tabToHighlightLang(tab: ExportTab): HighlightLang {
  switch (tab) {
    case 'Tailwind':
    case 'CSS':
    case 'shadcn':
      return 'css'
    case 'JSON':
      return 'json'
    case 'Dart':
      return 'dart'
    case 'DESIGN.md':
      return 'yaml'
  }
}
