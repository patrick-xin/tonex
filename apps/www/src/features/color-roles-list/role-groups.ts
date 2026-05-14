import { MD_CORE_TOKEN_NAMES, MD_EXTENDED_TOKEN_NAMES, type MdTokenName } from '@tonex/core/schema'

// why: classifier uses `includes`, not `startsWith` — `--color-on-primary`
// must fold into the primary family, but doesn't start with `--color-primary`.
type FamilyKey =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'error'
  | 'surface'
  | 'outline'
  | 'inverse'
  | 'utility'

const FAMILY_LABEL: Record<FamilyKey, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  tertiary: 'Tertiary',
  error: 'Error',
  surface: 'Surface',
  outline: 'Outline',
  inverse: 'Inverse',
  utility: 'Utility',
}

const FAMILY_ORDER: ReadonlyArray<FamilyKey> = [
  'primary',
  'secondary',
  'tertiary',
  'error',
  'surface',
  'outline',
  'inverse',
  'utility',
]

// why: branch order matters — `--color-inverse-primary` contains both 'inverse'
// and 'primary'; the inverse-prefix check must run first. Param is `string`
// (not `MdTokenName`) so the contrast-checker can classify pair.fg through the
// same rules — see `mdFamilyLabel`.
function familyOf(token: string): FamilyKey {
  if (token.startsWith('--color-inverse-')) return 'inverse'
  if (token === '--color-shadow' || token === '--color-scrim') return 'utility'
  if (token.includes('primary')) return 'primary'
  if (token.includes('secondary')) return 'secondary'
  if (token.includes('tertiary')) return 'tertiary'
  if (token.includes('error')) return 'error'
  if (token.includes('outline')) return 'outline'
  if (token.includes('surface')) return 'surface'
  return 'utility'
}

// why: shared with the contrast-checker md grouping so the inspect role list
// and the contrast table classify md tokens into the same families. The
// contrast table groups by pair.fg (the role under test).
export function mdFamilyLabel(token: string): string {
  return FAMILY_LABEL[familyOf(token)]
}

export const MD_FAMILY_ORDER: readonly string[] = FAMILY_ORDER.map((k) => FAMILY_LABEL[k])

export interface RoleGroup {
  label: string
  roles: readonly MdTokenName[]
}

export const ROLE_GROUPS: ReadonlyArray<RoleGroup> = (() => {
  const buckets = new Map<FamilyKey, MdTokenName[]>()
  for (const name of [...MD_CORE_TOKEN_NAMES, ...MD_EXTENDED_TOKEN_NAMES]) {
    const key = familyOf(name)
    const arr = buckets.get(key) ?? []
    arr.push(name)
    buckets.set(key, arr)
  }
  return FAMILY_ORDER.flatMap<RoleGroup>((key) => {
    const roles = buckets.get(key)
    return roles && roles.length > 0 ? [{ label: FAMILY_LABEL[key], roles }] : []
  })
})()
