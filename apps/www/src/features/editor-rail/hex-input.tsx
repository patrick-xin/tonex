'use client'

import { useSource } from '@tonex/core'
import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function HexInput({ hideLabel = false }: { hideLabel?: boolean }) {
  const seedHex = useSource((s) => s.seedHex)
  const setSeedHex = useSource((s) => s.setSeedHex)
  const seedHexLock = useSource((s) => s.seedHexLock)

  const [hexInput, setHexInput] = useState(seedHex)
  const isHexFocused = useRef(false)

  useEffect(() => {
    if (!isHexFocused.current) {
      setHexInput(seedHex)
    }
  }, [seedHex])

  const handleHexChange = (value: string) => {
    setHexInput(value)
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      setSeedHex(value)
    }
  }

  return (
    <div className="flex items-center gap-2 justify-between w-full">
      <div className="flex items-center gap-2 text-sm flex-1">
        {!hideLabel && <Label htmlFor="hex-input">Hex</Label>}
        <Input
          disabled={seedHexLock}
          id="hex-input"
          className="font-mono w-full"
          inputSize="sm"
          type="text"
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          onFocus={() => {
            isHexFocused.current = true
          }}
          onBlur={() => {
            isHexFocused.current = false
            setHexInput(seedHex)
          }}
          maxLength={7}
          spellCheck={false}
          placeholder="#00021d"
        />
      </div>
    </div>
  )
}
