'use client'

import { XIcon } from 'lucide-react'
import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
import { buttonStyles } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogElementOutsideContent,
  DialogTrigger,
} from '@/components/ui/dialog'

export function MDXImage({ src, alt, ...props }: ImageProps) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        nativeButton={false}
        render={
          <Image
            {...props}
            src={src ?? '/placeholder.svg'}
            alt={alt ?? 'Tonex image'}
            width={800}
            height={600}
            className="cursor-zoom-in mx-auto aspect-video rounded-xl object-cover"
          />
        }
      />
      <DialogElementOutsideContent className="max-w-6xl items-center justify-center bg-transparent">
        <DialogClose
          className={buttonStyles({
            variant: 'outline',
            className:
              'h-12 absolute right-2 top-2 xl:right-4 xl:top-4 pointer-events-auto cursor-pointer flex justify-center items-center',
          })}
        >
          <XIcon className="size-6 sm:size-8" />
        </DialogClose>
        <Image
          onClick={() => setOpen(false)}
          {...props}
          src={src ?? '/placeholder.svg'}
          alt={alt ?? 'Tonex image'}
          className="cursor-zoom-out mx-auto aspect-video rounded-xl object-cover"
          width={1200}
          height={800}
        />
      </DialogElementOutsideContent>
    </Dialog>
  )
}
