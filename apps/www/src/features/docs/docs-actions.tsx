import { ChevronDownIcon, ExternalLink } from 'lucide-react'
import { cn } from 'tailwind-variants'
import { Icons } from '@/components/icons'
import { buttonStyles } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CopyPageButton } from './copy-page-button'

export function DocsActions({ slug, url }: { slug: string[]; url: string }) {
  return (
    <div className="flex items-center">
      <CopyPageButton className="rounded-r-none border-r-0 text-xs" slug={slug} />
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Open links panel"
          className={buttonStyles({
            size: 'sm',
            variant: 'glow',
            className:
              'h-8 rounded-l-none border-l data-popup-open:bg-primary/12 data-popup-open:hover:bg-primary/12 data-popup-open:[&_svg]:rotate-180 group',
          })}
        >
          <ChevronDownIcon className="size-3.5 transition-[transform,colors] text-on-surface-variant group-hover:text-on-surface" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className={cn('w-42 sm:-translate-x-28 surface-popup-blur!')}>
          {Object.entries(menuItems).map(([key, value]) => (
            <DropdownMenuItem
              className="text-sm capitalize text-on-surface-variant group"
              key={key}
              render={value(url, key)}
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function getPromptUrl(baseURL: string, url: string) {
  return `${baseURL}?q=${encodeURIComponent(
    `I’m looking at this Tonex documentation: ${url}.
Help me understand how to use it. Be ready to explain concepts, give examples, or help debug based on it.
  `,
  )}`
}

const menuItems = {
  markdown: (url: string, content: string) => (
    <a
      className="w-full inline-flex items-center justify-start gap-3"
      href={`${url}.md`}
      rel="noopener noreferrer"
      target="_blank"
    >
      <Icons.markdown className="size-4" />
      <span className="font-medium">{content}</span>
      <ExternalLink className="ml-auto text-on-surface-variant" />
    </a>
  ),
  chatgpt: (url: string, content: string) => (
    <a
      className="w-full inline-flex items-center justify-start gap-3"
      href={getPromptUrl('https://chatgpt.com', url)}
      rel="noopener noreferrer"
      target="_blank"
    >
      <Icons.openai className="size-4" />
      <span className="font-medium">{content}</span>
      <ExternalLink className="ml-auto text-on-surface-variant" />
    </a>
  ),
  claude: (url: string, content: string) => (
    <a
      className="w-full inline-flex items-center justify-start gap-3"
      href={getPromptUrl('https://claude.ai/new', url)}
      rel="noopener noreferrer"
      target="_blank"
    >
      <Icons.claude className="size-4" />
      <span className="font-medium">{content}</span>
      <ExternalLink className="ml-auto text-on-surface-variant" />
    </a>
  ),
  v0: (url: string, content: string) => (
    <a
      className="w-full inline-flex items-center justify-start gap-3"
      href={getPromptUrl('https://v0.dev', url)}
      rel="noopener noreferrer"
      target="_blank"
    >
      <Icons.v0 className="size-4" />
      <span className="font-medium">{content}</span>
      <ExternalLink className="ml-auto text-on-surface-variant" />
    </a>
  ),
}
