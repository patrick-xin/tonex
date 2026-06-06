import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionSummary,
} from '@/components/ui/accordion'

export interface QAItemData {
  id: string
  question: string
  answer: React.ReactNode
}

export const QA_ITEMS: QAItemData[] = [
  {
    id: 'md3-shadcn-mapping',
    question: 'How does tonex map MD3 tokens to shadcn tokens?',
    answer: (
      <>
        <p>
          tonex always generates the full MD3 palette from your seed, then the active{' '}
          <span className="font-medium">shadcn preset</span> decides how those MD3 colors bind to
          shadcn's tokens (<code className="font-mono text-xs">--primary</code>,{' '}
          <code className="font-mono text-xs">--border</code>, and the rest).
        </p>
        <p>
          The presets — Default, Stark, Soft, Warm, Playful, Monotone, Tech — are different binding
          styles, from a stock-shadcn look to more expressive, chromatic ones. Pick the one that
          fits; switch any time in Settings.
        </p>
        <p>
          <span className="font-medium">Production ready?</span> Yes — it uses Google's official
          color utilities, and Default is designed as a drop-in shadcn replacement.
        </p>
      </>
    ),
  },
  {
    id: 'contrast-issues',
    question: 'What does the contrast audit mean, and how do I fix a fail?',
    answer: (
      <>
        <p>
          It's an <span className="font-medium">audit, not a gate</span> — it reports every color
          pair against WCAG, it never blocks your export. Most themes pass; the audit opens on "All"
          so you see the fails in proportion.
        </p>
        <p>What the colors mean:</p>
        <ul className="space-y-2 list-inside list-disc">
          <li>
            <span className="font-medium">Red — text fail</span> (under 4.5:1). A real readability
            problem; fix before shipping.
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
            <span className="font-medium">Override</span> the failing role to a higher-contrast hex,
            or <span className="font-medium">rebind</span> it to a stronger generated color (see{' '}
            <span className="font-medium">Role bindings vs overrides</span>).
          </li>
        </ul>
        <p>There's no auto-fix engine today — these levers are how you act on a fail.</p>
      </>
    ),
  },
  {
    id: 'brand-color-not-matching',
    question: "Why isn't the primary color the same as my source color?",
    answer: (
      <>
        <p>
          Your brand color sets the palette direction (hue, warmth). The exact shade on buttons is
          optimized for readability across light/dark modes.
        </p>
        <p>
          <span className="font-medium">Need an exact match?</span> Override the primary token
          directly, or try the <span className="font-medium">Fidelity</span> scheme variant, which
          keeps the primary close to your source. (The{' '}
          <span className="font-medium">Lock color</span> button — <span>⌘L</span> — freezes your
          seed so tweaks don't drift it; it doesn't change how the primary is derived.)
        </p>
      </>
    ),
  },
  {
    id: 'hct-sliders',
    question: 'What do the Hue, Chroma, and Tone sliders do?',
    answer: (
      <>
        <p>
          The hex field and the three sliders are <span className="font-medium">one color</span> —
          edit either and the other follows. <span className="font-medium">Hue</span> is which
          color, <span className="font-medium">Chroma</span> is how vivid (its maximum moves with
          hue and tone, so it can stop short of the end), and{' '}
          <span className="font-medium">Tone</span> is how light or dark.
        </p>
        <p>
          On a near-grey the Hue slider greys out — there's no visible hue to adjust, so add a
          little chroma to bring it back. Your pasted hex is preserved exactly until you move a
          slider. See <span className="font-medium">What is HCT?</span> for the full model.
        </p>
      </>
    ),
  },
  {
    id: 'md3-vs-shadcn-borders',
    question: 'Why do borders look different between presets?',
    answer: (
      <>
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
          <code className="font-mono text-xs">outline-variant</code> — a near-decorative divider.
        </p>
        <p>
          That pair sits below 3:1, so on the shadcn layer the audit flags it as an{' '}
          <span className="font-medium">amber UI fail</span> (the same pair is marked Exempt on the
          md layer). It's an aesthetic tradeoff, not a bug: keep soft borders for the quieter look,
          or turn them off for higher-contrast edges.
        </p>
      </>
    ),
  },
  {
    id: 'dialog-colors-mismatch',
    question: 'Why do dialogs show different colors in preview?',
    answer: (
      <>
        <p>
          Dialogs render outside the themed preview container (browser limitation). The colors you
          export are correct — they'll look right in your actual project.
        </p>
        <p>This is a preview limitation, not a theme bug.</p>
      </>
    ),
  },
  {
    id: 'cmf-safety',
    question: 'What is CMF and is it safe for production?',
    answer: (
      <>
        <p>CMF takes two brand colors instead of one, building a coordinated palette from both.</p>
        <p>
          <span className="font-medium">Production ready?</span> Yes — it's based on Google's 2026
          Material spec. Less battle-tested than Tonal Spot, but uses Google's official color math.
        </p>
        <p>
          Use CMF if you have two distinct brand colors. Stick to Tonal Spot or Fidelity for a
          single-color theme.
        </p>
      </>
    ),
  },
  {
    id: 'cmf-colors-different',
    question: 'Why do CMF colors look so different?',
    answer: (
      <>
        <p>
          CMF derives neutrals directly from your primary color at 20% vividness. This creates
          noticeably tinted surfaces — your brand color shows up everywhere.
        </p>
        <p>
          Other variants keep neutrals nearly gray. CMF tints the entire canvas, not just accents.
        </p>
      </>
    ),
  },
  {
    id: 'cmf-no-effect-shadcn',
    question: 'I set a CMF second color but nothing changed — why?',
    answer: (
      <>
        <p>
          The second source drives the <span className="font-medium">tertiary</span> palette. On the{' '}
          <span className="font-medium">md</span> layer that's always a visible role, so the change
          shows up immediately.
        </p>
        <p>
          On the <span className="font-medium">shadcn</span> layer, tertiary only reaches your
          export if the active preset maps a role to it. Most presets —{' '}
          <span className="font-medium">Default, Stark, Soft, Warm, Monotone</span> — don't, so the
          second source has no visible effect there. <span className="font-medium">Playful</span>{' '}
          and <span className="font-medium">Tech</span> do.
        </p>
        <p>
          To see it on shadcn: switch to a tertiary-driven preset, override a role to a tertiary
          token yourself (see <span className="font-medium">Role bindings vs overrides</span>), or
          view the md layer.
        </p>
      </>
    ),
  },
  {
    id: 'preserve-brand-color',
    question: 'Can I preserve my brand color while tweaking?',
    answer: (
      <>
        <p>
          <span className="font-medium">Available now:</span>
        </p>
        <ul className="space-y-2 list-inside list-disc">
          <li>
            The <span className="font-medium">Lock color</span> button (⌘L) freezes your seed so
            tweaks elsewhere don't drift it
          </li>
          <li>Override individual palettes (secondary, tertiary, neutral) independently</li>
          <li>
            The <span className="font-medium">Fidelity</span> scheme variant keeps the primary close
            to your source
          </li>
        </ul>
        <p>
          <span className="font-medium">Coming:</span> Fine-tuning individual hues without full
          palette replacement.
        </p>
      </>
    ),
  },
  {
    id: 'custom-color-tokens',
    question: 'What does a custom color add to my export?',
    answer: (
      <>
        <p>
          It depends on your layer. On <span className="font-medium">md</span> you get the full
          Material set — <code className="font-mono text-xs">--{'{name}'}</code>,{' '}
          <code className="font-mono text-xs">--on-{'{name}'}</code>,{' '}
          <code className="font-mono text-xs">--{'{name}'}-container</code>, and{' '}
          <code className="font-mono text-xs">--on-{'{name}'}-container</code>.
        </p>
        <p>
          On <span className="font-medium">shadcn</span> you get one pair —{' '}
          <code className="font-mono text-xs">--{'{name}'}</code> +{' '}
          <code className="font-mono text-xs">--{'{name}'}-foreground</code> — and the source pair
          you pick (the vivid color or the soft container) chooses which generated md pair feeds it.
          Harmonize keeps it coherent with your palette. See{' '}
          <span className="font-medium">Custom Colors</span> for the full breakdown.
        </p>
      </>
    ),
  },
  {
    id: 'vs-others',
    question: 'Why choose tonex instead of other theme generators?',
    answer: (
      <>
        <p>
          <span className="font-medium">tonex Color:</span> Algorithmic themes from your brand
          color. Unique to you, scales with rebrands, built-in accessibility, first-class dark mode.
        </p>
        <p>
          <span className="font-medium">Other color tools:</span> Hand-crafted presets. Faster if
          you just need something that looks good.
        </p>
        <p>
          Use this app if you have a brand color and want a principled system. Use other color tools
          if you need a quick preset.
        </p>
      </>
    ),
  },
]

export const QAItem = ({ id, question, answer }: QAItemData) => {
  return (
    <AccordionItem id={id} value={id} className="border-0 py-1">
      <AccordionSummary className="text-[1.2rem] bg-surface-container p-4 rounded-md">
        {question}
      </AccordionSummary>
      <AccordionPanel className="space-y-2 text-on-surface-variant px-4 pt-4 pb-2">
        {answer}
      </AccordionPanel>
    </AccordionItem>
  )
}

export const QA = () => {
  return (
    <div className="w-full mx-auto max-w-3xl">
      <Accordion className="w-full" multiple>
        {QA_ITEMS.map((item) => (
          <QAItem key={item.id} {...item} />
        ))}
      </Accordion>
    </div>
  )
}
