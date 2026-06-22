'use client'

import { Button as ShadcnButton } from '@/components/shadcn/button'
import {
  Card as ShadcnCard,
  CardContent as ShadcnCardContent,
  CardDescription as ShadcnCardDescription,
  CardFooter as ShadcnCardFooter,
  CardHeader as ShadcnCardHeader,
  CardTitle as ShadcnCardTitle,
} from '@/components/shadcn/card'
import { Button as McButton } from '@/components/ui/button'
import {
  Card as McCard,
  CardContent as McCardContent,
  CardDescription as McCardDescription,
  CardFooter as McCardFooter,
  CardHeader as McCardHeader,
  CardTitle as McCardTitle,
} from '@/components/ui/card'

// why: side-by-side canaries for both token layers. Same JSX shape, different
// className wiring — md primitives consume `--color-*` (default scope), shadcn
// primitives consume `--primary` / `--card` etc. and MUST render inside a
// `.shadcn` element so the alias bridge in globals.css remaps the names.

export function PrimitivesDemo() {
  return (
    <section className="grid gap-6">
      <header>
        <h2 className="text-lg font-semibold">primitives — md vs shadcn</h2>
        <p className="opacity-70 text-sm">
          two layers, same shape. md (default scope) on the left, shadcn (sub-scope) on the right.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-6">
        <McCard>
          <McCardHeader>
            <McCardTitle>md card</McCardTitle>
            <McCardDescription>--color-* tokens, base-ui Button</McCardDescription>
          </McCardHeader>
          <McCardContent className="flex flex-wrap gap-2">
            <McButton variant="brand">brand</McButton>
            <McButton variant="primary">primary</McButton>
            <McButton variant="secondary">secondary</McButton>
            <McButton variant="tertiary">tertiary</McButton>
            <McButton variant="danger">danger</McButton>
            <McButton variant="outline">outline</McButton>
            <McButton variant="ghost">ghost</McButton>
            <McButton variant="link">link</McButton>
          </McCardContent>
          <McCardFooter>md surface family</McCardFooter>
        </McCard>

        <div className="shadcn">
          <ShadcnCard>
            <ShadcnCardHeader>
              <ShadcnCardTitle>shadcn card</ShadcnCardTitle>
              <ShadcnCardDescription>--primary / --card tokens, alias bridge</ShadcnCardDescription>
            </ShadcnCardHeader>
            <ShadcnCardContent className="flex flex-wrap gap-2">
              <ShadcnButton variant="default">default</ShadcnButton>
              <ShadcnButton variant="secondary">secondary</ShadcnButton>
              <ShadcnButton variant="destructive">destructive</ShadcnButton>
              <ShadcnButton variant="outline">outline</ShadcnButton>
              <ShadcnButton variant="ghost">ghost</ShadcnButton>
              <ShadcnButton variant="link">link</ShadcnButton>
            </ShadcnCardContent>
            <ShadcnCardFooter>shadcn role bindings</ShadcnCardFooter>
          </ShadcnCard>
        </div>
      </div>
    </section>
  )
}
