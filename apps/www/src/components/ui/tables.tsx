'use client'

import type * as React from 'react'
import { cn } from 'tailwind-variants'

function Table({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<'table'> & { containerClassName?: string }) {
  return (
    <div
      className={cn('relative w-full overflow-x-auto', containerClassName)}
      data-slot="table-container"
    >
      <table
        className={cn('w-full caption-bottom text-sm', className)}
        data-slot="table"
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      className={cn('[&_tr]:border-b border-outline-variant', className)}
      data-slot="table-header"
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      className={cn('[&_tr:last-child]:border-0 border-outline-variant', className)}
      data-slot="table-body"
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      className={cn(
        'border-t border-outline-variant bg-surface-container-low font-medium [&>tr]:last:border-b-0',
        className,
      )}
      data-slot="table-footer"
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      className={cn(
        'border-b border-outline-variant transition-colors hover:bg-surface-container-low/50 data-[state=selected]:bg-surface-container-low',
        className,
      )}
      data-slot="table-row"
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      className={cn(
        'h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-on-surface [&:has([role=checkbox])]:pr-0',
        className,
      )}
      data-slot="table-head"
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      className={cn('p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0', className)}
      data-slot="table-cell"
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      className={cn('mt-4 text-sm text-on-surface-variant', className)}
      data-slot="table-caption"
      {...props}
    />
  )
}

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow }
