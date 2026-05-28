'use client'

import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionSummary,
} from '@/components/ui/accordion'
import type { HelpSection } from './help-sections'
import { useHelpSectionOpen } from './use-help-section-open'

export const KeyConcepts = ({ section }: { section: HelpSection | null }) => {
  const { value, setValue } = useHelpSectionOpen(section, 'concepts', [])
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Key Concepts</h3>
      <Accordion
        className="w-full"
        value={value}
        onValueChange={(next) => setValue(next as string[])}
        multiple
      >
        <AccordionItem id="light-dark-modes" variant="underline" value="light-dark-modes">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            Light & dark — what's shared vs per-mode
          </AccordionSummary>
          <AccordionPanel className="text-sm mb-3 px-0 space-y-2">
            <p>
              tonex writes <span className="font-medium">both</span> themes from one seed — a light
              (<code className="font-mono text-xs">:root</code>) and a dark (
              <code className="font-mono text-xs">.dark</code>) block. Toggle modes with{' '}
              <span className="font-medium">D</span>.
            </p>
            <p>
              <span className="font-medium">Shared</span> (one value for both modes): seed color,
              scheme variant, contrast level, custom colors, surface algorithm + neutral palette,
              palette overrides, CMF second source, chart settings.
            </p>
            <p>
              <span className="font-medium">Per-mode</span> (stored separately): surface strength
              (Tint / Desaturate level), Tint text accent, role bindings, role overrides, md-token
              overrides, chart overrides.
            </p>
            <p>
              <span className="font-medium">Surface adjustment is split:</span> algorithm and
              palette are shared, the three strength sliders are per-mode. Set Tint to 50% in dark,
              switch to light, and the slider shows light's value — your dark 50% is intact.
            </p>
            <p className="font-medium">The order that works:</p>
            <ul className="space-y-2 list-inside list-disc">
              <li>Set the shared foundation first (color, recipe, contrast, custom colors).</li>
              <li>
                Polish one mode at a time: pick a mode, set surface strength + pinned colors,
                switch, repeat.
              </li>
              <li>Audit both modes — the contrast audit only reads the mode you're in.</li>
            </ul>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem id="hct" variant="underline" value="hct">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            What is HCT?
          </AccordionSummary>
          <AccordionPanel className="text-sm mb-3 px-0 space-y-2">
            <p>
              <span className="font-medium">HCT (Hue, Chroma, Tone)</span> is Google's color model
              for Material Design 3. Unlike RGB or HSL, it's built around human perception — colors
              at the same tone appear equally bright across hues. tonex uses Google's official{' '}
              <code className="font-mono text-xs">@material/material-color-utilities</code> — real
              HCT math, not an approximation.
            </p>
            <p>
              The hex field and the three sliders are{' '}
              <span className="font-medium">one color, fully two-way</span>: drag a slider and the
              hex updates; type a hex and the sliders follow.
            </p>
            <ul className="space-y-2 list-inside list-disc">
              <li>
                <span className="font-medium">Hue</span> — which color.
              </li>
              <li>
                <span className="font-medium">Chroma</span> — how vivid. Its maximum moves with hue
                and tone, so the slider can stop short of the end — some combinations can't go more
                saturated.
              </li>
              <li>
                <span className="font-medium">Tone</span> — how light or dark.
              </li>
            </ul>
            <p>
              On a near-grey the Hue slider greys out (no visible hue to adjust) — add a little
              chroma to re-enable it. Your pasted hex stays exact until you move a slider.
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
          <AccordionPanel className="text-sm mb-3 px-0 space-y-2">
            <p>
              <span className="font-medium">CMF</span> is Google's next-generation color algorithm
              from the Material Color Utilities 2026 spec, and tonex's default.
            </p>
            <p>
              It takes two source colors: primary, secondary, and neutral palettes derive from the
              first seed; tertiary derives from the second, for a two-color system that harmonizes
              automatically. CMF also gives surfaces real color rather than near-neutral grey — kept
              accessible by dynamic contrast — and the primary tone follows your input rather than a
              fixed reference.
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
          <AccordionPanel className="text-sm mb-3 px-0">
            <p className="mb-2">
              Each variant runs a different algorithm on your seed, for a distinct palette
              character. Try a few — the same seed behaves very differently across them.
            </p>
            <ul className="space-y-2 list-inside list-disc">
              <li>
                <span className="font-medium">CMF (App's Default)</span> — Stands for Color,
                Material, and Finish. Latest algorithm from Material Color Utilities (MCU).
              </li>
              <li>
                <span className="font-medium">Tonal Spot</span> — The default (2025) Material You
                scheme. Balanced chroma, works for most UIs.
              </li>
              <li>
                <span className="font-medium">Fidelity</span> — Stays close to your seed color. What
                you pick is roughly what you get.
              </li>
              <li>
                <span className="font-medium">Content</span> — Similar to Fidelity but more
                conservative. Good for image-heavy interfaces.
              </li>
              <li>
                <span className="font-medium">Vibrant</span> — Pushes chroma to the maximum for a
                bold, energetic palette.
              </li>
              <li>
                <span className="font-medium">Expressive</span> — Uses contrasting hues across roles
                for a dynamic, unexpected feel.
              </li>
              <li>
                <span className="font-medium">Fruit Salad</span> — Rotates hues across palette roles
                for a playful, multicolor result.
              </li>
              <li>
                <span className="font-medium">Rainbow</span> — Similar to Fruit Salad but with wider
                hue spread.
              </li>
              <li>
                <span className="font-medium">Neutral</span> — Desaturated. Minimal chroma, close to
                grayscale.
              </li>
              <li>
                <span className="font-medium">Monochrome</span> — Single hue, zero chroma variation.
                Ultra-minimal.
              </li>
            </ul>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem id="surface-adjustment" variant="underline" value="surface-adjustment">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            Surface adjustment — your neutral character
          </AccordionSummary>
          <AccordionPanel className="text-sm mb-3 px-0 space-y-2">
            <p>
              <span className="font-medium">Surface</span> is your neutral scaffolding — the
              backgrounds behind your content (background, cards, popovers, muted, sidebar), the
              hairline borders, and the text on them. It does{' '}
              <span className="font-medium">not</span> touch your brand colors.
            </p>
            <p>You pick one of two operations — there's no "off":</p>
            <ul className="space-y-2 list-inside list-disc">
              <li>
                <span className="font-medium">Tint</span> — rebuilds surfaces and borders from a
                Tailwind neutral palette you choose (zinc, slate, stone…), blended toward your brand
                hue by the strength slider. <span className="font-medium">0% is plain neutral</span>
                ; higher pushes toward your brand. Text stays untouched unless you raise the
                separate <span className="font-medium">Text accent</span> slider.
              </li>
              <li>
                <span className="font-medium">Desaturate</span> — pulls color out of Material's own
                surfaces toward grey. <span className="font-medium">0% leaves them unchanged</span>,
                100% is pure grey. Greys backgrounds, borders, and text together. No palette to
                pick.
              </li>
            </ul>
            <p>
              <span className="font-medium">The catch: the two zeros are opposites.</span>{' '}
              Desaturate 0% leaves Material's surfaces untouched; Tint 0% still rebuilds them from
              the plain neutral. Want untouched Material surfaces? Use{' '}
              <span className="font-medium">Desaturate at 0%</span>.
            </p>
            <p>
              Strength is <span className="font-medium">per-mode</span>; algorithm and palette are
              shared — see{' '}
              <span className="font-medium">Light &amp; dark — what's shared vs per-mode</span>.
            </p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem id="contrast-levels" variant="underline" value="contrast-levels">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            Contrast Levels
          </AccordionSummary>
          <AccordionPanel className="text-sm mb-3 px-0">
            <p className="mb-2">
              Controls the minimum contrast ratio between foreground and background tokens across
              your theme.
            </p>
            <ul className="space-y-2 list-inside list-disc">
              <li>
                <span className="font-medium">Standard</span> — WCAG AA compliant. The right default
                for most UIs.
              </li>
              <li>
                <span className="font-medium">Medium</span> — Between Standard and High. A subtle
                accessibility boost without changing the palette feel much.
              </li>
              <li>
                <span className="font-medium">High</span> — WCAG AAA compliant. Maximum readability,
                more conservative color choices.
              </li>
            </ul>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem id="shadcn-mode" variant="underline" value="shadcn-mode">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            Shadcn mode vs MD3 mode
          </AccordionSummary>
          <AccordionPanel className="text-sm mb-3 px-0">
            <p className="mb-2">
              Shadcn mode maps MD3 color roles to shadcn CSS variables (--primary, --background,
              --muted, etc.) so the output drops straight into any shadcn project. Some tokens share
              a source tone — switch to MD3 mode for independent control over every role.
            </p>
            <p>
              MD3 mode exposes the full token system: all tonal palettes, every color role,
              per-token overrides, and native MD3 export formats.
            </p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem id="bindings-overrides" variant="underline" value="bindings-overrides">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            Role bindings vs overrides
          </AccordionSummary>
          <AccordionPanel className="text-sm mb-3 px-0 space-y-2">
            <p>
              Two power-user editors on the shadcn rail —{' '}
              <span className="font-medium">Bindings</span> and{' '}
              <span className="font-medium">Overrides</span>. Different jobs; use them together.
            </p>
            <ul className="space-y-2 list-inside list-disc">
              <li>
                <span className="font-medium">
                  Binding — point a role at a different generated color.
                </span>{' '}
                Each shadcn role follows one generated MD color; a binding changes{' '}
                <em>which one</em> (e.g. make <code className="font-mono text-xs">--accent</code>{' '}
                follow your secondary). It stays auto-generated — change seed, variant, or contrast
                and the role re-derives. Defaults come from the active preset.
              </li>
              <li>
                <span className="font-medium">Override — lock a role to an exact color.</span> Pins
                it to a fixed hex (hex field, color picker, Tailwind swatch, or a snapshot of a
                generated color). Stops auto-generating — the seed can change, this stays put.
              </li>
            </ul>
            <p>
              <span className="font-medium">They compose, and the override wins.</span> A role
              resolves to its override hex if it has one, otherwise its binding. Clear the override
              (the per-row reset) and the binding comes back.
            </p>
            <p>
              <span className="font-medium">Both are per-mode</span> and{' '}
              <span className="font-medium">both land in your export exactly as you see them</span>{' '}
              — pin light <code className="font-mono text-xs">--ring</code> while dark stays on its
              binding, and the export matches the preview.
            </p>
            <p>
              <span className="font-medium">What survives what:</span> switching the{' '}
              <span className="font-medium">scheme variant</span> keeps both (bound colors
              re-derive); switching a <span className="font-medium">shadcn preset</span> replaces
              your <span className="font-medium">bindings</span> but keeps your{' '}
              <span className="font-medium">overrides</span>. See{' '}
              <span className="font-medium">Light &amp; dark — what's shared vs per-mode</span>.
            </p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem id="custom-colors" variant="underline" value="custom-colors">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            Custom Colors
          </AccordionSummary>
          <AccordionPanel className="text-sm mb-3 px-0 space-y-2">
            <p>
              Add palette slots beyond the six core MD3 roles. Each custom color is optionally
              harmonized to your seed hue via HCT, so it stays coherent with the rest of your
              palette.
            </p>
            <p>
              Output depends on your layer. On <span className="font-medium">md</span>, each emits
              the full Material set — <code className="font-mono text-xs">--{'{name}'}</code>,{' '}
              <code className="font-mono text-xs">--on-{'{name}'}</code>,{' '}
              <code className="font-mono text-xs">--{'{name}'}-container</code>, and{' '}
              <code className="font-mono text-xs">--on-{'{name}'}-container</code> — and the dialog
              previews all four.
            </p>
            <p>
              On <span className="font-medium">shadcn</span>, it emits one pair —{' '}
              <code className="font-mono text-xs">--{'{name}'}</code> +{' '}
              <code className="font-mono text-xs">--{'{name}'}-foreground</code> (use as{' '}
              <code className="font-mono text-xs">bg-{'{name}'}</code>). The source-pair picker (the
              vivid color or the soft container) chooses which generated md pair feeds it.
            </p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem id="export-dialog" variant="underline" value="export-dialog">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            What reaches your export
          </AccordionSummary>
          <AccordionPanel className="text-sm mb-3 px-0 space-y-2">
            <p>
              The export dialog turns your live theme into copy-paste CSS —{' '}
              <span className="font-medium">what it shows is exactly what you paste</span>, byte for
              byte. Your rail config <span className="font-medium">is</span> the theme.
            </p>
            <p>
              <span className="font-medium">Always included (the core theme):</span> seed color,
              scheme variant, contrast level, role bindings &amp; overrides, md-token &amp; palette
              overrides, surface adjustment, custom colors, and the CMF second source when a role
              uses it.
            </p>
            <p>
              <span className="font-medium">Off by default — flip a switch to add:</span>
            </p>
            <ul className="space-y-2 list-inside list-disc">
              <li>
                <span className="font-medium">Extended</span> — the extra Material surface and
                utility tokens.
              </li>
              <li>
                <span className="font-medium">Palette</span> — the full tonal ramp (
                <code className="font-mono text-xs">
                  --color-{'{family}'}-{'{tone}'}
                </code>
                , e.g. <code className="font-mono text-xs">bg-primary-50</code> through{' '}
                <code className="font-mono text-xs">-900</code>).
              </li>
              <li>
                <span className="font-medium">Chart</span> — the data-viz tokens (
                <code className="font-mono text-xs">--chart-1…5</code>). Tuning chart mode or
                multi-hue shapes these, but they only land in the export when{' '}
                <span className="font-medium">Chart</span> is on.
              </li>
              <li>
                <span className="font-medium">Contrast</span> — extra{' '}
                <code className="font-mono text-xs">.contrast-medium</code> /{' '}
                <code className="font-mono text-xs">.contrast-high</code> rule blocks (distinct from
                the always-applied contrast <span className="font-medium">level</span>).
              </li>
              <li>
                The shadcn route also has a <span className="font-medium">New project</span> switch
                — adds the shadcn boilerplate header.
              </li>
            </ul>
            <p>
              <span className="font-medium">Tabs pick format and layer, not content.</span>{' '}
              <span className="font-medium">Tailwind</span> emits the full md{' '}
              <code className="font-mono text-xs">globals.css</code> (
              <code className="font-mono text-xs">@theme inline</code> +{' '}
              <code className="font-mono text-xs">:root</code> +{' '}
              <code className="font-mono text-xs">.dark</code>);{' '}
              <span className="font-medium">shadcn</span> emits{' '}
              <code className="font-mono text-xs">:root</code> +{' '}
              <code className="font-mono text-xs">.dark</code> only (a drop-in over the shadcn CLI);{' '}
              <span className="font-medium">JSON</span> and{' '}
              <span className="font-medium">Dart</span> emit the same theme in those formats. An{' '}
              <span className="font-medium">oklch / hex</span> toggle applies where relevant.
            </p>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
