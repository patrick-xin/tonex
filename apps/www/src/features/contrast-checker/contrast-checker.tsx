'use client'

import { useHotkey } from '@tanstack/react-hotkeys'
import { evaluateThemeContrast, type Mode } from '@tonex/core'
import { MD_EXTENDED_TOKEN_NAMES } from '@tonex/core/schema'
import { useResolvedTokens, useSource } from '@tonex/core-react'
import { XIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogDescription,
  DialogHeader,
  DialogPopup,
  DialogPortal,
  DialogTitle,
  DialogViewport,
  dialogContentStyles,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useActiveMode } from '@/features/theme-mode'
import { checkContrastDialogHandle } from '@/lib/handles'
import type { Layer } from '@/lib/layer-context'
import { useUiPrefs } from '@/lib/stores/ui-prefs'
import { applyLevel } from './apply-level'
import { ContrastInfo } from './contrast-info'
import { ContrastTable } from './contrast-table'
import { isDecorative } from './decorative'
import { RESULT } from './result'
import { summarizeContrast } from './summary'
import type { Filter, Level, ResultFilter } from './types'

// why: showExtended (UiPrefs) hides MD3 extended roles on the md route — the
// same visibility pref color-roles-list honors. A pair counts as extended if
// either endpoint is an extended token; chart tokens aren't in this set so
// chart pairs are never gated. shadcn has no core/extended split.
const MD_EXTENDED_SET: ReadonlySet<string> = new Set(MD_EXTENDED_TOKEN_NAMES)

interface BodyProps {
  theme: NonNullable<ReturnType<typeof useResolvedTokens>>
  mode: Mode
  layer: Layer
}

