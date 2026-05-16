'use client'

import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react'
import { type Mode, useSource } from '@tonex/core'
import type { MdTokenName } from '@tonex/core/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ColorPicker, TwColorPicker } from '@/features/color-picker'
import { useHexFieldState } from '@/lib/hooks/use-hex-field-state'
import { useTokenEditorData } from './use-token-editor-data'

interface RoleEditorProps {
  role: MdTokenName
  mode: Mode
}

export function RoleEditor({ role, mode }: RoleEditorProps) {
  const setOverride = useSource((s) => s.actions.setMd3TokenOverride)
  const { currentHex, overridden, partner, ratio, passesAA, decorativePair } = useTokenEditorData(
    role,
    mode,
  )

  const { hexInput, handleChange, inputProps } = useHexFieldState(currentHex, (h) =>
    setOverride(mode, role, h),
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-mono">{role.slice('--color-'.length)}</Label>
        {overridden && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setOverride(mode, role, null)}
            title="Reset role"
          >
            <ArrowCounterClockwiseIcon />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ColorPicker
          value={currentHex}
          onChange={(h) => setOverride(mode, role, h)}
          align="start"
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
        <TwColorPicker currentColor={currentHex} onSelect={(h) => setOverride(mode, role, h)} />
      </div>

      <div className="h-8 rounded-md" style={{ backgroundColor: currentHex }} />

      {ratio !== null && partner !== null && (
        <div className="flex items-center justify-between text-xs font-medium">
          <span>vs {partner.slice('--color-'.length)}</span>
          <span
            className={
              decorativePair
                ? 'text-on-surface-variant'
                : passesAA
                  ? 'text-on-surface'
                  : 'text-error'
            }
          >
            {ratio.toFixed(1)}:1 {decorativePair ? 'Exempt' : passesAA ? 'AA' : 'Fail'}
          </span>
        </div>
      )}
    </div>
  )
}
