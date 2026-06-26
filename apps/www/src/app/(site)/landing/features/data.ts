export type FeatureId =
  | 'accessibility'
  | 'tune'
  | 'colors'
  | 'keyboard'
  | 'presets'
  | 'autosave'
  | 'charts'
  | 'tailwind'
  | 'tokens'

export const FEATURES: { id: FeatureId; title: string; body: string; accent: string }[] = [
  {
    id: 'accessibility',
    title: 'Readable by default',
    body: 'Every text-and-background pair is checked against WCAG as you work. Adjust contrast when you need to meet a stricter bar.',
    accent: 'var(--color-chart-1)',
  },
  {
    id: 'tune',
    title: 'Tune any color, and it stays coherent',
    body: 'Warm your neutrals, re-point a role, lock an exact brand color — adjust by feel and the rest of the palette re-balances to stay coherent around every change.',
    accent: 'var(--color-tertiary)',
  },
  {
    id: 'colors',
    title: 'Bring your own colors',
    body: 'Add a brand-new color — a highlight, a category, a seasonal accent — and tonex tunes it to sit naturally beside the rest, in both light and dark.',
    accent: 'var(--color-chart-4)',
  },
  {
    id: 'keyboard',
    title: 'Optimize for DX',
    body: 'Command menu, keyboard shortcuts and copy-paste exports keep you in flow — every action a keystroke away, nothing that breaks your rhythm.',
    accent: 'var(--color-chart-2)',
  },
  {
    id: 'presets',
    title: 'Skip the blank page',
    body: 'Open a hand-crafted preset and make it yours, or ship it as-is — start from something considered instead of an empty canvas.',
    accent: 'var(--color-chart-3)',
  },
  {
    id: 'autosave',
    title: 'Pick up where you left off',
    body: "Your palette saves to your browser automatically. Close the tab, come back, and it's exactly where you left it — no account, nothing to lose.",
    accent: 'var(--color-chart-5)',
  },
  {
    id: 'charts',
    title: 'Color your charts automatically',
    body: 'Get chart-ready scales automatically — single-hue, multi-hue, or polychrome — pick the spread that fits your data instead of hand-picking series colors.',
    accent: 'var(--color-error)',
  },
  {
    id: 'tailwind',
    title: 'Pick any Tailwind color',
    body: 'Pick from the full Tailwind palette right inside the color picker — every shade mapped and ready to drop into a Tailwind project.',
    accent: 'var(--color-primary-container)',
  },
  {
    id: 'tokens',
    title: 'Unlock extended tokens',
    body: 'Turn on an extended token set when you need finer control — more named color roles for complex systems.',
    accent: 'var(--color-secondary)',
  },
]