function Body({ theme, mode, layer }: BodyProps) {
  const [level, setLevel] = useState<Level>('aa')
  const [filter, setFilter] = useState<Filter>('all')
  const [resultFilter, setResultFilter] = useState<ResultFilter>('all')
  const showExtended = useUiPrefs((s) => s.showExtended)
  const brandEnabled = useUiPrefs((s) => s.brandEnabled)
  const customColors = useSource((s) => s.customColors)
  // why: brand is shadcn-only (ADR-0032) — gate the opt-in eval on both the
  // layer and the editor's brand toggle. On the md route brandLayer never
  // matches the route filter anyway, but gating the eval keeps the report lean.
  const includeBrand = layer === 'shadcn' && brandEnabled
  const report = evaluateThemeContrast(theme, customColors, { includeBrand })
  // why: each route owns one layer's pairs AND its chart + custom siblings. md
  // route surfaces `md` + `md-chart` + `md-custom`; shadcn route surfaces the
  // `shadcn`-prefixed trio. Chart and custom pairs land in their own family
  // chips via grouping.familyOf so they don't fold into Surface/Card. ADR-0027
  // c.5; custom pairs per ADR-0025's anticipated pair-union widening.
  const chartLayer = `${layer}-chart` as const
  const customLayer = `${layer}-custom` as const
  // why: brand pairs (ADR-0032) ride alongside chart/custom on the shadcn
  // route. Only present in the report when includeBrand above; the filter just
  // lets them through to their Brand family chip (grouping.familyOf).
  const brandLayer = 'shadcn-brand'
  // why: `level` drives the WCAG threshold every pair is evaluated against —
  // applyLevel bakes effectivePasses/effectiveThreshold for the selected level
  // so the table stays in sync with the AA/AAA toggle. The showExtended gate
  // drops md extended-role pairs in lockstep with the inspect role list.
  const all = report[mode]
    .filter(
      (r) =>
        r.pair.layer === layer ||
        r.pair.layer === chartLayer ||
        r.pair.layer === customLayer ||
        r.pair.layer === brandLayer,
    )
    .filter(
      (r) =>
        showExtended ||
        layer !== 'md' ||
        (!MD_EXTENDED_SET.has(r.pair.fg) && !MD_EXTENDED_SET.has(r.pair.bg)),
    )
    .map((r) => applyLevel(r, level))
  const decorative = all.filter((p) => isDecorative(p.pair))
  const functional = all.filter((p) => !isDecorative(p.pair))
  // why: opening on "All" with a tally reframes the audit from a wall of
  // failures to the whole picture (mostly fine). The tally + legend copy lives
  // in ContrastInfo; Body just supplies the counts.
  const summary = summarizeContrast(functional, decorative.length)
  // why: a result filter is a dead end when its outcome has no members (e.g.
  // "Faint" with no failing UI pairs) — the toggle item disables and, if it was
  // the active view, falls back to 'all' so the table never renders empty.
  // Derived from the same summary tally the headline shows; tracks the level.
  const resultAvailable: Record<ResultFilter, boolean> = {
    all: true,
    pass: summary.pass > 0,
    fail: summary.textFail > 0,
    warn: summary.uiFail > 0,
  }
  const effectiveResultFilter: ResultFilter = resultAvailable[resultFilter] ? resultFilter : 'all'

  return (
    <>
      <DialogHeader className="flex-none gap-4 sm:gap-6">
        <div className="flex flex-row justify-between items-start gap-4">
          <div className="space-y-2 text-left">
            <DialogTitle>Contrast audit</DialogTitle>
            <div className="space-y-2">
              <DialogDescription>WCAG check for the current theme.</DialogDescription>
            </div>
          </div>
          <DialogClose
            render={
              <Button variant="outline" size="icon-sm">
                <XIcon />
              </Button>
            }
          />
        </div>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <ContrastInfo hasDecorative={decorative.length > 0} />
          <div className="flex gap-x-4 gap-y-2 flex-wrap">
            <ToggleGroup
              value={[effectiveResultFilter]}
              onValueChange={(v) => {
                if (v.length > 0) setResultFilter(v[v.length - 1] as ResultFilter)
              }}
              size="xs"
              variant="outline"
            >
              <ToggleGroupItem value="all">All</ToggleGroupItem>
              <ToggleGroupItem value="pass" disabled={summary.pass === 0}>
                {RESULT.pass.label}
              </ToggleGroupItem>
              <ToggleGroupItem value="fail" disabled={summary.textFail === 0}>
                {RESULT.fail.label}
              </ToggleGroupItem>
              <ToggleGroupItem value="warn" disabled={summary.uiFail === 0}>
                {RESULT.warn.label}
              </ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup
              value={[filter]}
              onValueChange={(v) => {
                if (v.length > 0) setFilter(v[v.length - 1] as Filter)
              }}
              size="xs"
              variant="outline"
            >
              <ToggleGroupItem value="all">All</ToggleGroupItem>
              <ToggleGroupItem value="text">Text</ToggleGroupItem>
              <ToggleGroupItem value="ui">UI</ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup
              value={[level]}
              onValueChange={(v) => {
                if (v.length > 0) setLevel(v[v.length - 1] as Level)
              }}
              size="xs"
              variant="outline"
            >
              <ToggleGroupItem value="aa">AA</ToggleGroupItem>
              <ToggleGroupItem value="aaa">AAA</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </DialogHeader>
      <ScrollArea className="flex-1 min-h-0" gradientScrollFade noScrollBar>
        <ContrastTable
          functional={functional}
          decorative={decorative}
          layer={layer}
          filter={filter}
          resultFilter={effectiveResultFilter}
        />
      </ScrollArea>
    </>
  )
}

// why: route-colocated. Mounted inside MdNavTabs / ShadcnNavTabs so each
// route group gets its own checker — md users never see shadcn pairs and
// vice versa. Layer is fixed by the host route, not user-toggled. Mod+A
// hotkey is registered per-instance; only one mounts per page so no
// duplicate-binding risk. Current mode only via useActiveMode.
export function ContrastChecker({ layer }: { layer: Layer }) {
  useHotkey('A', () => checkContrastDialogHandle.open(null), {
    ignoreInputs: true,
    requireReset: true,
    meta: { name: 'Check contrast', description: 'Press A to audit contrast' },
  })

  const styles = dialogContentStyles({ layout: 'scrollable' })
  const theme = useResolvedTokens()
  const mode = useActiveMode()

  return (
    <Dialog handle={checkContrastDialogHandle}>
      <DialogPortal>
        <DialogBackdrop />
        <DialogViewport
          className={styles.viewport({
            className: 'pt-20 pb-12 sm:pt-16 sm:pb-8',
          })}
        >
          <DialogPopup
            className={styles.popup({
              class: 'w-[min(60rem,calc(100vw-2rem))]',
            })}
          >
            {theme !== null && mode !== null ? (
              <Body theme={theme} mode={mode} layer={layer} />
            ) : null}
          </DialogPopup>
        </DialogViewport>
      </DialogPortal>
    </Dialog>
  )
}
