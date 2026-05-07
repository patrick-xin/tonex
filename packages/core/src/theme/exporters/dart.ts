// why: ADR-0021 commitment 9 — Dart export stub ships visible from day one
// with a TODO body. Real formatter swaps the body when it lands; per ADR-
// 0008 the registry stays one-function-with-discriminator until two real
// formats coexist (stubs don't count).
//
// Will produce ColorScheme + per-mode ThemeData for a Flutter app
// consuming the same source-of-truth tokens.

export function exportDart(): string {
  return [
    '// Dart export — coming soon.',
    '// Will produce ColorScheme + per-mode ThemeData for a Flutter app consuming',
    '// the same source-of-truth tokens.',
    '',
  ].join('\n')
}
