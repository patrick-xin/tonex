'use client'

import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionSummary,
} from '@/components/ui/accordion'
import type { HelpSection } from './help-sections'
import { useHelpSectionOpen } from './use-help-section-open'

export const QA = ({ section }: { section: HelpSection | null }) => {
  const { value, setValue } = useHelpSectionOpen(section, 'qa', [])
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Q&A</h3>
      <Accordion
        className="w-full"
        value={value}
        onValueChange={(next) => setValue(next as string[])}
        multiple
      >
        <AccordionItem id="md3-shadcn-mapping" variant="underline" value="md3-shadcn-mapping">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            How does Tonex map MD3 tokens to shadcn tokens?
          </AccordionSummary>
          <AccordionPanel className="text-sm mb-3 px-0 space-y-2">
            <p>Choose between two presets:</p>
            <ul className="space-y-2 list-inside list-disc">
              <li>
                <span className="font-medium">shadcn preset</span> — Maps MD3 colors to shadcn's
                expected format. Best for dropping into existing shadcn projects.
              </li>
              <li>
                <span className="font-medium">MD3 preset</span> — Direct MD3 semantic roles. More
                expressive, but looks different from stock shadcn.
              </li>
            </ul>
            <p className="mt-2">
              <span className="font-medium">Production ready?</span> Yes. Uses Google's official
              color utilities. The shadcn preset is designed as a compatible replacement.
            </p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem id="contrast-issues" variant="underline" value="contrast-issues">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            What does the contrast audit mean, and how do I fix a fail?
          </AccordionSummary>
          <AccordionPanel className="text-sm mb-3 px-0 space-y-2">
            <p>
              It's an <span className="font-medium">audit, not a gate</span> — it reports every
              color pair against WCAG, it never blocks your export. Most themes pass; the audit
              opens on "All" so you see the fails in proportion.
            </p>
            <p>What the colors mean:</p>
            <ul className="space-y-2 list-inside list-disc">
              <li>
                <span className="font-medium">Red — text fail</span> (under 4.5:1). A real
                readability problem; fix before shipping.
              </li>
              <li>
                <span className="font-medium">Amber — UI fail</span> (a border, ring, or fill under
                3:1). A judgment call — often fine for a faint divider, your decision.
              </li>
              <li>
                <span className="font-medium">Exempt</span> — decorative; WCAG doesn't require it.
              </li>
            </ul>
            <p>
              <span className="font-medium">How to fix one:</span>
            </p>
            <ul className="space-y-2 list-inside list-disc">
              <li>
                Raise the <span className="font-medium">Contrast level</span> in Settings — a global
                lever that pushes every pair toward AA/AAA.
              </li>
              <li>
                <span className="font-medium">Override</span> the failing role to a higher-contrast
                hex, or <span className="font-medium">rebind</span> it to a stronger generated color
                (see <span className="font-medium">Role bindings vs overrides</span>).
              </li>
            </ul>
            <p>There's no auto-fix engine today — these levers are how you act on a fail.</p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem
          id="brand-color-not-matching"
          variant="underline"
          value="brand-color-not-matching"
        >
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            Why isn't the primary color the same as my source color?
          </AccordionSummary>
          <AccordionPanel className="text-sm mb-3 px-0 space-y-2">
            <p>
              Your brand color sets the palette direction (hue, warmth). The exact shade on buttons
              is optimized for readability across light/dark modes.
            </p>
            <p>
              <span className="font-medium">Need exact match?</span> Use the "Source Color Fidelity"
              toggle to lock your input color, or override the primary token directly.
            </p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem id="hct-sliders" variant="underline" value="hct-sliders">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            What do the Hue, Chroma, and Tone sliders do?
          </AccordionSummary>
          <AccordionPanel className="text-sm mb-3 px-0 space-y-2">
            <p>
              The hex field and the three sliders are <span className="font-medium">one color</span>{' '}
              — edit either and the other follows. <span className="font-medium">Hue</span> is which
              color, <span className="font-medium">Chroma</span> is how vivid (its maximum moves
              with hue and tone, so it can stop short of the end), and{' '}
              <span className="font-medium">Tone</span> is how light or dark.
            </p>
            <p>
              On a near-grey the Hue slider greys out — there's no visible hue to adjust, so add a
              little chroma to bring it back. Your pasted hex is preserved exactly until you move a
              slider. See <span className="font-medium">What is HCT?</span> for the full model.
            </p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem id="md3-vs-shadcn-borders" variant="underline" value="md3-vs-shadcn-borders">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            Why do borders look different between presets?
          </AccordionSummary>
          <AccordionPanel className="text-sm mb-3 px-0 space-y-2">
            <p>
              Shadcn uses nearly invisible gray borders. MD3 uses chromatic borders that carry your
              brand hue. Switching presets changes the entire color philosophy.
            </p>
            <p>
              <span className="font-medium">Want MD3 colors with shadcn-style subtle borders?</span>{' '}
              Turn on the soft borders toggle in the theme settings. By design it binds{' '}
              <code className="font-mono text-xs">--border</code>,{' '}
              <code className="font-mono text-xs">--input</code>, and{' '}
              <code className="font-mono text-xs">--sidebar-border</code> to Material's faint{' '}
              <code className="font-mono text-xs">outline-variant</code> — a near-decorative
              divider.
            </p>
            <p>
              That pair sits below 3:1, so on the shadcn layer the audit flags it as an{' '}
              <span className="font-medium">amber UI fail</span> (the same pair is marked Exempt on
              the md layer). It's an aesthetic tradeoff, not a bug: keep soft borders for the
              quieter look, or turn them off for higher-contrast edges.
            </p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem
          id="dialog-colors-mismatch"
          variant="underline"
          value="dialog-colors-mismatch"
        >
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            Why do dialogs show different colors in preview?
          </AccordionSummary>
          <AccordionPanel className="text-sm mb-3 px-0 space-y-2">
            <p>
              Dialogs render outside the themed preview container (browser limitation). The colors
              you export are correct — they'll look right in your actual project.
            </p>
            <p>This is a preview limitation, not a theme bug.</p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem id="cmf-safety" variant="underline" value="cmf-safety">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            What is CMF and is it safe for production?
          </AccordionSummary>
          <AccordionPanel className="text-sm mb-3 px-0 space-y-2">
            <p>
              CMF takes two brand colors instead of one, building a coordinated palette from both.
            </p>
            <p>
              <span className="font-medium">Production ready?</span> Yes — it's based on Google's
              2026 Material spec. Less battle-tested than Tonal Spot, but uses Google's official
              color math.
            </p>
            <p>
              Use CMF if you have two distinct brand colors. Stick to Tonal Spot or Fidelity for a
              single-color theme.
            </p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem id="cmf-colors-different" variant="underline" value="cmf-colors-different">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            Why do CMF colors look so different?
          </AccordionSummary>
          <AccordionPanel className="text-sm mb-3 px-0 space-y-2">
            <p>
              CMF derives neutrals directly from your primary color at 20% vividness. This creates
              noticeably tinted surfaces — your brand color shows up everywhere.
            </p>
            <p>
              Other variants keep neutrals nearly gray. CMF tints the entire canvas, not just
              accents.
            </p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem id="cmf-no-effect-shadcn" variant="underline" value="cmf-no-effect-shadcn">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            I set a CMF second color but nothing changed — why?
          </AccordionSummary>
          <AccordionPanel className="text-sm mb-3 px-0 space-y-2">
            <p>
              The second source drives the <span className="font-medium">tertiary</span> palette. On
              the <span className="font-medium">md</span> layer that's always a visible role, so the
              change shows up immediately.
            </p>
            <p>
              On the <span className="font-medium">shadcn</span> layer, tertiary only reaches your
              export if the active preset maps a role to it. Most presets —{' '}
              <span className="font-medium">Default, Stark, Soft, Warm, Monotone</span> — don't, so
              the second source has no visible effect there.{' '}
              <span className="font-medium">Playful</span> and{' '}
              <span className="font-medium">Tech</span> do.
            </p>
            <p>
              To see it on shadcn: switch to a tertiary-driven preset, override a role to a tertiary
              token yourself (see <span className="font-medium">Role bindings vs overrides</span>),
              or view the md layer.
            </p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem id="preserve-brand-color" variant="underline" value="preserve-brand-color">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            Can I preserve my brand color while tweaking?
          </AccordionSummary>
          <AccordionPanel className="text-sm mb-3 px-0 space-y-2">
            <p>
              <span className="font-medium">Available now:</span>
            </p>
            <ul className="space-y-2 list-inside list-disc">
              <li>"Source Color Fidelity" toggle locks your input color</li>
              <li>Override individual palettes (secondary, tertiary, neutral) independently</li>
              <li>Lock feature saves your current theme for safe experimentation</li>
            </ul>
            <p>
              <span className="font-medium">Coming:</span> Fine-tuning individual hues without full
              palette replacement.
            </p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem id="vs-others" variant="underline" value="vs-others">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            Why choose Tonex instead of other theme generators?
          </AccordionSummary>
          <AccordionPanel className="text-sm mb-3 px-0 space-y-2">
            <p>
              <span className="font-medium">Tonex Color:</span> Algorithmic themes from your brand
              color. Unique to you, scales with rebrands, built-in accessibility, first-class dark
              mode.
            </p>
            <p>
              <span className="font-medium">Other color tools:</span> Hand-crafted presets. Faster
              if you just need something that looks good.
            </p>
            <p>
              Use this app if you have a brand color and want a principled system. Use other color
              tools if you need a quick preset.
            </p>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
