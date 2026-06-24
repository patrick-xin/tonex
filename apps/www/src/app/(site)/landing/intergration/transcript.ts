export const transcript: Step[] = [
  { kind: 'user', text: 'Update the color scheme in my shadcn project, seed: #4a6fa5 /tonex' },
  {
    kind: 'tool',
    tool: 'Skill',
    call: 'tonex',
    runMs: 700,
    result: [{ text: 'Successfully loaded skill', tone: 'dim' }],
  },
  {
    kind: 'assistant',
    text: "Contrast-safe shadcn theme from #4a6fa5. I'll gate contrast before generating.",
  },
  {
    kind: 'tool',
    tool: 'Bash',
    call: "tonex check --seed '#4a6fa5'",
    runMs: 800,
    result: [{ text: 'PASS — AA contrast — 134 pairs clear', tone: 'ok' }],
  },
  { kind: 'assistant', text: 'Clean pass. Generating the shadcn tokens.' },
  {
    kind: 'tool',
    tool: 'Bash',
    call: "tonex generate --seed '#4a6fa5' --to shadcn",
    runMs: 900,
    result: [
      { text: "/* tonex generate --seed '#4a6fa5' --variant cmf --to shadcn */", tone: 'comment' },
      { text: ':root {', tone: 'code' },
      { text: '  --background: oklch(0.9838 0.0079 286.25);', tone: 'code' },
      { text: '  --primary: oklch(0.4861 0.0962 256.95);', tone: 'code' },
    ],
    collapsed: '56 lines (ctrl+o to expand)',
  },
  {
    kind: 'assistant',
    text: 'Pasted 28 roles × light + dark into globals.css. Want to tune it? — mood (vivid ↔ restrained), surface tint, AAA contrast, or softer borders.',
  },

  // ── turn 2: bump to AAA — gate fails, find the contrast level, re-gate, regen ──
  { kind: 'user', text: 'Bump it to AAA contrast.' },
  {
    kind: 'assistant',
    text: "AAA is stricter. I'll re-gate, find the contrast level that clears it, then regenerate.",
  },
  {
    kind: 'tool',
    tool: 'Bash',
    call: "tonex check --seed '#4a6fa5' --aaa",
    runMs: 800,
    result: [
      { text: 'FAIL — AAA text contrast: 42 pair(s) below threshold', tone: 'dim' },
      { text: '  light on-primary on primary — 6.04:1 (needs 7)', tone: 'dim' },
    ],
    collapsed: '41 more pair(s)',
  },
  {
    kind: 'tool',
    tool: 'Bash',
    call: "tonex check --seed '#4a6fa5' --aaa --find-contrast",
    runMs: 800,
    result: [
      { text: 'FOUND — AAA clears at --contrast 0.89', tone: 'ok' },
      { text: '  re-derive: generate --seed #4a6fa5 --variant cmf --contrast 0.89', tone: 'dim' },
    ],
  },
  {
    kind: 'tool',
    tool: 'Bash',
    call: "tonex check --seed '#4a6fa5' --aaa --contrast 0.89",
    runMs: 700,
    result: [
      { text: 'PASS — AAA contrast — 112 pairs clear', tone: 'ok' },
      { text: '  (+22 non-text warning(s) — advisory)', tone: 'dim' },
    ],
  },
  {
    kind: 'tool',
    tool: 'Bash',
    call: "tonex generate --seed '#4a6fa5' --to shadcn --contrast 0.89",
    runMs: 900,
    result: [
      {
        text: "/* tonex generate --seed '#4a6fa5' --variant cmf --contrast 0.89 --to shadcn */",
        tone: 'comment',
      },
      { text: ':root {', tone: 'code' },
      { text: '  --background: oklch(0.9838 0.0079 286.25);', tone: 'code' },
      { text: '  --foreground: oklch(0 0 0);', tone: 'code' },
    ],
    collapsed: '56 lines (ctrl+o to expand)',
  },
  {
    kind: 'assistant',
    text: 'AAA-clean at contrast 0.89 — globals.css updated. Foregrounds darken (here, pure black) to hold the stricter 7:1 ratio.',
  },

  // ── turn 3: surface tint — pull backgrounds toward neutral, re-gate, regen ──
  { kind: 'user', text: 'Backgrounds feel too blue — make them more neutral.' },
  {
    kind: 'assistant',
    text: "That's the surface tint dial — it pulls backgrounds toward neutral zinc while the brand hue stays on primary/accent. Re-gating, then regenerating.",
  },
  {
    kind: 'tool',
    tool: 'Bash',
    call: "tonex check --seed '#4a6fa5' --tint 0.5",
    runMs: 700,
    result: [{ text: 'PASS — AA contrast — 134 pairs clear', tone: 'ok' }],
  },
  {
    kind: 'tool',
    tool: 'Bash',
    call: "tonex generate --seed '#4a6fa5' --to shadcn --tint 0.5",
    runMs: 900,
    result: [
      {
        text: "/* tonex generate --seed '#4a6fa5' --variant cmf --tint 0.5 --tint-palette zinc --to shadcn */",
        tone: 'comment',
      },
      { text: ':root {', tone: 'code' },
      { text: '  --background: oklch(0.984 0.0062 255.47);', tone: 'code' },
      { text: '  --primary: oklch(0.4861 0.0962 256.95);', tone: 'code' },
    ],
    collapsed: '56 lines (ctrl+o to expand)',
  },
  {
    kind: 'assistant',
    text: 'Done — surfaces read as neutral grey, brand hue stays on primary. The recipe carries --tint 0.5 so the next run reproduces it.',
  },
]
export type ResultLine = { text: string; tone?: 'ok' | 'dim' | 'code' | 'comment' }
export type Step =
  | { kind: 'user'; text: string }
  | { kind: 'assistant'; text: string }
  | {
      kind: 'tool'
      /** tool label, e.g. "Bash" */
      tool: string
      /** the invocation shown in Tool(...) */
      call: string
      /** result lines, rendered under the ⎿ corner */
      result: ResultLine[]
      /** optional collapse footer, e.g. "+56 lines (ctrl+o to expand)" */
      collapsed?: string
      /** ms the call "runs" before its result streams in */
      runMs?: number
    }
