import { act, renderHook } from '@testing-library/react'
import { isValidHex } from '@tonex/color-utils'
import { describe, expect, it, vi } from 'vitest'
import { useHexFieldState } from './use-hex-field-state'

// why: this hook is the seed-hex trust boundary — what it lets through reaches
// the source store and MCU's argbFromHex. The contract is agreement with core:
// it must fire onChange for exactly the strings core's `isValidHex` accepts, no
// more. The first test cross-references `isValidHex` directly, so if anyone
// re-inlines a private regex that drifts from core's, it fails. The other two
// pin the documented buffering invariants. The focused-no-clobber path (onFocus
// captures the element and rAF-selects it) needs a real <input>; per the www
// testing shard we pin invariants over rendering-bound paths and leave it to E2E.

type Props = { value: string; onChange: (hex: string) => void }
type Return = ReturnType<typeof useHexFieldState>

const render = (onChange: (hex: string) => void, value = '#000000') =>
  renderHook<Return, Props>(({ value, onChange }) => useHexFieldState(value, onChange), {
    initialProps: { value, onChange },
  })

describe('useHexFieldState', () => {
  it('fires onChange for exactly the strings core isValidHex accepts', () => {
    const cases = ['#aabbcc', '#ABCDEF', '#abc', '#aabbccdd', 'aabbcc', '#xyzxyz', '#abcde', '']
    for (const next of cases) {
      const onChange = vi.fn()
      const { result } = render(onChange)
      act(() => result.current.handleChange(next))
      if (isValidHex(next)) {
        expect(onChange).toHaveBeenCalledTimes(1)
        expect(onChange).toHaveBeenCalledWith(next)
      } else {
        expect(onChange).not.toHaveBeenCalled()
      }
    }
  })

  it('buffers every keystroke into hexInput, even invalid intermediates', () => {
    const onChange = vi.fn()
    const { result } = render(onChange)

    act(() => result.current.handleChange('#ff'))
    expect(result.current.hexInput).toBe('#ff')
    expect(onChange).not.toHaveBeenCalled()

    act(() => result.current.handleChange('#ff0000'))
    expect(result.current.hexInput).toBe('#ff0000')
    expect(onChange).toHaveBeenCalledWith('#ff0000')
  })

  it('syncs an external value change into the buffer while unfocused', () => {
    const onChange = vi.fn()
    const { result, rerender } = render(onChange)
    expect(result.current.hexInput).toBe('#000000')

    rerender({ value: '#111111', onChange })
    expect(result.current.hexInput).toBe('#111111')
  })
})
