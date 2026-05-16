'use client'

import { useEffect, useRef, useState } from 'react'
import { useEventCallback } from '@/lib/hooks/use-event-callback'
import { equalHex, equalHsva, type HsvaColor, hexToHsva, hsvaToHex } from './color-utils'

// why: hex → HSVA → hex is non-bijective at low saturation (greys lose hue),
// and parent re-renders mid-drag would otherwise yank the thumb back to a
// snapped position. The cache ref records the last hex/hsva pair we synced
// in either direction so we can short-circuit echoes — same pattern as
// react-colorful's useColorManipulation, specialized to hex strings.
export function useColorManipulation(
  value: string,
  onChange?: (next: string) => void,
): readonly [HsvaColor, (params: Partial<HsvaColor>) => void] {
  const onChangeCallback = useEventCallback<string>(onChange)
  const [hsva, updateHsva] = useState<HsvaColor>(() => hexToHsva(value))
  const cache = useRef({ value, hsva })

  useEffect(() => {
    if (!equalHex(value, cache.current.value)) {
      const next = hexToHsva(value)
      cache.current = { hsva: next, value }
      updateHsva(next)
    }
  }, [value])

  useEffect(() => {
    if (equalHsva(hsva, cache.current.hsva)) return
    const next = hsvaToHex(hsva)
    if (equalHex(next, cache.current.value)) return
    cache.current = { hsva, value: next }
    onChangeCallback(next)
  }, [hsva, onChangeCallback])

  const handleChange = (params: Partial<HsvaColor>) => {
    updateHsva((current) => ({ ...current, ...params }))
  }

  return [hsva, handleChange] as const
}
