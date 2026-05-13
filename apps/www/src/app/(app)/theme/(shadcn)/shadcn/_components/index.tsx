'use client'

import { Bold, Italic, Underline } from 'lucide-react'
import React, { Suspense } from 'react'
import { Button } from '@/components/shadcn/button'
import { Card } from '@/components/shadcn/card'
import { Kbd, KbdGroup } from '@/components/shadcn/kbd'
import { Progress } from '@/components/shadcn/progress'
import { ToggleGroup, ToggleGroupItem } from '@/components/shadcn/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/shadcn/tooltip'
import { useShadcn } from '../_provider'
import { ButtonGroupDemo } from './button-group'
import { BreadcrumbDemo, CalendarDemo } from './calendar'
import { ContextMenuDemo } from './context-menu'
import { ShadcnDialogDemo } from './dialog'
import { HoverCardDemo } from './hover-card'
import { InputsDemo } from './inputs'
import { ItemDemo } from './item'
import { LoadingCard } from './loading-card'
import { MenubarDemo } from './menubar'
import { PaginationDemo } from './pagination'
import { PopoverDemo } from './popover'
import { SheetDemo } from './sheet'
import { SonnerDemo } from './sonner'
import { TableDemo } from './tables'

export function ShadcnComponentsDemo() {
  const ref = useShadcn()
  const [progress, setProgress] = React.useState(13)
  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="max-w-7xl columns-1 gap-6 md:columns-2 lg:columns-3 m-px">
      {/* Buttons */}
      <Card className="mb-6 break-inside-avoid rounded-xl flex flex-col p-6 gap-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          Buttons <div className="h-px flex-1 bg-border" />
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button type="button">Primary</Button>
          <Button disabled type="button">
            Disabled
          </Button>
          <Button type="button" variant="secondary">
            Secondary
          </Button>
          <Button type="button" variant="outline">
            Outline
          </Button>
          <Button type="button" variant="ghost">
            Ghost
          </Button>
          <Button type="button" variant="link">
            Link
          </Button>
          <Button type="button" variant="destructive">
            Destruct
          </Button>
        </div>
        <ButtonGroupDemo ref={ref} />
      </Card>

      {/* Forms & Inputs */}
      <Card className="mb-6 break-inside-avoid rounded-xl flex flex-col p-6 gap-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          Forms & Inputs <div className="h-px flex-1 bg-border" />
        </h2>
        <InputsDemo ref={ref} />
      </Card>

      {/* Lists & Items */}
      <Card className="mb-6 break-inside-avoid rounded-xl flex flex-col p-6 gap-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          Lists & Items <div className="h-px flex-1 bg-border" />
        </h2>
        <ItemDemo />
      </Card>

      {/* Popovers & Floating */}
      <Card className="mb-6 break-inside-avoid rounded-xl flex flex-col p-6 gap-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          Popovers & Floating <div className="h-px flex-1 bg-border" />
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <PopoverDemo ref={ref} />
          <ContextMenuDemo ref={ref} />
          <HoverCardDemo ref={ref} />
        </div>
        <MenubarDemo ref={ref} />
      </Card>

      {/* Modals & Overlays */}
      <Card className="mb-6 break-inside-avoid rounded-xl flex flex-col p-6 gap-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          Modals & Overlays <div className="h-px flex-1 bg-border" />
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <ShadcnDialogDemo ref={ref} />
          <SheetDemo ref={ref} />
          <SonnerDemo />
        </div>
      </Card>

      {/* Calendar */}
      <Card className="mb-6 break-inside-avoid rounded-xl flex flex-col p-6 gap-5 items-center">
        <h2 className="w-full text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          Calendar <div className="h-px flex-1 bg-border" />
        </h2>
        <Suspense>
          <CalendarDemo />
        </Suspense>
      </Card>

      {/* Navigation */}
      <Card className="mb-6 break-inside-avoid rounded-xl flex flex-col p-6 gap-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          Navigation <div className="h-px flex-1 bg-border" />
        </h2>
        <PaginationDemo />
        <BreadcrumbDemo />
      </Card>

      {/* Misc */}
      <Card className="mb-6 break-inside-avoid rounded-xl flex flex-col p-6 gap-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          Misc <div className="h-px flex-1 bg-border" />
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
          <Tooltip>
            <TooltipTrigger render={<Button variant="outline">Tooltip</Button>} />
            <TooltipContent ref={ref}>
              <p>Add to library</p>
            </TooltipContent>
          </Tooltip>
          <Progress value={progress} className="w-[60%]" />
          <ToggleGroup variant="outline" multiple>
            <ToggleGroupItem value="bold" aria-label="Toggle bold">
              <Bold />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Toggle italic">
              <Italic />
            </ToggleGroupItem>
            <ToggleGroupItem disabled value="strikethrough" aria-label="Toggle strikethrough">
              <Underline />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </Card>
      <div className="space-y-6">
        <TableDemo />
        <LoadingCard />
      </div>
    </div>
  )
}
