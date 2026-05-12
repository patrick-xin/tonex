import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionSummary,
} from '@/components/ui/accordion'

export const QA = () => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Q&A</h3>
      <Accordion className="w-full" defaultValue={[]} multiple>
        <AccordionItem variant="underline" value="md3-shadcn-mapping">
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
        <AccordionItem variant="underline" value="contrast-issues">
          <AccordionSummary
            variant="underline"
            className="text-base hover:text-primary hover:decoration-0"
          >
            Why do I see contrast issues with the shadcn preset?
          </AccordionSummary>
          <AccordionPanel className="text-sm mb-3 px-0 space-y-2">
            <p>
              The shadcn preset samples colors at fixed positions to match shadcn's look. With some
              source colors (especially vivid ones), this can produce insufficient contrast.
            </p>
            <p>
              <span className="font-medium">Solution:</span> Use the built-in contrast checker, then
              override failing tokens individually. The app supports per-token overrides for exactly
              this.
            </p>
            <p>
              <span className="font-medium">Alternative:</span> Try the MD3 preset — it uses
              semantic roles designed for contrast.
            </p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem variant="underline" value="brand-color-not-matching">
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
        <AccordionItem variant="underline" value="md3-vs-shadcn-borders">
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
              <span className="font-medium">Want MD3 colors with subtle borders?</span> Turn on the
              soft borders toggle in the theme settings in control panel. The only downside is this
              will create <span className="font-medium">contrast issues</span>. Use with caution.
            </p>
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem variant="underline" value="dialog-colors-mismatch">
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
        <AccordionItem variant="underline" value="cmf-safety">
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
        <AccordionItem variant="underline" value="cmf-colors-different">
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
        <AccordionItem variant="underline" value="preserve-brand-color">
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
        <AccordionItem variant="underline" value="vs-others">
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
