import { useInsertionEffect, useRef } from 'react'

// why: hold the latest handler on a ref so the returned function stays
// referentially stable across renders. Sync via useInsertionEffect (not
// during render) so a discarded Concurrent render can't leave a stale
// handler that the next event handler would call. Adapted from
// react-colorful (MIT).
export function useEventCallback<T>(handler?: (value: T) => void): (value: T) => void {
  const callbackRef = useRef(handler)
  const fn = useRef((value: T) => {
    if (callbackRef.current) callbackRef.current(value)
  })
  useInsertionEffect(() => {
    callbackRef.current = handler
  })
  return fn.current
}
