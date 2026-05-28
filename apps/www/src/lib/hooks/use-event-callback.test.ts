import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useEventCallback } from './use-event-callback'

// why: useEventCallback's whole point is the stable reference + latest-handler
// guarantee — the foundational invariants for any caller that passes it into
// a stable-identity slot (effect dep, memoised child prop). Pinning these
// also acts as the renderHook smoke test for the www testing foundation.

type Props = { handler: (value: number) => void }

describe('useEventCallback', () => {
  it('returns a referentially stable function across renders', () => {
    const { result, rerender } = renderHook<(value: number) => void, Props>(
      ({ handler }) => useEventCallback(handler),
      { initialProps: { handler: vi.fn() } },
    )

    const first = result.current
    rerender({ handler: vi.fn() })
    rerender({ handler: vi.fn() })

    expect(result.current).toBe(first)
  })

  it('invokes the latest handler after a re-render', () => {
    const a = vi.fn()
    const b = vi.fn()
    const { result, rerender } = renderHook<(value: number) => void, Props>(
      ({ handler }) => useEventCallback(handler),
      { initialProps: { handler: a } },
    )

    act(() => result.current(1))
    rerender({ handler: b })
    act(() => result.current(2))

    expect(a).toHaveBeenCalledTimes(1)
    expect(a).toHaveBeenCalledWith(1)
    expect(b).toHaveBeenCalledTimes(1)
    expect(b).toHaveBeenCalledWith(2)
  })

  it('is a no-op when no handler is provided', () => {
    const { result } = renderHook(() => useEventCallback<number>())
    expect(() => result.current(0)).not.toThrow()
  })
})
