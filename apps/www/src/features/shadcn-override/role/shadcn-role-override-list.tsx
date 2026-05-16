'use client'

import type { ShadcnRoleName } from '@tonex/core/schema'
import { ColorTile } from '@/components/shared/color-tile'
import { createPopoverHandle, Popover, PopoverContent } from '@/components/ui/popover'
import { RoleEditor } from './role-editor'
import { PALETTE_GROUPS } from './role-groups'
import { useRoleTokens } from './use-role-tokens'

const popoverHandle = createPopoverHandle<ShadcnRoleName>()

export function ShadcnRoleOverrideList() {
  const data = useRoleTokens()
  if (data === null) return null
  const { mode, hexByRole, warnings, overrides } = data

  const renderSwatch = (role: ShadcnRoleName) => {
    const warning = warnings.get(role)
    return (
      <ColorTile
        key={role}
        payload={role}
        popoverHandle={popoverHandle}
        display={role.slice(2)}
        hex={hexByRole[role] ?? '#000000'}
        overridden={role in overrides}
        warning={
          warning === undefined
            ? undefined
            : { partnerLabel: warning.partner.slice(2), ratio: warning.ratio }
        }
        size="md"
      />
    )
  }

  return (
    <div className="m-px my-6">
      <div className="space-y-6">
        {PALETTE_GROUPS.map((group) => (
          <section key={group.label}>
            <p className="text-sm font-semibold uppercase tracking-wider mb-2">{group.label}</p>
            {group.kind === 'pair' ? (
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {group.columns.map((col, i) => (
                  <div key={String(i)} className="flex gap-2">
                    {col.map(renderSwatch)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">{group.roles.map(renderSwatch)}</div>
            )}
          </section>
        ))}
      </div>

      <Popover handle={popoverHandle}>
        {({ payload: role }) =>
          role !== undefined ? (
            <PopoverContent sideOffset={8} align="start" matchAnchorWidth>
              <RoleEditor key={role} role={role} mode={mode} />
            </PopoverContent>
          ) : null
        }
      </Popover>
    </div>
  )
}
