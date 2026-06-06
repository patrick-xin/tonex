'use client'

import { CheckIcon, CopyIcon } from '@phosphor-icons/react'
import { useHotkey } from '@tanstack/react-hotkeys'
import { useDeferredValue, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from '@/components/ui/toast'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { type HighlightLang, highlightCode } from '@/lib/highlight'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'

interface ExportContentDisplayProps {
  content: string
  lang: HighlightLang
}

export function ExportContentDisplay({ content, lang }: ExportContentDisplayProps) {
  const copyButtonRef = useRef<HTMLButtonElement | null>(null)
  const { copyToClipboard, isCopied } = useCopyToClipboard({ timeout: 1500 })

  // why: re-highlight on seed change, but off the critical path —
  // useDeferredValue lets the new content paint (unstyled pre fallback) before
  // the async highlight resolves, so typing a seed never janks. The `active`
  // guard drops a stale highlight if content changes mid-flight.
  const deferredContent = useDeferredValue(content)
  const [highlighted, setHighlighted] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    highlightCode(deferredContent, lang).then((html) => {
      if (active) setHighlighted(html)
    })
    return () => {
      active = false
    }
  }, [deferredContent, lang])

  const handleCopy = () => {
    copyToClipboard(content)
    toast.anchor(copyButtonRef.current, {
      title: 'Copied to clipboard',
      timeout: 1500,
      side: 'left',
    })
  }

  useHotkey('C', handleCopy, {
    ignoreInputs: true,
    requireReset: true,
    conflictBehavior: 'replace',
  })

  return (
    <ScrollArea gradientScrollFade noScrollBar className="flex-1 min-h-0 h-full relative p-1">
      {highlighted ? (
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki markup of export content the app itself generated from the user's seed
        <div className="text-xs" dangerouslySetInnerHTML={{ __html: highlighted }} />
      ) : (
        <pre className="font-mono p-4 text-xs text-on-surface-variant whitespace-pre">
          {content}
        </pre>
      )}
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
        <TooltipContent side="bottom">
          Copy <Kbd>C</Kbd>
        </TooltipContent>
      </Tooltip>
    </ScrollArea>
  )
}
