'use client'

import { useEffect, useRef, useState } from 'react'

// why: every hex-typing site in the rail wants the same buffered shape: a
// local string state so the user can type partial values ("#ff" → "#ff00")
// without each invalid intermediate firing onChange, and external writes
// (variant change, palette swap, native picker drag from elsewhere) sync
// into the buffer when the field is unfocused so seed updates don't blow
// away mid-typing. One copy, one regex (`/^#[0-9a-fA-F]{6}$/`), one
// focus-buffering policy — five sites used to spell this out themselves.
// Spread the returned `inputProps` onto the <Input> to wire focus/blur.
export function useHexFieldState(value: string, onChange: (hex: string) => void) {
  const [hexInput, setHexInput] = useState(value)
  const isFocused = useRef(false)

  useEffect(() => {
    if (!isFocused.current) setHexInput(value)
  }, [value])

  const handleChange = (next: string) => {
    setHexInput(next)
    if (/^#[0-9a-fA-F]{6}$/.test(next)) onChange(next)
  }

  const inputProps = {
    onFocus: () => {
      isFocused.current = true
    },
    onBlur: () => {
      isFocused.current = false
      setHexInput(value)
    },
  }

  return { hexInput, handleChange, inputProps }
}
