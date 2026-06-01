'use client'

import { isValidHex } from '@tonex/color-utils'
import { type FocusEvent, useEffect, useRef, useState } from 'react'

// why: every hex-typing site in the rail wants the same buffered shape: a
// local string state so the user can type partial values ("#ff" → "#ff00")
// without each invalid intermediate firing onChange, and external writes
// (variant change, palette swap, native picker drag from elsewhere) sync
// into the buffer when the field is unfocused so seed updates don't blow
// away mid-typing. One copy, one focus-buffering policy — five sites used to
// spell this out themselves. Validity is core's `isValidHex` — the same
// trust-boundary check the source store uses before MCU's argbFromHex — not a
// private regex, so what this field accepts can never drift from what the
// engine accepts. Focus also selects the whole value so the field is
// type-to-replace. Spread the returned `inputProps` onto the <Input> to wire
// focus/blur.
export function useHexFieldState(value: string, onChange: (hex: string) => void) {
  const [hexInput, setHexInput] = useState(value)
  const isFocused = useRef(false)

  useEffect(() => {
    if (!isFocused.current) setHexInput(value)
  }, [value])

  const handleChange = (next: string) => {
    setHexInput(next)
    if (isValidHex(next)) onChange(next)
  }

  const inputProps = {
    onFocus: (e: FocusEvent<HTMLInputElement>) => {
      isFocused.current = true
      // why: select-all so a focus lands type-to-replace (no manual clear).
      // Deferred via rAF (as the HCT sliders do) because a mouse click positions
      // the caret in mousedown's default action *after* focus fires — a sync
      // select() would be collapsed; rAF runs after it, so the selection sticks
      // for click and tab alike. Capture the element first: React nulls the
      // event's currentTarget once the handler returns.
      const el = e.currentTarget
      requestAnimationFrame(() => el.select())
    },
    onBlur: () => {
      isFocused.current = false
      setHexInput(value)
    },
  }

  return { hexInput, handleChange, inputProps }
}
