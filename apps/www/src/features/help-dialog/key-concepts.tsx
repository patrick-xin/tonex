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
              Tonex writes <span className="font-medium">both</span> themes from one seed — a light
              (<code className="font-mono text-xs">:root</code>) and a dark (
              <code className="font-mono text-xs">.dark</code>) block. The mode toggle (press{' '}
              <span className="font-medium">D</span>) is the same switch your users' OS flips.
            </p>
            <p>
              <span className="font-medium">Shared controls</span> — one value, used for both modes;
              editing changes light and dark together: seed color, scheme variant, contrast level,
              custom-color definitions, surface algorithm + neutral palette, palette overrides, CMF
              second source, chart settings.
            </p>
            <p>
              <span className="font-medium">Per-mode controls</span> — stored separately for light
              and dark; editing one leaves the other untouched: surface strength (Tint / Desaturate
              level), the Tint text accent level, role bindings, role overrides, md-token overrides,
              chart overrides.
            </p>
            <p>
              <span className="font-medium">Surface adjustment is split:</span> its algorithm and
              palette are shared, but all three strength sliders are per-mode. Set Tint to 50% in
              dark, switch to light, and the slider snaps to light's value (often 0%) — nothing was
              lost, your 50% is still on the dark side.
            </p>
            <p className="font-medium">The order that works:</p>
            <ul className="space-y-2 list-inside list-disc">
              <li>
                Set your shared foundation first — color, recipe, contrast, custom colors — in
                whatever mode you're in; it applies to both.
              </li>
              <li>
                Then polish one mode at a time: pick a mode, set its surface strength + any pinned
                colors, switch, repeat.
              </li>
              <li>
                Audit both modes before shipping — the contrast audit only reads the mode you're in,
                so a dark-only pass ships an unchecked light theme.
              </li>
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
          <AccordionPanel className="text-sm mb-3 px-0">
            <span className="font-medium">HCT (Hue, Chroma, Tone)</span> is Google's color model,
            built for Material Design 3. Unlike RGB or HSL, HCT is designed around how humans
            actually perceive color — so two colors at the same tone value appear equally bright
            regardless of hue. This makes it possible to generate color systems that are visually
            consistent and accessible by design, not by accident. Tonex uses Google's official
            @material/material-color-utilities library — real HCT math, not an approximation.
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
              <span className="font-medium">CMF</span> is Google's next-generation color algorithm,
              part of the Material Color Utilities 2026 spec — sourced directly from Google's
              repository before npm release. It's the most advanced scheme available in any color
              tool, and it's Tonex's default.
            </p>
            <p>
              What makes it different: CMF takes two source colors. Your primary, secondary, and
              neutral palettes derive from the first seed; your tertiary palette derives from the
              second, creating a richer two-color system that harmonizes automatically. CMF also
              applies higher chroma to surfaces — backgrounds carry real color, not near-neutral
              grey — while maintaining full accessibility through dynamic contrast curves. The
              primary tone follows your actual input rather than a fixed reference, so the result
              stays faithful to what you chose.
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
              Each variant applies a different algorithm to your seed color, producing a distinct
              palette character. Try a few — the same seed color behaves very differently across
              them.
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
                <span className="font-medium">Tint</span> — rebuilds your surfaces and borders from
                a Tailwind neutral palette you choose (zinc, slate, stone…), blended toward your
                brand hue by the strength slider.{' '}
                <span className="font-medium">0% is the plain neutral</span> (no brand character);
                higher pushes it toward your brand. Selecting Tint changes your surfaces right away.
                Text stays untouched unless you raise the separate{' '}
                <span className="font-medium">Text accent</span> slider, which nudges text toward
                your brand hue.
              </li>
              <li>
                <span className="font-medium">Desaturate</span> — pulls color out of Material's own
                surfaces toward grey. <span className="font-medium">0% leaves them unchanged</span>,
                while 100% is pure grey. It greys backgrounds, borders,{' '}
                <span className="font-medium">and</span> text together, so nothing stays tinted on a
                grey surface. No palette to pick.
              </li>
            </ul>
            <p>
              <span className="font-medium">The catch: the two zeros are opposites.</span>{' '}
              Desaturate at 0% leaves Material's surfaces untouched; Tint at 0% still rebuilds them
              from the plain neutral palette. Want untouched Material surfaces? Use{' '}
              <span className="font-medium">Desaturate at 0%</span>.
            </p>
            <p>
              Strength is <span className="font-medium">per-mode</span> (light and dark store
              separate values), while the algorithm and palette are shared — see{' '}
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
              --muted, etc.) so the output drops straight into any shadcn project. Some tokens
              intentionally share the same source tone — switch to MD3 mode for full independent
              control over every role.
            </p>
            <p>
              MD3 mode exposes the complete token system: all tonal palettes, every color role,
              per-token overrides, and native MD3 export formats. It's the full engine with no
              shortcuts.
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
              <span className="font-medium">Overrides</span>. They do different jobs, and you can
              use them together.
            </p>
            <ul className="space-y-2 list-inside list-disc">
              <li>
                <span className="font-medium">
                  Binding — point a role at a different generated color.
                </span>{' '}
                Each shadcn role follows one generated MD color; a binding changes{' '}
                <em>which one</em> (e.g. make <code className="font-mono text-xs">--accent</code>{' '}
                follow your secondary). It stays auto-generated — change your seed, variant, or
                contrast and the role re-derives with it. Defaults come from the active preset.
              </li>
              <li>
                <span className="font-medium">Override — lock a role to an exact color.</span> Pins
                the role to a fixed hex (hex field, color picker, a Tailwind swatch, or by
                snapshotting a generated color). It stops auto-generating — the seed can change,
                this stays put.
              </li>
            </ul>
            <p>
              <span className="font-medium">They compose, and the override wins.</span> A role
              resolves to its override hex if it has one, otherwise its binding-resolved color. If
              you both rebind and override a role, the override shows; the binding sits underneath,
              dormant, and comes back the moment you clear the override (the per-row reset).
            </p>
            <p>
              <span className="font-medium">Both are per-mode</span>, and{' '}
              <span className="font-medium">both land in your export exactly as you see them</span>{' '}
              — pin light <code className="font-mono text-xs">--ring</code> while dark stays on its
              binding, and the export matches the preview.
            </p>
            <p>
              <span className="font-medium">What survives what:</span> switching the{' '}
              <span className="font-medium">scheme variant</span> keeps both (bound colors just
              re-derive); switching a <span className="font-medium">shadcn preset</span> replaces
              your <span className="font-medium">bindings</span> but keeps your{' '}
              <span className="font-medium">overrides</span>. Strength, binding, and override are
              all per-mode — see{' '}
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
          <AccordionPanel className="text-sm mb-3 px-0">
            <p>
              Add custom palette slots beyond the six core MD3 roles. Each custom color is
              harmonized (optional) to your seed hue using HCT — so it stays visually coherent with
              the rest of your palette without manual tuning.
            </p>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
