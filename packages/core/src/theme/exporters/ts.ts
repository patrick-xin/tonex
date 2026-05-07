// why: ADR-0021 commitment 9 — TS export stub ships visible from day one
// with a TODO body. When a real formatter lands it earns this file fully;
// per ADR-0008 the exporter registry shape stays one-function-with-
// discriminator until two real formats coexist (stubs don't count).
//
// Will produce a typed const map of all md tokens (light + dark), suitable
// for design-token consumption from JS/TS code (Storybook, RN, etc).

export function exportTs(): string {
  return [
    '// TS export — coming soon.',
    '// Will produce a typed const map of all md tokens (light + dark), suitable',
    '// for design-token consumption from JS/TS code (Storybook, RN, etc).',
    '',
  ].join('\n')
}
