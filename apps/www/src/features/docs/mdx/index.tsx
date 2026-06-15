import Link from 'next/link'
import type * as React from 'react'
import { cn } from 'tailwind-variants'
import { Button } from '@/components/ui/button'
import { focusVisibleRing } from '@/components/ui/styles'
import { Tabs, TabsListContent, TabsPanel, TabsTab } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Callout } from './call-out'
import { CodeFigure } from './code-figure'
import { CodeBlockTab, CodeBlockTabs, CodeBlockTabsList, CodeBlockTabsTrigger } from './code-tabs'
import { MDXImage } from './mdx-image'

export const mdxComponents = {
  pre: ({ className, children, ...props }: React.ComponentProps<'pre'>) => {
    return (
      <pre
        className={cn(
          'not-prose no-scrollbar min-w-0 overflow-x-auto overflow-y-auto overscroll-x-contain overscroll-y-auto py-2 outline-none has-data-highlighted-line:px-0 has-data-line-numbers:px-0',
          className,
        )}
        {...props}
      >
        {children}
      </pre>
    )
  },
  code: ({ className, children, ...props }: React.ComponentProps<'code'>) => {
    if (typeof children === 'string') {
      return (
        <code
          className={cn(
            'not-prose bg-secondary-container text-on-secondary-container rounded-sm text-sm px-1',
            className,
          )}
          {...props}
        >
          {children}
        </code>
      )
    }
    return <code {...props}>{children}</code>
  },
  figure: CodeFigure,
  figcaption: ({ className, children, ...props }: React.ComponentProps<'figcaption'>) => {
    return (
      <figcaption
        className={cn(
          'flex items-center gap-2 text-on-surface [&_svg]:size-4 [&_svg]:text-on-surface-variant [&_svg]:opacity-70',
          className,
        )}
        {...props}
      >
        {children}
      </figcaption>
    )
  },
  Image: MDXImage,
  a: ({ ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (props.href?.startsWith('https')) {
      return (
        <a
          className={cn(
            'relative inline-block font-medium text-primary underline underline-offset-4 transition-colors ease-linear',
            focusVisibleRing,
          )}
          rel="noopener noreferrer"
          target="_blank"
          {...props}
        />
      )
    }

    return (
      <Link
        className={cn(
          'inline-flex items-center justify-center text-primary underline-offset-4 underline transition-colors ease-linear',
          focusVisibleRing,
        )}
        href={props.href ?? '#'}
      >
        {props.children}
      </Link>
    )
  },
  Button,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Tabs,
  TabsListContent,
  TabsPanel,
  TabsTab,
  CodeBlockTabs,
  CodeBlockTabsList,
  CodeBlockTabsTrigger,
  CodeBlockTab,
  Callout,
}
