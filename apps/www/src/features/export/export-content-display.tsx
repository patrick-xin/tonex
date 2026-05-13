'use client'

import { CheckIcon, CopyIcon } from '@phosphor-icons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from '@/components/ui/toast'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'

interface ExportContentDisplayProps {
  content: string
}

export function ExportContentDisplay({ content }: ExportContentDisplayProps) {
  const copyButtonRef = useRef<HTMLButtonElement | null>(null)
  const { copyToClipboard, isCopied } = useCopyToClipboard({ timeout: 1500 })

  const handleCopy = () => {
    copyToClipboard(content)
    toast.anchor(copyButtonRef.current, {
      title: 'Copied to clipboard',
      timeout: 1500,
      side: 'left',
    })
  }

  // why: scoped to dialog-open since this component only mounts inside the
  // export dialog portal. Plain `C` mirrors the legacy shortcut — Mod+C
  // remains the system clipboard.
  useHotkey('C', handleCopy, { ignoreInputs: true, requireReset: true })

  return (
    <ScrollArea gradientScrollFade noScrollBar className="flex-1 min-h-0 h-full relative">
      <pre className="font-mono m-2 p-4 text-[11px] text-on-surface-variant bg-surface-container-low whitespace-pre">
        {content}
      </pre>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              ref={copyButtonRef}
              size="icon-sm"
              onClick={handleCopy}
              variant={isCopied ? 'primary' : 'outline'}
              className="absolute top-4 right-4"
              aria-label="Copy"
            >
              {isCopied ? <CheckIcon weight="bold" /> : <CopyIcon weight="bold" />}
            </Button>
          }
        />
        <TooltipContent side="left">
          Copy <Kbd>C</Kbd>
        </TooltipContent>
      </Tooltip>
    </ScrollArea>
  )
}
