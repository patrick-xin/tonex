'use client'

import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react'
import { evaluateThemeContrast, type Mode, useResolvedTokens, useSource } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import type { ShadcnRoleName } from '@tonex/core/schema'
import { cn } from 'tailwind-variants'
import { AnimatedCollapsible } from '@/components/shared/animated-collapsible'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ColorPicker } from '@/features/color-picker'
import { MdSnapshotPicker } from '@/features/shadcn-role-override/md-snapshot-picker'
import { ROLE_GROUPS } from '@/features/shadcn-role-override/role-groups'
import { useActiveMode } from '@/features/theme-mode'
import { TwColorPicker } from '@/features/tw-color-picker'
import { useHexFieldState } from '@/lib/hooks/use-hex-field-state'

// why: prototype rail-takeover override editor. Lifted layout from legacy
// custom-colors-content.tsx — group collapsibles + row-per-role with inline
// hex input + swatch popover + TW picker + MD-snapshot picker. Single mode
// (current); bindings is its own takeover. Auto-saves via setShadcnRoleOverride.
export function ShadcnOverrideContent() {
  const theme = useResolvedTokens()
  const mode = useActiveMode()
  if (theme === null || mode === null) return null

  const report = evaluateThemeContrast(theme)
  const ratioByRole = new Map<ShadcnRoleName, { ratio: number; passes: boolean }>()
  for (const r of report[mode]) {
    if (r.pair.layer !== 'shadcn') continue
    ratioByRole.set(r.pair.fg as ShadcnRoleName, { ratio: r.ratio, passes: r.passes })
  }

  return (
    <div className="flex flex-col">
      {ROLE_GROUPS.map((group, index) => (
        <AnimatedCollapsible
          key={group.label}
          title={group.label}
          variant="ghost"
          defaultOpen={index === 0}
          height={0}
        >
          <div className="flex flex-col gap-3 px-1 pb-2">
            {group.roles.map((role) => (
              <OverrideRow
                key={role}
                role={role}
                mode={mode}
                currentArgb={theme.shadcn[mode][role]}
                contrast={ratioByRole.get(role) ?? null}
              />
            ))}
          </div>
        </AnimatedCollapsible>
      ))}
    </div>
  )
}

interface OverrideRowProps {
  role: ShadcnRoleName
  mode: Mode
  currentArgb: number | undefined
  contrast: { ratio: number; passes: boolean } | null
}

function OverrideRow({ role, mode, currentArgb, contrast }: OverrideRowProps) {
  const overrides = useSource((s) => s.shadcnRoleOverrides[mode])
  const setOverride = useSource((s) => s.actions.setShadcnRoleOverride)
  const overridden = role in overrides
  const currentHex = currentArgb !== undefined ? hexString(currentArgb) : '#000000'
  const { hexInput, handleChange, inputProps } = useHexFieldState(currentHex, (h) =>
    setOverride(mode, role, h),
  )

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 h-6">
        {overridden && (
          <span className="size-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
        )}
        <div className="text-xs font-mono flex-1 truncate text-on-surface leading-snug">{role}</div>
        {contrast !== null && !contrast.passes && (
          <span className={cn('text-xs tabular-nums text-error')}>
            {contrast.ratio.toFixed(1)}:1
          </span>
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
        <ColorPicker
          align="start"
          value={currentHex}
          onChange={(h) => setOverride(mode, role, h)}
        />
        <TwColorPicker currentColor={currentHex} onSelect={(h) => setOverride(mode, role, h)} />
        <MdSnapshotPicker mode={mode} onSnapshot={(h) => setOverride(mode, role, h)} />
      </div>
    </div>
  )
}
