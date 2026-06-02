'use client'

import type { Mode } from '@tonex/core'
import type { ShadcnChartTokenName } from '@tonex/core/schema'
import { useSource } from '@tonex/core-react'
import { RoleEditor as RoleEditorShell } from '@/components/shared/role-editor'
import { useChartEditorData } from './use-chart-editor-data'

interface ChartEditorProps {
  token: ShadcnChartTokenName
  mode: Mode
}

export function ChartEditor({ token, mode }: ChartEditorProps) {
  const setOverride = useSource((s) => s.actions.setShadcnChartOverride)
  const { currentHex, overridden, contrast } = useChartEditorData(token, mode)

  return (
    <RoleEditorShell
      value={currentHex}
      onChange={(h) => setOverride(mode, token, h)}
      overridden={overridden}
      contrast={contrast}
      mode={mode}
    />
  )
}
