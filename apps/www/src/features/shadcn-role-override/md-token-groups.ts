import type { MdTokenName } from '@tonex/core/schema'

// why: mirrors legacy md3-role-picker-panel's GROUP_DEFS adapted to our
// `--color-*` MD token namespace. The 11 groups partition MD_TOKEN_NAMES
// exhaustively (50 tokens) so the Roles tab can render a curated, readable
// hierarchy instead of a flat scroll of token strings.
export interface MdTokenGroup {
  label: string
  tokens: ReadonlyArray<MdTokenName>
}

export const MD_TOKEN_GROUPS: ReadonlyArray<MdTokenGroup> = [
  {
    label: 'Primary',
    tokens: [
      '--color-primary',
      '--color-on-primary',
      '--color-primary-container',
      '--color-on-primary-container',
      '--color-inverse-primary',
      '--color-primary-dim',
    ],
  },
  {
    label: 'Primary Fixed',
    tokens: [
      '--color-primary-fixed',
      '--color-primary-fixed-dim',
      '--color-on-primary-fixed',
      '--color-on-primary-fixed-variant',
    ],
  },
  {
    label: 'Secondary',
    tokens: [
      '--color-secondary',
      '--color-on-secondary',
      '--color-secondary-container',
      '--color-on-secondary-container',
      '--color-secondary-dim',
    ],
  },
  {
    label: 'Secondary Fixed',
    tokens: [
      '--color-secondary-fixed',
      '--color-secondary-fixed-dim',
      '--color-on-secondary-fixed',
      '--color-on-secondary-fixed-variant',
    ],
  },
  {
    label: 'Tertiary',
    tokens: [
      '--color-tertiary',
      '--color-on-tertiary',
      '--color-tertiary-container',
      '--color-on-tertiary-container',
      '--color-tertiary-dim',
    ],
  },
  {
    label: 'Tertiary Fixed',
    tokens: [
      '--color-tertiary-fixed',
      '--color-tertiary-fixed-dim',
      '--color-on-tertiary-fixed',
      '--color-on-tertiary-fixed-variant',
    ],
  },
  {
    label: 'Error',
    tokens: [
      '--color-error',
      '--color-on-error',
      '--color-error-container',
      '--color-on-error-container',
      '--color-error-dim',
    ],
  },
  {
    label: 'Surface',
    tokens: [
      '--color-surface',
      '--color-on-surface',
      '--color-on-surface-variant',
      '--color-surface-dim',
      '--color-surface-bright',
      '--color-surface-container-lowest',
      '--color-surface-container-low',
      '--color-surface-container',
      '--color-surface-container-high',
      '--color-surface-container-highest',
      '--color-surface-tint',
    ],
  },
  {
    label: 'Outline',
    tokens: ['--color-outline', '--color-outline-variant'],
  },
  {
    label: 'Inverse',
    tokens: ['--color-inverse-surface', '--color-inverse-on-surface'],
  },
  {
    label: 'Other',
    tokens: ['--color-shadow', '--color-scrim'],
  },
]

export interface MdTokenItem {
  token: MdTokenName
  label: string
}

const stripPrefix = (token: MdTokenName): string => token.slice('--color-'.length)

export const MD_TOKEN_ITEM_GROUPS: ReadonlyArray<{
  label: string
  items: ReadonlyArray<MdTokenItem>
}> = MD_TOKEN_GROUPS.map((g) => ({
  label: g.label,
  items: g.tokens.map((token) => ({ token, label: stripPrefix(token) })),
}))
