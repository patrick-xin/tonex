# @tonex/core

## 0.1.0

### Minor Changes

- 37984a9: Make `surfacePaletteName` mode-keyed so light and dark can draw on different Tailwind neutral families. Previously the neutral family was a single shared scalar while every tint strength knob was already per-mode `{ light, dark }`, so choosing one family while editing dark and another while editing light silently overwrote — both modes re-derived against the last pick (#242). The field is now `{ light, dark }`, `deriveTheme` indexes it per mode (the tint function stays mode-free), and the CLI gains `--tint-palette-light` / `--tint-palette-dark`; the base `--tint-palette` still sets both modes and the recipe collapses to it when they match. Default stays `{ light: 'zinc', dark: 'zinc' }`, so derive output is byte-identical for existing themes.

### Patch Changes

- d903bf9: License under Apache-2.0 (metadata only — no API change).
- Updated dependencies [d903bf9]
  - @tonex/color-utils@0.0.2
