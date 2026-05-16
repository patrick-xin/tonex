'use client'

import { type Mode, useSource } from '@tonex/core'
import type { MdTokenName } from '@tonex/core/schema'
import { RoleEditor as RoleEditorShell } from '@/components/shared/role-editor'
import { useTokenEditorData } from './use-token-editor-data'

interface RoleEditorProps {
  role: MdTokenName
  mode: Mode
}

export function RoleEditor({ role, mode }: RoleEditorProps) {
  const setOverride = useSource((s) => s.actions.setMd3TokenOverride)
  const { currentHex, overridden, contrast } = useTokenEditorData(role, mode)

  return (
    <RoleEditorShell
      value={currentHex}
      onChange={(h) => setOverride(mode, role, h)}
      overridden={overridden}
      contrast={contrast}
    />
  )
}
