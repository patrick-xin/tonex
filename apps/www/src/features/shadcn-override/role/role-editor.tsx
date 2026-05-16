'use client'

import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react'
import { type Mode, useSource } from '@tonex/core'
import type { ShadcnRoleName } from '@tonex/core/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ColorPicker, MdSnapshotPicker, TwColorPicker } from '@/features/color-picker'
import { useHexFieldState } from '@/lib/hooks/use-hex-field-state'
import { useRoleEditorData } from './use-role-editor-data'

interface RoleEditorProps {
  role: ShadcnRoleName
  mode: Mode
}

export function RoleEditor({ role, mode }: RoleEditorProps) {
  const setOverride = useSource((s) => s.actions.setShadcnRoleOverride)
  const { currentHex, overridden, partner, ratio, passesAA } = useRoleEditorData(role, mode)

  const { hexInput, handleChange, inputProps } = useHexFieldState(currentHex, (h) =>
    setOverride(mode, role, h),
  )

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between h-8">
        {ratio !== null && partner !== null && (
          <div className="flex items-center justify-between text-xs w-full text-on-surface-variant mr-2">
            <div>vs {partner.slice(2)}</div>
            <div className={passesAA ? 'text-on-surface-variant' : 'text-error'}>
              {ratio.toFixed(1)}:1 {passesAA ? 'AA' : 'Fail'}
            </div>
          </div>
        )}

        {overridden && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setOverride(mode, role, null)}
            title="Reset override"
          >
            <ArrowCounterClockwiseIcon />
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <ColorPicker
            align="start"
            value={currentHex}
            onChange={(h) => setOverride(mode, role, h)}
          />
          <Input
            autoFocus
            className="font-mono flex-1"
            inputSize="sm"
            type="text"
            value={hexInput}
            onChange={(e) => handleChange(e.target.value)}
            {...inputProps}
            maxLength={7}
            spellCheck={false}
            placeholder="#000000"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <TwColorPicker currentColor={currentHex} onSelect={(h) => setOverride(mode, role, h)} />
          <MdSnapshotPicker mode={mode} onSnapshot={(h) => setOverride(mode, role, h)} />
        </div>
      </div>
    </div>
  )
}
