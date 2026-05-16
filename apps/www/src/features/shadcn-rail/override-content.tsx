'use client'

import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react'
import { type Mode, useSource } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import { SHADCN_CHART_TOKEN_NAMES } from '@tonex/core/schema'
import { AnimatedCollapsible } from '@/components/shared/animated-collapsible'
import { ContrastBadge, type ContrastBadgeData } from '@/components/shared/contrast-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ColorPicker, MdSnapshotPicker, TwColorPicker } from '@/features/color-picker'
import { ROLE_GROUPS } from '@/features/shadcn-override'
import { useHexFieldState } from '@/lib/hooks/use-hex-field-state'
import { useOverrideData } from './use-override-data'

export function ShadcnOverrideContent() {
  const data = useOverrideData()
  const setRoleOverride = useSource((s) => s.actions.setShadcnRoleOverride)
  const setChartOverride = useSource((s) => s.actions.setShadcnChartOverride)
  const roleOverrides = useSource((s) => (data === null ? null : s.shadcnRoleOverrides[data.mode]))
  const chartOverrides = useSource((s) =>
    data === null ? null : s.shadcnChartOverrides[data.mode],
  )

  if (data === null || roleOverrides === null || chartOverrides === null) return null
  const { mode, roleLayer, chartLayer, roleContrastByRole, chartContrastByToken } = data

  return (
    <div className="flex flex-col">
      {ROLE_GROUPS.map((group, index) => (
        <AnimatedCollapsible
          key={group.label}
          title={group.label}
          variant="ghost"
          defaultOpen={index === 0}
          height={0}
          className="text-sm font-semibold capitalize tracking-wider"
          overridden={group.roles.some((role) => role in roleOverrides)}
        >
          <div className="flex flex-col gap-3 pb-2">
            {group.roles.map((role) => (
              <OverrideRow
                key={role}
                mode={mode}
                display={role.slice(2)}
                currentArgb={roleLayer[role]}
                contrast={roleContrastByRole.get(role) ?? null}
                overridden={role in roleOverrides}
                setOverride={(h) => setRoleOverride(mode, role, h)}
              />
            ))}
          </div>
        </AnimatedCollapsible>
      ))}
      <AnimatedCollapsible
        title="Chart"
        variant="ghost"
        defaultOpen={false}
        height={0}
        className="text-sm font-semibold tracking-wider"
        overridden={Object.keys(chartOverrides).length > 0}
      >
        <div className="flex flex-col gap-3 px-1 pb-2">
          {SHADCN_CHART_TOKEN_NAMES.map((token) => (
            <OverrideRow
              key={token}
              mode={mode}
              display={token.slice(2)}
              currentArgb={chartLayer[token]}
              contrast={chartContrastByToken.get(token) ?? null}
              overridden={token in chartOverrides}
              setOverride={(h) => setChartOverride(mode, token, h)}
            />
          ))}
        </div>
      </AnimatedCollapsible>
    </div>
  )
}

interface OverrideRowProps {
  mode: Mode
  display: string
  currentArgb: number | undefined
  contrast: ContrastBadgeData | null
  overridden: boolean
  setOverride: (hex: string | null) => void
}

function OverrideRow({
  mode,
  display,
  currentArgb,
  contrast,
  overridden,
  setOverride,
}: OverrideRowProps) {
  const currentHex = currentArgb !== undefined ? hexString(currentArgb) : '#000000'
  const { hexInput, handleChange, inputProps } = useHexFieldState(currentHex, setOverride)

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 h-6">
        <div className="text-xs font-mono flex-1 truncate text-on-surface leading-snug">
          {display}
        </div>
        <ContrastBadge contrast={contrast} />
        {overridden && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setOverride(null)}
            title="Reset override"
          >
            <ArrowCounterClockwiseIcon />
          </Button>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <Input
          className="font-mono text-xs flex-1 min-w-0"
          inputSize="sm"
          value={hexInput}
          onChange={(e) => handleChange(e.target.value)}
          {...inputProps}
          maxLength={7}
          spellCheck={false}
          placeholder="#000000"
        />
        <ColorPicker align="start" value={currentHex} onChange={setOverride} />
        <TwColorPicker currentColor={currentHex} onSelect={setOverride} />
        <MdSnapshotPicker mode={mode} onSnapshot={setOverride} />
      </div>
    </div>
  )
}
