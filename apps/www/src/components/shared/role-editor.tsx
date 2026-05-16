'use client'

import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react'
import type { Mode } from '@tonex/core'
import { ContrastBadge, type ContrastBadgeData } from '@/components/shared/contrast-badge'
import { HexInputField } from '@/components/shared/hex-input-field'
import { Button } from '@/components/ui/button'
import { ColorPicker, MdSnapshotPicker, TwColorPicker } from '@/features/color-picker'

interface RoleEditorProps {
  value: string
  onChange: (hex: string | null) => void
  overridden: boolean
  contrast?: ContrastBadgeData | null
  mode?: Mode
}

export function RoleEditor({
  value,
  onChange,
  overridden,
  contrast = null,
  mode,
}: RoleEditorProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between h-8">
        {contrast !== null && (
          <div className="flex justify-between w-full items-center text-xs">
            <div>vs {contrast.partner.replace(/^--(?:color-)?/, '')}</div>
            <ContrastBadge
              contrast={contrast}
              render={
                <div className="flex items-center gap-1 mr-2 cursor-help">
                  <span
                    className={
                      contrast.decorative || contrast.passes
                        ? 'text-on-surface-variant'
                        : 'text-error'
                    }
                  >
                    {contrast.ratio.toFixed(1)}:1{' '}
                    {contrast.decorative ? 'Exempt' : contrast.passes ? 'AA' : 'Fail'}
                  </span>
                </div>
              }
            />
          </div>
        )}
        {overridden && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onChange(null)}
            title="Reset override"
          >
            <ArrowCounterClockwiseIcon />
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <ColorPicker align="start" value={value} onChange={onChange} />
          <HexInputField value={value} onChange={onChange} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TwColorPicker currentColor={value} onSelect={onChange} />
          {mode !== undefined && <MdSnapshotPicker mode={mode} onSnapshot={onChange} />}
        </div>
      </div>
    </div>
  )
}
