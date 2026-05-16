'use client'

import { type Mode, useSource } from '@tonex/core'
import type { ShadcnRoleName } from '@tonex/core/schema'
import { RoleEditor as RoleEditorShell } from '@/components/shared/role-editor'
import { useRoleEditorData } from './use-role-editor-data'

interface RoleEditorProps {
  role: ShadcnRoleName
  mode: Mode
}

export function RoleEditor({ role, mode }: RoleEditorProps) {
  const setOverride = useSource((s) => s.actions.setShadcnRoleOverride)
  const { currentHex, overridden, contrast } = useRoleEditorData(role, mode)

  return (
    <RoleEditorShell
      value={currentHex}
      onChange={(h) => setOverride(mode, role, h)}
      overridden={overridden}
      contrast={contrast}
      mode={mode}
    />
  )
}
