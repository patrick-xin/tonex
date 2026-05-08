import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionSummary,
} from '@/components/ui/accordion'

export const KeyConcepts = () => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Key Concepts</h3>
      <Accordion className="w-full" defaultValue={['hct']} multiple>
        <AccordionItem variant="underline" value="hct">
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
        <AccordionItem variant="underline" value="cmf">
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
        <AccordionItem variant="underline" value="scheme-variants">
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
        <AccordionItem variant="underline" value="contrast-levels">
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
        <AccordionItem variant="underline" value="shadcn-mode">
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
        <AccordionItem variant="underline" value="custom-colors">
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
