# tonex

## 0.1.0

### Minor Changes

- f5a1fe8: Add `--chart-palette` to `generate` and `serialize` — pick the chart series palette in the web app's own vocabulary (`single` | `multi` | `polychrome`). It implies `--with-chart` (sets the chart axis and emits the `--chart-1..5` block), and `describe.chart` lists the taxonomy so an agent maps intent → palette with no skill-doc dependency. The label↔config mapping lives in `@tonex/core` and is shared with the web UI toggle, so a GUI choice round-trips to a pasteable command.
- 37984a9: Make `surfacePaletteName` mode-keyed so light and dark can draw on different Tailwind neutral families. Previously the neutral family was a single shared scalar while every tint strength knob was already per-mode `{ light, dark }`, so choosing one family while editing dark and another while editing light silently overwrote — both modes re-derived against the last pick (#242). The field is now `{ light, dark }`, `deriveTheme` indexes it per mode (the tint function stays mode-free), and the CLI gains `--tint-palette-light` / `--tint-palette-dark`; the base `--tint-palette` still sets both modes and the recipe collapses to it when they match. Default stays `{ light: 'zinc', dark: 'zinc' }`, so derive output is byte-identical for existing themes.
- b327a34: Add `tonex serialize` and `tonex apply` — the by-value `colors.json` round-trip. `serialize` freezes a derived theme into a canonical, version-stamped `PortableTheme`; `apply` loads one (file or stdin) and projects it (`--to`) or gates it (`--check`), honoring every pin/binding/override in the file. `serialize | apply --to T` reproduces `generate --to T` exactly.
