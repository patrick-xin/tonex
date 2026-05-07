// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDebouncedStorage } from './persist-storage'

interface MockStorage {
  getItem: ReturnType<typeof vi.fn>
  setItem: ReturnType<typeof vi.fn>
  removeItem: ReturnType<typeof vi.fn>
  data: Map<string, string>
}

function makeMockStorage(): MockStorage {
  const data = new Map<string, string>()
  return {
    data,
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      data.set(key, value)
    }),
    removeItem: vi.fn((key: string) => {
      data.delete(key)
    }),
  }
}

describe('createDebouncedStorage', () => {
  let mock: MockStorage

  beforeEach(() => {
    vi.useFakeTimers()
    mock = makeMockStorage()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // why: load-bearing assertion for issue #9 — the whole point of this
  // wrapper is to coalesce per-tick writes. If 12 setItem calls produce 12
  // underlying setItem calls, the wrapper is broken.
  it('coalesces multiple setItem within delay into one underlying write', () => {
    const storage = createDebouncedStorage({
      storage: mock,
      delayMs: 200,
      attachLifecycleFlush: false,
    })
    for (let i = 0; i < 12; i++) {
      storage.setItem('tonex', `value-${i}`)
    }
    expect(mock.setItem).not.toHaveBeenCalled()

    vi.advanceTimersByTime(200)
    expect(mock.setItem).toHaveBeenCalledTimes(1)
    expect(mock.setItem).toHaveBeenCalledWith('tonex', 'value-11')
  })

  it('writes the most recent value on trailing edge', () => {
    const storage = createDebouncedStorage({
      storage: mock,
      delayMs: 100,
      attachLifecycleFlush: false,
    })
    storage.setItem('tonex', 'first')
    vi.advanceTimersByTime(50)
    storage.setItem('tonex', 'second')
    vi.advanceTimersByTime(50)
    storage.setItem('tonex', 'third')
    expect(mock.setItem).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    expect(mock.setItem).toHaveBeenCalledTimes(1)
    expect(mock.setItem).toHaveBeenCalledWith('tonex', 'third')
  })

  // why: getItem reads through to the underlying storage. Pin this so a
  // future "optimization" that returns the in-flight pending value can't
  // land silently — that pattern shadows direct localStorage mutations
  // (tools, tests, manual cleanup) and produces hard-to-trace stale reads.
  // The persist middleware only calls getItem at rehydrate, before any
  // setItem can fire, so reading through is correct in production.
  it('getItem reads through to underlying storage even when a write is pending', () => {
    mock.data.set('tonex', 'persisted-old')
    const storage = createDebouncedStorage({
      storage: mock,
      delayMs: 200,
      attachLifecycleFlush: false,
    })
    storage.setItem('tonex', 'pending-new')
    expect(storage.getItem('tonex')).toBe('persisted-old')

    vi.advanceTimersByTime(200)
    expect(storage.getItem('tonex')).toBe('pending-new')
  })

  // why: removeItem must also cancel pending writes for the same key,
  // otherwise reset() would persist a resurrected blob 200ms later. Pin
  // the cancel + remove ordering.
  it('removeItem cancels pending write and removes from underlying storage', () => {
    const storage = createDebouncedStorage({
      storage: mock,
      delayMs: 200,
      attachLifecycleFlush: false,
    })
    storage.setItem('tonex', 'pending')
    storage.removeItem('tonex')

    vi.advanceTimersByTime(200)
    expect(mock.setItem).not.toHaveBeenCalled()
    expect(mock.removeItem).toHaveBeenCalledWith('tonex')
  })

  it('__flush writes pending immediately and cancels timer', () => {
    const storage = createDebouncedStorage({
      storage: mock,
      delayMs: 1000,
      attachLifecycleFlush: false,
    })
    storage.setItem('tonex', 'pending')
    storage.__flush()
    expect(mock.setItem).toHaveBeenCalledTimes(1)
    expect(mock.setItem).toHaveBeenCalledWith('tonex', 'pending')

    vi.advanceTimersByTime(1000)
    expect(mock.setItem).toHaveBeenCalledTimes(1)
  })

  it('__flush is a no-op when nothing is pending', () => {
    const storage = createDebouncedStorage({
      storage: mock,
      delayMs: 200,
      attachLifecycleFlush: false,
    })
    storage.__flush()
    expect(mock.setItem).not.toHaveBeenCalled()
  })

  it('storage failures are swallowed (drag is a poor place to surface IO errors)', () => {
    const failing: MockStorage = {
      ...makeMockStorage(),
      setItem: vi.fn(() => {
        throw new Error('QuotaExceededError')
      }),
    }
    const storage = createDebouncedStorage({
      storage: failing,
      delayMs: 100,
      attachLifecycleFlush: false,
    })
    storage.setItem('tonex', 'value')
    expect(() => vi.advanceTimersByTime(100)).not.toThrow()
  })

  // why: pin the trailing-debounce semantics — sparse writes (gaps > delay)
  // each get their own flush. Without this test, a regression to leading-edge
  // or "first wins" could pass everything else above.
  it('sparse setItems separated by more than delay each flush independently', () => {
    const storage = createDebouncedStorage({
      storage: mock,
      delayMs: 100,
      attachLifecycleFlush: false,
    })
    storage.setItem('tonex', 'a')
    vi.advanceTimersByTime(150)
    storage.setItem('tonex', 'b')
    vi.advanceTimersByTime(150)

    expect(mock.setItem).toHaveBeenCalledTimes(2)
    expect(mock.setItem).toHaveBeenNthCalledWith(1, 'tonex', 'a')
    expect(mock.setItem).toHaveBeenNthCalledWith(2, 'tonex', 'b')
  })
})

describe('createDebouncedStorage lifecycle flush', () => {
  // why: jsdom-environment test for the pagehide / visibilitychange path.
  // Pure-Node test above can't verify event wiring.
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('pagehide event flushes pending write', () => {
    const mock = makeMockStorage()
    const storage = createDebouncedStorage({
      storage: mock,
      delayMs: 1000,
      attachLifecycleFlush: true,
    })
    storage.setItem('tonex', 'about-to-close-tab')
    expect(mock.setItem).not.toHaveBeenCalled()

    window.dispatchEvent(new Event('pagehide'))
    expect(mock.setItem).toHaveBeenCalledWith('tonex', 'about-to-close-tab')
  })
})
