// why: one place owns the per-tab routing decision the export pane depends on —
// which core exporter runs, the file extension, and whether a provenance header
// is prepended. These used to be scattered across six return sites inside
// useExportContent's useMemo, with the header prepend duplicated and the
// extension a string literal at each branch; this folds them into one
// exhaustively-typed table. The exporter *bodies* are @tonex/core's contract and
// are not modelled here — this only carries the discriminant the hook switches
// on, plus the css `layer` (Tailwind → the full md layer; shadcn → :root + .dark
// only). Header policy is load-bearing: a /* */ banner is valid CSS but corrupts
// a JSON parse or a DESIGN.md `colors:` paste, so the data formats stay
// header-free. The switch is exhaustive, so a new tab is a compile error until
// it declares a route — no silent fallthrough to the shadcn default.

export type ExportTab = 'Tailwind' | 'CSS' | 'shadcn' | 'JSON' | 'Dart' | 'DESIGN.md'

export type ExportRoute =
  | { exporter: 'designMd'; ext: 'md'; header: false }
  | { exporter: 'json'; ext: 'json'; header: false }
  | { exporter: 'dart'; ext: 'dart'; header: false }
  | { exporter: 'nativeCss'; ext: 'css'; header: true }
  | { exporter: 'css'; layer: 'md' | 'shadcn'; ext: 'css'; header: true }

export function resolveExportRoute(tab: ExportTab): ExportRoute {
  switch (tab) {
    case 'DESIGN.md':
      return { exporter: 'designMd', ext: 'md', header: false }
    case 'JSON':
      return { exporter: 'json', ext: 'json', header: false }
    case 'Dart':
      return { exporter: 'dart', ext: 'dart', header: false }
    case 'CSS':
      return { exporter: 'nativeCss', ext: 'css', header: true }
    case 'Tailwind':
      return { exporter: 'css', layer: 'md', ext: 'css', header: true }
    case 'shadcn':
      return { exporter: 'css', layer: 'shadcn', ext: 'css', header: true }
  }
}
