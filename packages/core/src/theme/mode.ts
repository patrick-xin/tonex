// why: shared light/dark union — repeated inline 8+ times across derive,
// source, and surface/* before centralization. Lives flat alongside other
// theme files; the convention is "shared concerns get a sibling file" — when
// a second shared concern lands (e.g. hex utilities) add it as a sibling, not
// under a wrapper folder, until 4-5 files justify grouping. Per-mode shape
// `{ light, dark }` for overrides + bindings is in schema.ts; this file is
// just the union itself.
export type Mode = 'light' | 'dark'
