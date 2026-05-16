'use client'

import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react'
import { evaluateThemeContrast, type Mode, useResolvedTokens, useSource } from '@tonex/core'
import { hexString } from '@tonex/core/oklch'
import {
  SHADCN_CHART_TOKEN_NAMES,
  type ShadcnChartTokenName,
  type ShadcnRoleName,
} from '@tonex/core/schema'
import { cn } from 'tailwind-variants'
import { AnimatedCollapsible } from '@/components/shared/animated-collapsible'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ColorPicker, MdSnapshotPicker, TwColorPicker } from '@/features/color-picker'
import { ROLE_GROUPS } from '@/features/shadcn-override'
import { useActiveMode } from '@/features/theme-mode'
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
  const ratioByRole = new Map<ShadcnRoleName, ContrastBadgeData>()
  for (const r of report[mode]) {
    if (r.pair.layer !== 'shadcn') continue
    ratioByRole.set(r.pair.fg as ShadcnRoleName, {
      ratio: r.ratio,
      passes: r.passes,
      partner: r.pair.bg,
      threshold: r.pair.threshold,
    })
  }

  // why: ADR-0027 slice chart-3 parity — palettes page renders both role and
  // chart override surfaces; the rail mirrors that here as a parallel "Chart"
  // collapsible. Inline row-per-token (not the page-level swatch+popover)
  // avoids a popover handle collision with `ShadcnChartOverrideList` when
  // both surfaces are mounted on `/shadcn/palettes`, and keeps the rail's
  // dense single-column rhythm.
  const chartLayer = mode === 'light' ? theme.shadcn.lightChart : theme.shadcn.darkChart

  // why: chart tokens have multiple partner backgrounds (--background, --card),
  // unlike roles which are evaluated against a single partner. The badge tracks
  // the worst (min) ratio and which partner produced it, so the tooltip can name
  // it. `passes` ANDs across partners — pass-on-one/fail-on-other still flags.
  const chartContrastByToken = new Map<ShadcnChartTokenName, ContrastBadgeData>()
  for (const r of report[mode]) {
    if (r.pair.layer !== 'shadcn-chart') continue
    const token = r.pair.fg as ShadcnChartTokenName
    const existing = chartContrastByToken.get(token)
    const passes = (existing?.passes ?? true) && r.passes
    if (existing === undefined || r.ratio < existing.ratio) {
      chartContrastByToken.set(token, {
        ratio: r.ratio,
        passes,
        partner: r.pair.bg,
        threshold: r.pair.threshold,
      })
    } else {
      chartContrastByToken.set(token, { ...existing, passes })
    }
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
      <AnimatedCollapsible title="Chart" variant="ghost" defaultOpen={false} height={0}>
        <div className="flex flex-col gap-3 px-1 pb-2">
          {SHADCN_CHART_TOKEN_NAMES.map((token) => (
            <ChartOverrideRow
              key={token}
              token={token}
              mode={mode}
              currentArgb={chartLayer[token]}
              contrast={chartContrastByToken.get(token) ?? null}
            />
          ))}
        </div>
      </AnimatedCollapsible>
    </div>
  )
}

interface ContrastBadgeData {
  ratio: number
  passes: boolean
  partner: string
  threshold: number
}

// why: bare "1.0:1" chip was unintelligible — users couldn't tell what the
// number meant or what target to hit. The tooltip names the failing partner
// background and the required threshold so the next action is obvious. Shared
// between role and chart rows so the disclosure shape is uniform.
function ContrastBadge({ contrast }: { contrast: ContrastBadgeData | null }) {
  if (contrast === null || contrast.passes) return null
  const partnerLabel = contrast.partner.replace(/^--/, '')
  return (
    <Tooltip>
      <TooltipTrigger
        delay={0}
        render={
          <span className={cn('text-xs tabular-nums text-error cursor-help')}>
            {contrast.ratio.toFixed(1)}:1
          </span>
        }
      />
      <TooltipContent variant="inverse" side="top">
        <p className="text-xs">
          Fails contrast against <span className="font-mono">{partnerLabel}</span>
        </p>
        <p className="text-xs">
          {contrast.ratio.toFixed(1)}:1 (needs {contrast.threshold}:1)
        </p>
      </TooltipContent>
    </Tooltip>
  )
}

interface OverrideRowProps {
  role: ShadcnRoleName
  mode: Mode
  currentArgb: number | undefined
  contrast: ContrastBadgeData | null
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
        <ContrastBadge contrast={contrast} />
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

interface ChartOverrideRowProps {
  token: ShadcnChartTokenName
  mode: Mode
  currentArgb: number | undefined
  contrast: ContrastBadgeData | null
}

// why: parallel to OverrideRow but writes through setShadcnChartOverride and
// reads the chart layer. Badge surfaces the worst-case ratio across partner
// backgrounds (--background, --card) via the shared ContrastBadge.
function ChartOverrideRow({ token, mode, currentArgb, contrast }: ChartOverrideRowProps) {
  const overrides = useSource((s) => s.shadcnChartOverrides[mode])
  const setOverride = useSource((s) => s.actions.setShadcnChartOverride)
  const overridden = token in overrides
  const currentHex = currentArgb !== undefined ? hexString(currentArgb) : '#000000'
  const { hexInput, handleChange, inputProps } = useHexFieldState(currentHex, (h) =>
    setOverride(mode, token, h),
  )

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 h-6">
        {overridden && (
          <span className="size-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
        )}
        <div className="text-xs font-mono flex-1 truncate text-on-surface leading-snug">
          {token.slice(2)}
        </div>
        <ContrastBadge contrast={contrast} />
        {overridden && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setOverride(mode, token, null)}
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
          onChange={(h) => setOverride(mode, token, h)}
        />
        <TwColorPicker currentColor={currentHex} onSelect={(h) => setOverride(mode, token, h)} />
        <MdSnapshotPicker mode={mode} onSnapshot={(h) => setOverride(mode, token, h)} />
      </div>
    </div>
  )
}
