// why: ADR-0021 commitment 9 — JSON export stub ships visible from day one
// with a TODO body. Real formatter swaps the body when it lands; per ADR-
// 0008 the registry stays one-function-with-discriminator until two real
// formats coexist (stubs don't count).
//
// Will follow the design-token-community-group spec, mode-keyed (light /
// dark) with the full md token surface.

export function exportJson(): string {
  return [
    '{',
    '  "_comment": "JSON export — coming soon. Will follow the design-token-community-group spec, mode-keyed (light/dark) with the full md token surface."',
    '}',
    '',
  ].join('\n')
}
