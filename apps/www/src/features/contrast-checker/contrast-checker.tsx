'use client'

import { useHotkey } from '@tanstack/react-hotkeys'
import { evaluateThemeContrast, type Mode, useResolvedTokens } from '@tonex/core'
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
import { ContrastLevelSlider } from '../contrast-level'
import { applyLevel } from './apply-level'
import { isDecorative } from './decorative'
import { DecorativeSection, SectionGroup } from './sections'
import type { Layer, Level } from './types'

interface BodyProps {
  theme: NonNullable<ReturnType<typeof useResolvedTokens>>
  mode: Mode
  level: Level
  setLevel: (v: Level) => void
  layer: Layer
}

function Body({ theme, mode, level, setLevel, layer }: BodyProps) {
  const report = evaluateThemeContrast(theme)
  // why: each route owns one layer's pairs AND its chart sibling. md route
  // surfaces `md` + `md-chart`; shadcn route surfaces `shadcn` + `shadcn-chart`.
  // Chart pairs land in their own 'Chart' family chip via grouping.familyOf
  // so they don't fold into Surface/Card. ADR-0027 c.5.
  const chartLayer = `${layer}-chart` as const
  const all = report[mode]
    .filter((r) => r.pair.layer === layer || r.pair.layer === chartLayer)
    .map((r) => applyLevel(r, level))
  const decorative = all.filter((p) => isDecorative(p.pair))
  const functional = all.filter((p) => !isDecorative(p.pair))
  const issues = functional.filter((p) => !p.effectivePasses)
  const passed = functional.filter((p) => p.effectivePasses)

  return (
    <>
      <DialogHeader className="flex-none gap-4">
        <div className="flex flex-row justify-between items-start gap-4">
          <div className="space-y-2">
            <DialogTitle>Contrast audit</DialogTitle>
            <DialogDescription>WCAG check for the current theme.</DialogDescription>
          </div>
          <div className="flex items-center gap-3">
            <ToggleGroup
              value={[level]}
              onValueChange={(v) => {
                if (v.length > 0) setLevel(v[v.length - 1] as Level)
              }}
              size="sm"
              variant="outline"
            >
              <ToggleGroupItem value="aa">AA</ToggleGroupItem>
              <ToggleGroupItem value="aaa">AAA</ToggleGroupItem>
            </ToggleGroup>
            <DialogClose
              render={
                <Button variant="outline" size="icon-sm">
                  <XIcon />
                </Button>
              }
            />
          </div>
        </div>
        <div className="flex items-end justify-between gap-6">
          {issues.length === 0 ? (
            <div className="font-semibold text-lg">No issues found</div>
          ) : (
            <div className="font-semibold text-lg text-amber-600 dark:text-amber-400">
              {issues.length} Issue{issues.length !== 1 ? 's' : ''} Found
            </div>
          )}
          <div className="w-60 max-w-[45%] shrink-0">
            <ContrastLevelSlider />
          </div>
        </div>
      </DialogHeader>
      <ScrollArea className="flex-1 min-h-0" gradientScrollFade noScrollBar>
        <div className="space-y-10">
          <SectionGroup pairs={issues} statusLabel="Failing" level={level} layer={layer} />
          <SectionGroup pairs={passed} statusLabel="Passing" level={level} layer={layer} />
          <DecorativeSection pairs={decorative} />
        </div>
      </ScrollArea>
    </>
  )
}

// why: route-colocated. Mounted inside MdNavTabs / ShadcnNavTabs so each
// route group gets its own checker — md users never see shadcn pairs and
// vice versa. Layer is fixed by the host route, not user-toggled. Mod+C
// hotkey is registered per-instance; only one mounts per page so no
// duplicate-binding risk. Current mode only via useActiveMode.
export function ContrastChecker({ layer }: { layer: Layer }) {
  useHotkey('Mod+C', () => checkContrastDialogHandle.open(null), {
    ignoreInputs: true,
    requireReset: true,
    meta: { name: 'Check contrast', description: 'Press ⌘+C to audit contrast' },
  })

  const styles = dialogContentStyles({ layout: 'scrollable' })
  const [level, setLevel] = useState<Level>('aa')
  const theme = useResolvedTokens()
  const mode = useActiveMode()

  return (
    <Dialog handle={checkContrastDialogHandle}>
      <DialogPortal>
        <DialogBackdrop />
        <DialogViewport className={styles.viewport({ className: 'pt-20 pb-12 sm:pt-16 sm:pb-8' })}>
          <DialogPopup className={styles.popup({ class: 'w-[min(60rem,calc(100vw-2rem))]' })}>
            {theme !== null && mode !== null ? (
              <Body theme={theme} mode={mode} level={level} setLevel={setLevel} layer={layer} />
            ) : null}
          </DialogPopup>
        </DialogViewport>
      </DialogPortal>
    </Dialog>
  )
}
