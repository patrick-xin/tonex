'use client'

import type { MdTokenName } from '@tonex/core/schema'
import { ColorTile } from '@/components/shared/color-tile'
import { SectionHeading } from '@/components/shared/section-heading'
import { createPopoverHandle, Popover, PopoverContent } from '@/components/ui/popover'
import { RoleEditor } from './role-editor'
import { useTokens } from './use-tokens'

const popoverHandle = createPopoverHandle<MdTokenName>()

export function ColorRolesList() {
  const data = useTokens()
  if (data === null) return null
  const { mode, hexByRole, warnings, overrides, filteredGroups } = data

  const renderSwatch = (role: MdTokenName) => {
    const warning = warnings.get(role)
    return (
      <ColorTile
        key={role}
        payload={role}
        popoverHandle={popoverHandle}
        display={role.slice('--color-'.length)}
        hex={hexByRole[role] ?? '#000000'}
        overridden={role in overrides}
        warning={warning}
      />
    )
  }

  return (
    <div className="space-y-6">
      {filteredGroups.map((group) => (
        <section key={group.label}>
          <SectionHeading className="mb-2">{group.label}</SectionHeading>
          <div className="flex flex-wrap gap-2">{group.roles.map(renderSwatch)}</div>
        </section>
      ))}

      <Popover handle={popoverHandle}>
        {({ payload: role }) =>
          role !== undefined ? (
            <PopoverContent sideOffset={8} align="center">
              <RoleEditor key={role} role={role} mode={mode} />
            </PopoverContent>
          ) : null
        }
      </Popover>
    </div>
  )
}
