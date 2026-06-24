export type Status = 'Planned' | 'In progress' | 'Done' | 'Coming soon'

export const milestones: Array<{
  title: string
  status: Status
  description: string
}> = [
  {
    title: 'One seed to full theme',
    status: 'Done',
    description: 'Generate a complete palette from a single source color in one pass.',
  },
  {
    title: 'CLI & Agent Skills',
    status: 'Done',
    description: 'Run Tonex from the command line or hand it to coding agents as a skill.',
  },
  {
    title: 'MCP support',
    status: 'In progress',
    description: 'Let coding agents generate and contrast-check themes through a native protocol.',
  },
  {
    title: 'Accessible chart colors',
    status: 'Coming soon',
    description:
      'Categorical palettes that stay mutually distinguishable — including for color-blind viewers.',
  },
  {
    title: 'Harmonious accents',
    status: 'Planned',
    description: 'Derive secondary and accent colors that stay in tune with your seed.',
  },
  {
    title: 'Color suggestions from an image',
    status: 'Planned',
    description:
      'Pull several seed candidates from a logo or screenshot, so you can pick the one that fits.',
  },
  {
    title: 'Editor color themes',
    status: 'Planned',
    description: 'Turn the same color decisions into IDE themes for code, docs, and demos.',
  },
]
