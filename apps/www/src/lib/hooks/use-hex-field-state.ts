'use client'

import { hexFromColorInput, isValidHex } from '@tonex/color-utils'
import { type FocusEvent, useRef, useState } from 'react'

// why: every hex-typing site in the rail wants the same buffered shape: a
// local string state so the user can type partial values ("#ff" → "#ff00")
// without each invalid intermediate firing onChange, and external writes
// (variant change, palette swap, native picker drag from elsewhere) sync into
// the buffer when the field is unfocused so seed updates don't blow away
// mid-typing. One copy, one focus-buffering policy — five sites used to spell
// this out themselves. Validity is core's `isValidHex` — the same trust-boundary
// check the source store uses before MCU's argbFromHex — not a private regex, so
// what this field accepts can never drift from what the engine accepts. Focus
// also selects the whole value so the field is type-to-replace. Spread the
// returned `inputProps` onto the <Input> to wire focus/blur.
// `acceptOklch` opts a field into pasting a canonical `oklch(L C H)`, it's converted to its sRGB hex on commit.
// the seed is a lossy derivation input, not a WYSIWYG-pinned token, so the
// gamut projection is safe there. The token-pinning pickers (override/custom/
// role) leave it off, so oklch can never leak into a value that must equal the
// export. Default false keeps the path byte-identical to the hex-only contract.
export function useHexFieldState(
  value: string,
  onChange: (hex: string) => void,
  options?: { acceptOklch?: boolean },
) {
  const [hexInput, setHexInput] = useState(value)
  const [lastSynced, setLastSynced] = useState(value)
  const isFocused = useRef(false)

  // why: mirror external writes into the buffer *during render* — React's
  // sanctioned "adjust state when a prop changes" pattern — rather than a
  // post-paint useEffect. The effect form left the field one painted frame
  // behind the store on every external write (preset swap, picker drag,
  // hydration), which read as the value flickering out of sync. Comparing
  // against the last value we synced makes this fire once per external change.
  // Guarded on focus so an external write never clobbers a mid-typing buffer;
  // onBlur is the reconcile point once focus leaves (it also reverts an invalid
  // partial — which leaves `value` unchanged, so this branch can't catch it).
  if (value !== lastSynced && !isFocused.current) {
    setLastSynced(value)
    setHexInput(value)
  }

  const handleChange = (next: string) => {
    // why: opt-in oklch (seed only) — hexFromColorInput passes a valid hex
    // through and converts a canonical oklch(L C H) to its sRGB hex, else null.
    // The default path is the bare isValidHex gate, so oklch never reaches a
    // token-pinning picker (the WYSIWYG line).
    let resolved: string | null
    if (options?.acceptOklch) resolved = hexFromColorInput(next)
    else resolved = isValidHex(next) ? next : null

    // why: an oklch paste resolves to a different string than what was typed —
    // flip the buffer to the sRGB hex so the field shows the gamut-mapped result
    // (honest about the projection). A plain hex resolves to itself: a no-op.
    setHexInput(resolved && resolved !== next ? resolved : next)
    if (resolved) onChange(resolved)
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
