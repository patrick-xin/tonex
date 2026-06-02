'use client'

import { SpinnerIcon } from '@phosphor-icons/react'
import { sourceColorHexFromImage } from '@tonex/core'
import { useSource } from '@tonex/core-react'
import { useRef, useState } from 'react'
import { cn } from 'tailwind-variants'
import { focusWithinRing } from '@/components/ui/styles'

export function ImagePicker({ className }: { className?: string }) {
  const setSeedHex = useSource((s) => s.actions.setSeedHex)
  const seedHexLock = useSource((s) => s.seedHexLock)
  const imgRef = useRef<HTMLImageElement>(null)
  const prevUrlRef = useRef<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFile = (file: File) => {
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current)

    const url = URL.createObjectURL(file)
    prevUrlRef.current = url
    setPreview(url)
    setLoading(true)

    const img = imgRef.current
    if (!img) return

    img.onload = async () => {
      setSeedHex(await sourceColorHexFromImage(img))
      setLoading(false)
    }
    img.src = url
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        className={cn(
          'group relative flex h-26 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low text-on-surface-variant text-sm transition-colors hover:border-primary hover:text-primary overflow-hidden select-none',
          seedHexLock && 'opacity-38 cursor-default hover:border-outline-variant',
          focusWithinRing,
          className,
        )}
      >
        <input
          disabled={seedHexLock}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
        {preview ? (
          // biome-ignore lint/performance/noImgElement: object-URL preview, lifetime tied to component; next/image not applicable
          <img
            src={preview}
            alt="Uploaded preview"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span className="text-on-surface-variant text-center px-2 max-w-5/6 mx-auto text-xs">
            {seedHexLock
              ? 'Current color is locked. Unlock to pick an image.'
              : "Pick an image. Prefer a transparent background if you're using a logo."}
          </span>
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-scrim/32">
            <SpinnerIcon className="animate-spin" />
          </div>
        )}
      </label>

      {/* biome-ignore lint/performance/noImgElement: needs HTMLImageElement ref for sourceColorHexFromImage; next/image opaque DOM */}
      <img ref={imgRef} alt="" className="hidden" />
    </div>
  )
}
