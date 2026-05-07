'use client'

import type { CSSProperties } from 'react'
import { cn } from 'tailwind-variants'

interface Props {
  className?: string
  top?: number
  left: number
  color: string
}

export function Pointer({ className, color, left, top = 0.5 }: Props) {
  const style: CSSProperties = {
    top: `${top * 100}%`,
    left: `${left * 100}%`,
    backgroundColor: color,
  }
  return (
    <div
      className={cn(
        'absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md cursor-pointer',
        className,
      )}
      style={style}
    />
  )
}
