'use client'

import { useHotkey } from '@tanstack/react-hotkeys'
import { XIcon } from 'lucide-react'
import React from 'react'
import { cn } from 'tailwind-variants'
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
} from '@/components/ui/dialog'
import {
  ScrollAreaContent,
  ScrollAreaRoot,
  ScrollAreaScrollBar,
  ScrollAreaViewport,
} from '@/components/ui/scroll-area'
import { helpDialogHandle } from '@/lib/handles'
import { KeyConcepts } from './key-concepts'
import { QA } from './qa'

export function HelpDialog() {
  useHotkey('H', () => helpDialogHandle.open(null), {
    ignoreInputs: true,
    requireReset: true,
    meta: { name: 'Help', description: 'Press H to open help' },
  })
  return (
    <Dialog handle={helpDialogHandle}>
      <DialogOutsideScrollContent>
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-semibold">Help</DialogTitle>
          <DialogDescription>Key concepts and usage guide about Tonex</DialogDescription>
        </DialogHeader>
        <div className="h-full min-h-screen space-y-6">
          <KeyConcepts />
          <QA />
        </div>
        <DialogClose
          className="absolute right-2 top-2"
          render={
            <Button size="icon-sm" variant="outline">
              <XIcon className="size-4" />
            </Button>
          }
        />
      </DialogOutsideScrollContent>
    </Dialog>
  )
}

const DialogOutsideScrollContent = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPopup>) => {
  const popupRef = React.useRef<HTMLDivElement>(null)
  return (
    <DialogPortal>
      <DialogBackdrop />
      <DialogViewport className="group/dialog">
        <ScrollAreaRoot
          className="h-full overscroll-contain group-data-ending-style/dialog:pointer-events-none"
          style={{ position: undefined }}
        >
          <ScrollAreaViewport className="h-full overscroll-contain group-data-ending-style/dialog:pointer-events-none">
            <ScrollAreaContent className="flex min-h-full items-center justify-center">
              <DialogPopup
                className={cn(
                  'relative mx-auto overlay-outline my-18 p-4 sm:p-6 w-[min(40rem,calc(100vw-2rem))] rounded-lg animate-fade',
                  className,
                )}
                initialFocus={popupRef}
                ref={popupRef}
                {...props}
              >
                {children}
              </DialogPopup>
            </ScrollAreaContent>
          </ScrollAreaViewport>
          <ScrollAreaScrollBar />
        </ScrollAreaRoot>
      </DialogViewport>
    </DialogPortal>
  )
}
