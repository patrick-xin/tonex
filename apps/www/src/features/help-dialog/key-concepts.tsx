'use client'

import type { ReactNode } from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionSummary,
} from '@/components/ui/accordion'
import { Kbd } from '@/components/ui/kbd'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/tables'
import type { HelpSection } from './help-sections'
import { type ConceptRow, MODE_SCOPE_ROWS, SCHEME_VARIANT_ROWS } from './key-concepts.data'
import { useHelpSectionOpen } from './use-help-section-open'

/** Generic two-column reference table shared by the tabular Key Concepts panels. */
const ConceptTable = ({
  headers,
  rows,
}: {
  headers: readonly [ReactNode, ReactNode]
  rows: readonly ConceptRow[]
}) => (
  <Table className="-mx-1.5">
    <TableHeader>
      <TableRow>
        <TableHead>{headers[0]}</TableHead>
        <TableHead>{headers[1]}</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.map((row) => (
        <TableRow key={row.key} className="border-outline-variant/20">
          <TableCell className="align-top font-medium whitespace-normal">{row.col1}</TableCell>
          <TableCell className="align-top whitespace-normal text-on-surface-variant">
            {row.col2}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)

export const KeyConcepts = ({ section }: { section: HelpSection | null }) => {
  const { value, setValue } = useHelpSectionOpen(section, 'concepts', [])
  return (
    <div className="space-y-2">
      <Accordion
        className="w-full text-base"
        value={value}
        onValueChange={(next) => setValue(next as string[])}
        multiple
      >
        <AccordionItem id="light-dark-modes" variant="underline" value="light-dark-modes">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            Light & Dark Mode
          </AccordionSummary>
          <AccordionPanel className="test-base mb-3 px-0 space-y-2">
            <p>
              Some settings apply to both modes at once; others only to the mode you're editing.
            </p>
            <ConceptTable headers={['Setting', 'Scope']} rows={MODE_SCOPE_ROWS} />
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem id="workflow" variant="underline" value="workflow">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            Workflow
          </AccordionSummary>
          <AccordionPanel className="test-base mb-3 px-0 space-y-2">
            <ol className="space-y-2 list-inside list-decimal">
              <li>Start with the shared settings — they carry into both modes at once.</li>
              <li>
                Refine each mode on its own: tweak, switch with <Kbd>D</Kbd>, repeat for the other.
              </li>
              <li>
                Audit contrast with <Kbd>A</Kbd> — it only reads the active mode, so check both.
              </li>
              <li>
                Export with <Kbd>E</Kbd> — pick your format, download or copy to your project.
              </li>
            </ol>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem id="source-color" variant="underline" value="source-color">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            Source Color
          </AccordionSummary>
          <AccordionPanel className="mb-3 px-0 space-y-2">
            <p>
              The source color is the starting point for the whole theme. Pick a brand color, a
              product accent, or any color you want the palette to orbit around.
            </p>
            <p>
              Tonex stores that choice as HCT, so the sliders describe how people perceive the
              color: hue for the family, chroma for vividness, and tone for lightness. The hex field
              and the HCT controls stay linked.
            </p>
            <p>
              Changing the source color rebuilds generated roles, tonal palettes, and exports while
              keeping your later adjustments layered on top.
            </p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem id="hct" variant="underline" value="hct">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            HCT
          </AccordionSummary>
          <AccordionPanel className="mb-3 px-0 space-y-2">
            <p>
              <span className="font-medium">HCT (Hue, Chroma, Tone)</span> is Google's color model
              for Material Design 3. Unlike RGB or HSL, it follows human perception: colors at the
              same tone look equally bright across every hue. tonex uses Google's official{' '}
              <code className="font-mono text-xs">@material/material-color-utilities</code>.
            </p>
            <p>
              The hex field and the three sliders are the same color. Edit either one and the other
              updates. A hex you paste stays exact until you move a slider.
            </p>
            <ul className="space-y-2 list-inside list-disc">
              <li>
                <span className="font-medium">Hue</span> — which color.
              </li>
              <li>
                <span className="font-medium">Chroma</span> — how vivid. The slider can stop before
                the end: at some hues and tones, a color can't get any more vivid.
              </li>
              <li>
                <span className="font-medium">Tone</span> — how light or dark.
              </li>
            </ul>
            <p>
              Near-grey colors have no hue to adjust, so the Hue slider turns off. Add a little
              chroma to bring it back.
            </p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem id="cmf" variant="underline" value="cmf">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            CMF
          </AccordionSummary>
          <AccordionPanel className="test-base mb-3 px-0 space-y-2">
            <p>
              <span className="font-medium">CMF</span> is the color algorithm from Material Color
              Utilities' 2026 spec, and tonex's default.
            </p>
            <p>
              The primary color keeps your seed's tone: a light seed gives a light primary, a dark
              seed a dark one. Other algorithms pull primary to a fixed lightness instead. Add a
              second source color and the tertiary palette derives from it, for a two-hue system.
              With one seed, every palette comes from that seed.
            </p>
            <p>
              CMF also gives surfaces real color rather than near-neutral grey — kept accessible by
              dynamic contrast — and the primary tone follows your input rather than a fixed
              reference.
            </p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem id="scheme-variants" variant="underline" value="scheme-variants">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            Scheme Variants
          </AccordionSummary>
          <AccordionPanel className="test-base mb-3 px-0">
            <p className="mb-2">
              Each variant runs a different algorithm on your seed, for a distinct palette
              character. Try a few — the same seed behaves very differently across them.
            </p>
            <ConceptTable headers={['Variant', 'Character']} rows={SCHEME_VARIANT_ROWS} />
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem id="surface-adjustment" variant="underline" value="surface-adjustment">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            Surface Adjustment
          </AccordionSummary>
          <AccordionPanel className="text-sm mb-3 px-0 space-y-2">
            <p>
              <span className="font-medium">Surfaces</span> are the neutral backgrounds behind your
              content — background, cards, popovers, muted, sidebar — plus their hairline borders
              and the text on them. Adjusting them never touches your brand colors.
            </p>
            <p>Surfaces always use one of two algorithms:</p>
            <ul className="space-y-2 list-inside list-disc">
              <li>
                <span className="font-medium">Tint</span> — rebuilds surfaces and borders from a
                Tailwind neutral you pick (zinc, slate, stone…). The strength slider blends them
                toward your brand hue: <span className="font-medium">0% is plain neutral</span>,
                higher leans into your brand. Text stays neutral unless you raise the separate{' '}
                <span className="font-medium">Text accent</span> slider.
              </li>
              <li>
                <span className="font-medium">Desaturate</span> — pulls the color out of Material's
                surfaces toward grey. <span className="font-medium">0% leaves them unchanged</span>,
                100% is full grey. Backgrounds, borders, and text grey together. No palette to pick.
              </li>
            </ul>
            <p>
              The two differ at 0%. Desaturate 0% leaves Material's surfaces unchanged; Tint 0%
              rebuilds them from the plain neutral. To keep Material's surfaces as they are, use
              Desaturate at 0%.
            </p>
            <p>
              Strength is <span className="font-medium">per-mode</span>; algorithm and palette are
              shared across both modes — see{' '}
              <span className="font-medium">Light &amp; dark mode</span>.
            </p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem id="bindings-overrides" variant="underline" value="bindings-overrides">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            Role Bindings & Overrides
          </AccordionSummary>
          <AccordionPanel className="text-base mb-3 px-0 space-y-2">
            <p>
              Two editors on the shadcn rail: <span className="font-medium">Bindings</span> and{' '}
              <span className="font-medium">Overrides</span>. Different jobs, used together.
            </p>
            <ul className="space-y-2 list-inside list-disc">
              <li>
                <span className="font-medium">Binding</span> — point a role at a different generated
                color. Each shadcn role follows one generated color; a binding changes which one
                (e.g. make <code className="font-mono text-xs">--accent</code> follow your
                secondary). The role stays automatic: change the seed, variant, or contrast and its
                color updates to match. Defaults come from the active preset.
              </li>
              <li>
                <span className="font-medium">Override</span> — lock a role to an exact color. Pins
                it to a fixed hex (hex field, color picker, Tailwind swatch, or a snapshot of a
                generated color). The role stops updating: change the seed and it stays put.
              </li>
            </ul>
            <p>
              Set both on one role and the override wins — the role shows your pinned hex. Clear the
              override with the per-row reset and the role goes back to its binding.
            </p>
            <p>
              Both are per-mode, and both export exactly as you see them. Pin light{' '}
              <code className="font-mono text-xs">--ring</code> while dark stays on its binding, and
              the export matches the preview.
            </p>
            <p>
              Switching the scheme variant keeps both — bound colors update. Switching a shadcn
              preset replaces your bindings but keeps your overrides. See{' '}
              <span className="font-medium">Light &amp; dark mode</span>.
            </p>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
